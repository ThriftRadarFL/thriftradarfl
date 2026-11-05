import { promises as fs } from "fs";
import path from "path";
import { HttpError } from "./api";
import { seedVenues, mockSales } from "./seed-data";
import { hasDb, resetDb } from "@/db";
import * as pg from "./db-store";
import { dealRules as seedDealRules, ruleId, type DealRule } from "./deal-rules";

export type Venue = Omit<(typeof seedVenues)[number], "hoursJson" | "phone" | "type" | "sourceUrl"> & { type: string; phone: string | null; hoursJson: Record<string, string> | null; sourceUrl?: string };
export type SaleDay = { date: string; start: string; end: string; discountPct: number };
export type Sale = { slug: string; title: string; type: string; city: string; zip: string; lat: number; lng: number; sourceUrl: string; paymentMethods: string[]; days: SaleDay[]; published?: boolean; description?: string; tags?: string[]; /** ISO time the listing was first added (DB created_at); undefined for legacy rows. */ addedAt?: string };

const DATA_DIR = process.env.THRIFTRADAR_DATA_DIR ?? path.join(process.cwd(), "data");
const salesFile = path.join(DATA_DIR, "sales.json");
const venuesFile = path.join(DATA_DIR, "venues.json");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try { return JSON.parse(await fs.readFile(file, "utf8")) as T; } catch { return fallback; }
}
// On read-only serverless filesystems (Vercel, EROFS/EACCES) JSON writes can't persist: surface a clear 503 instead of a 500.
export function storageError(e: unknown): Error {
  const code = (e as { code?: string })?.code;
  if (code === "EROFS" || code === "EACCES" || code === "EPERM" || code === "ENOENT") return new HttpError(503, "Saving is temporarily unavailable: the database is offline and this server's storage is read-only. Please try again later.", { code });
  return e as Error;
}
let chain: Promise<unknown> = Promise.resolve();
// Read-modify-write is serialized (one global queue) and atomic (tmp file + rename) so concurrent writes never lose updates or corrupt JSON.
function mutate<T, R = void>(file: string, fallback: T, fn: (cur: T) => { next: T; result?: R } | T): Promise<R> {
  const run = async () => {
    const cur = await readJson<T>(file, fallback); const out = fn(cur);
    const { next, result } = (out && typeof out === "object" && "next" in (out as object) ? out : { next: out }) as { next: T; result?: R };
    const tmp = `${file}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
    try { await fs.mkdir(DATA_DIR, { recursive: true }); await fs.writeFile(tmp, JSON.stringify(next, null, 2) + "\n"); await fs.rename(tmp, file); }
    catch (e) { await fs.unlink(tmp).catch(() => {}); throw storageError(e); }
    return result as R;
  };
  const p = chain.then(run, run); chain = p.catch(() => {}); return p;
}

// DB is used when DATABASE_URL is set AND reachable. Any DB error (timeout, protocol, auth) marks it down for 60s and
// transparently falls back to the JSON files so builds and pages never break because the database is unreachable.
// Tunable: DB_TIMEOUT_MS (default 8000) per query (one retry on a fresh pool), DB_BACKOFF_MS (default 30s) before retrying a down DB.
const DB_TIMEOUT_MS = Number(process.env.DB_TIMEOUT_MS) || 8000; const DB_BACKOFF_MS = Number(process.env.DB_BACKOFF_MS) || 30_000;
let dbDownUntil = 0; let dbFails = 0; let lastDbError = ""; let lastDbMessage = "";
/** Strict writes: when a DB is configured in production (or DB_STRICT_WRITES=1), a failed DB write is a 503 — never a silent
 *  JSON write that would vanish on the next deploy / differ per serverless instance. DB_STRICT_WRITES=0 opts out. */
export const strictWrites = () => hasDb && (process.env.DB_STRICT_WRITES === "1" || (process.env.NODE_ENV === "production" && process.env.DB_STRICT_WRITES !== "0"));
const dbOffline = () => new HttpError(503, "Saving is temporarily unavailable: the database is offline. Please try again in a few minutes.", { code: "DB_DOWN" });
async function viaDb<T>(dbFn: () => Promise<T>, jsonFn: () => Promise<T>, write = false): Promise<T> {
  if (write && strictWrites() && Date.now() < dbDownUntil) throw dbOffline();
  if (!hasDb || Date.now() < dbDownUntil) return jsonFn();
  const attempt = async (ms: number) => {
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, rej) => { timer = setTimeout(() => rej(new Error("db timeout")), ms); });
    try { return await Promise.race([dbFn(), timeout]); } finally { clearTimeout(timer); }
  };
  try {
    try { const out = await attempt(DB_TIMEOUT_MS); dbFails = 0; return out; } catch (e) {
      // Reads only: cold starts and frozen isolates often hang on a stale pooled socket until our timeout. Always drop the
      // pool before retrying (timeouts included — Promise.race does not cancel the hung query, so the old client keeps the
      // dead socket). Postgres SQLSTATE errors are real query errors and are not retried; writes are never retried.
      const code = String((e as { code?: string }).code ?? ""); if (write || /^[0-9A-Z]{5}$/.test(code)) throw e;
      resetDb();
      const out = await attempt(DB_TIMEOUT_MS * 2); dbFails = 0; return out;
    }
  } catch (e) {
    const err = e as { code?: string; message?: string; cause?: { code?: string; message?: string } };
    lastDbError = err.cause?.code ?? err.code ?? String(err.message ?? e).slice(0, 40);
    // Postgres message (e.g. 'column "x" does not exist') with any URL/credential-looking text scrubbed
    lastDbMessage = String(err.cause?.message ?? err.message ?? e).replace(/\b[a-z]+:\/\/\S+/gi, "<url>").replace(/(password|token|key|secret)\S*/gi, "<redacted>").slice(0, 160);
    if (Date.now() >= dbDownUntil) console.warn(`[data] database unreachable (${lastDbError}); using JSON fallback`);
    // One slow request (timeout) falls back alone; refused/unknown-host/auth errors or 2 failures in a row put this instance in JSON mode for DB_BACKOFF_MS.
    const hard = /^(ECONNREFUSED|ENOTFOUND|EAI_AGAIN|28P01|28000|3D000)$/.test(String(lastDbError)); // DB really unreachable / bad creds
    if (++dbFails >= 2 || hard) dbDownUntil = Date.now() + DB_BACKOFF_MS; if (write && strictWrites()) throw dbOffline(); return jsonFn();
  }
}
export const dbStatus = () => ({ configured: hasDb, up: hasDb && Date.now() >= dbDownUntil, lastError: lastDbError || null, lastErrorMessage: lastDbMessage || null });

const jsonSales = () => readJson<Sale[]>(salesFile, mockSales as Sale[]);
const bySoonest = (s: Sale[]) => [...s].sort((a, b) => (a.days[0]?.date ?? "").localeCompare(b.days[0]?.date ?? ""));
// Deduplicate concurrent identical lookups (Next may run generateMetadata + page in parallel on one isolate).
const inflight = new Map<string, Promise<unknown>>();
function once<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const hit = inflight.get(key) as Promise<T> | undefined; if (hit) return hit;
  const p = fn().finally(() => { if (inflight.get(key) === p) inflight.delete(key); });
  inflight.set(key, p); return p;
}
export async function getVenues(): Promise<Venue[]> { return viaDb(() => pg.dbGetVenues(), () => readJson<Venue[]>(venuesFile, seedVenues as Venue[])); }
export async function getVenue(slug: string) {
  return once(`venue:${slug}`, () => viaDb(
    () => pg.dbGetVenue(slug),
    async () => (await readJson<Venue[]>(venuesFile, seedVenues as Venue[])).find((v) => v.slug === slug) ?? null,
  ));
}
/** All sales including unpublished drafts (admin). */
export async function getAllSales(): Promise<Sale[]> { return bySoonest(await viaDb(() => pg.dbGetSales(), jsonSales)); }
/** Public sales: published only. */
export async function getSales(): Promise<Sale[]> { return (await getAllSales()).filter((s) => s.published !== false); }
/** Single public sale by slug (targeted DB lookup — avoids loading every sale on /sales/[slug]). */
export async function getSale(slug: string) {
  return once(`sale:${slug}`, () => viaDb(
    async () => { const s = await pg.dbGetSale(slug); return s && s.published !== false ? s : null; },
    async () => (await jsonSales()).find((s) => s.slug === slug && s.published !== false) ?? null,
  ));
}

export async function upsertSale(sale: Sale) {
  return viaDb(() => pg.dbUpsertSale(sale), () => mutate<Sale[]>(salesFile, mockSales as Sale[], (all) => {
    const prev = all.find((s) => s.slug === sale.slug); // first-added time is sticky across edits
    return [...all.filter((s) => s.slug !== sale.slug), { ...sale, addedAt: prev?.addedAt ?? sale.addedAt ?? new Date().toISOString() }]; }), true);
}
export async function setSalePublished(slug: string, published: boolean) {
  const s = (await getAllSales()).find((x) => x.slug === slug); if (!s) return false; await upsertSale({ ...s, published }); return true;
}
export async function deleteSale(slug: string) {
  return viaDb(() => pg.dbDeleteSale(slug), () => mutate<Sale[]>(salesFile, mockSales as Sale[], (all) => all.filter((s) => s.slug !== slug)), true);
}
export async function upsertVenue(v: Venue) {
  return viaDb(() => pg.dbUpsertVenue(v), () => mutate<Venue[]>(venuesFile, seedVenues as Venue[], (all) => [...all.filter((x) => x.slug !== v.slug), v]), true);
}
export async function deleteVenue(slug: string) {
  await viaDb(() => pg.dbDeleteVenue(slug), () => mutate<Venue[]>(venuesFile, seedVenues as Venue[], (all) => all.filter((x) => x.slug !== slug)), true);
  if (!hasDb || Date.now() < dbDownUntil) await mutate<DealRule[]>(rulesFile, seedDealRules, (all) => all.filter((r) => r.venue !== slug)); // DB cascades via FK
}

// Deal rules: JSON-backed (seeded from deal-rules.ts) so admins can edit them.
const rulesFile = path.join(DATA_DIR, "deal-rules.json");
export async function getDealRules(): Promise<DealRule[]> { return viaDb(() => pg.dbGetDealRules(), async () => (await readJson<DealRule[]>(rulesFile, seedDealRules)).map((r) => ({ ...r, id: r.id || ruleId(r) }))); }
const withIds = (rs: DealRule[]) => rs.map((r) => ({ ...r, id: r.id || ruleId(r) }));
export async function upsertDealRule(r: DealRule) { await viaDb(() => pg.dbUpsertDealRule(r), () => mutate<DealRule[]>(rulesFile, seedDealRules, (all) => [...withIds(all).filter((x) => x.id !== r.id), r].sort((a, b) => a.day - b.day)), true); }
export async function deleteDealRule(id: string) { return viaDb(() => pg.dbDeleteDealRule(id), () => mutate<DealRule[], boolean>(rulesFile, seedDealRules, (all) => { const w = withIds(all); return { next: w.filter((x) => x.id !== id), result: w.some((x) => x.id === id) }; }), true); }

// Public submissions → pending queue reviewed in /admin.
export type Submission = { id: string; at: string; email: string; sale: Sale };
const subsFile = path.join(DATA_DIR, "submissions.json");
export const listSubmissions = () => viaDb(() => pg.dbListSubmissions(), () => readJson<Submission[]>(subsFile, []));
export async function addSubmission(sale: Sale, email: string) {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const sub: Submission = { id, at: new Date().toISOString(), email, sale: { ...sale, published: false } };
  await viaDb(() => pg.dbAddSubmission(sub), () => mutate<Submission[]>(subsFile, [], (list) => [...list, sub]), true); return id;
}
export async function resolveSubmission(id: string, approve: boolean) {
  const s = await viaDb(() => pg.dbTakeSubmission(id), () => mutate<Submission[], Submission | undefined>(subsFile, [], (list) => ({ next: list.filter((x) => x.id !== id), result: list.find((x) => x.id === id) })), true);
  if (!s) return null; if (approve) await upsertSale({ ...s.sale, published: true }); return s.sale.slug;
}

// Contact form messages (stored locally; no email sent).
export type ContactMsg = { id: string; at: string; name: string; email: string; message: string };
const contactFile = path.join(DATA_DIR, "contact.json");
export const listContacts = () => viaDb(() => pg.dbListContacts(), () => readJson<ContactMsg[]>(contactFile, []));
export async function addContact(m: Omit<ContactMsg, "id" | "at">) {
  const msg: ContactMsg = { ...m, id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, at: new Date().toISOString() };
  await viaDb(() => pg.dbAddContact(msg), () => mutate<ContactMsg[]>(contactFile, [], (l) => [...l, msg]), true);
}
export async function deleteContact(id: string) { await viaDb(() => pg.dbDeleteContact(id), () => mutate<ContactMsg[]>(contactFile, [], (l) => l.filter((x) => x.id !== id)), true); }

const subsJson = path.join(DATA_DIR, "digest-subscribers.json");
export type Sub = { email: string; area: string; at: string; /** Estate-sale keyword alerts (stored in subscribers.interests). */ keywords?: string[] };
/** Adds a subscriber (true) or, if the email exists, replaces its keyword alerts when any were given (false). */
export async function addDigestSubscriber(email: string, area: string, keywords: string[] = []) {
  return viaDb(() => pg.dbAddSubscriber(email, area, keywords), () => mutate<Sub[], boolean>(subsJson, [], (list) => {
    const i = list.findIndex((x) => x.email.toLowerCase() === email.toLowerCase());
    if (i < 0) return { next: [...list, { email, area, at: new Date().toISOString(), ...(keywords.length ? { keywords } : {}) }], result: true };
    if (!keywords.length) return { next: list, result: false };
    const next = list.slice(); next[i] = { ...next[i], keywords }; return { next, result: false };
  }), true);
}
export async function listSubscribers(): Promise<Sub[]> { return viaDb(() => pg.dbListSubscribers(), () => readJson<Sub[]>(subsJson, [])); }
export async function removeSubscriber(email: string) {
  return viaDb(() => pg.dbRemoveSubscriber(email), () => mutate<Sub[], boolean>(subsJson, [], (list) => {
    const next = list.filter((x) => x.email.toLowerCase() !== email.toLowerCase()); return { next, result: next.length !== list.length }; }), true);
}
export const citySlug = (city: string) => city.toLowerCase().replace(/\s+/g, "-");
export const CITIES: Record<string, string> = {
  "port-orange": "Port Orange", "daytona-beach": "Daytona Beach", deland: "DeLand", "new-smyrna-beach": "New Smyrna Beach", "ormond-beach": "Ormond Beach",
};
export const dataMode = () => (hasDb && Date.now() >= dbDownUntil ? "postgres" : "json");

// Audit log of admin actions (newest first). Never throws — auditing must not block the action.
export type AuditEntry = { at: string; action: string; target: string; detail: string };
const auditFile = path.join(DATA_DIR, "audit.json");
export async function audit(action: string, target = "", detail = "") {
  const e: AuditEntry = { at: new Date().toISOString(), action, target, detail: detail.slice(0, 500) };
  try { await viaDb(() => pg.dbAudit(e), () => mutate<AuditEntry[]>(auditFile, [], (l) => [e, ...l].slice(0, 2000)), true); } catch (err) { console.warn("[audit]", (err as Error).message); }
}
export const listAudit = (limit = 200) => viaDb(() => pg.dbListAudit(limit), async () => (await readJson<AuditEntry[]>(auditFile, [])).slice(0, limit));

// Crowdsourced color-tag reports. Isolated from viaDb's global "DB down" switch: if only this table is missing/broken
// (e.g. migration 0006 not applied yet), the rest of the site keeps reading Postgres; reads fall back to JSON, writes 503 when strict.
import { pruneReports, type TagReport, type TagStatus } from "./color-tags";
const _todayET = () => new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
const tagsFile = path.join(DATA_DIR, "color-tags.json");
async function viaDbTags<T>(dbFn: () => Promise<T>, jsonFn: () => Promise<T>, write = false): Promise<T> {
  if (!hasDb || Date.now() < dbDownUntil) { if (write && strictWrites()) throw dbOffline(); return jsonFn(); }
  try { return await dbFn(); } catch (e) {
    console.warn("[color-tags] db error:", String((e as Error)?.message ?? e).replace(/\b[a-z]+:\/\/\S+/gi, "<url>").slice(0, 120));
    if (write && strictWrites()) throw dbOffline(); return jsonFn();
  }
}
const tagSince = () => { const d = new Date(_todayET() + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() - 28); return d.toISOString().slice(0, 10); };
export const listTagReports = () => viaDbTags(() => pg.dbListTagReports(tagSince()), async () => pruneReports(await readJson<TagReport[]>(tagsFile, []), _todayET()).sort((a, b) => b.at.localeCompare(a.at)));
export async function addTagReport(r: Omit<TagReport, "id" | "at" | "status">) {
  const rep: TagReport = { ...r, id: `ct-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, at: new Date().toISOString(), status: "pending" };
  await viaDbTags(() => pg.dbAddTagReport(rep), () => mutate<TagReport[]>(tagsFile, [], (l) => [...pruneReports(l, _todayET()), rep]), true); return rep.id;
}
export const setTagStatus = (id: string, status: TagStatus) => viaDbTags(() => pg.dbSetTagStatus(id, status), () => mutate<TagReport[], boolean>(tagsFile, [], (l) => ({ next: l.map((x) => (x.id === id ? { ...x, status } : x)), result: l.some((x) => x.id === id) })), true);
export const deleteTagReport = (id: string) => viaDbTags(() => pg.dbDeleteTagReport(id), () => mutate<TagReport[], boolean>(tagsFile, [], (l) => ({ next: l.filter((x) => x.id !== id), result: l.some((x) => x.id === id) })), true);
