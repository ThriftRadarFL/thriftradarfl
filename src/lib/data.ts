import { promises as fs } from "fs";
import path from "path";
import { HttpError } from "./api";
import { seedVenues, mockSales } from "./seed-data";
import { hasDb } from "@/db";
import * as pg from "./db-store";
import { dealRules as seedDealRules, ruleId, type DealRule } from "./deal-rules";

export type Venue = Omit<(typeof seedVenues)[number], "hoursJson" | "phone" | "type" | "sourceUrl"> & { type: string; phone: string | null; hoursJson: Record<string, string> | null; sourceUrl?: string };
export type SaleDay = { date: string; start: string; end: string; discountPct: number };
export type Sale = { slug: string; title: string; type: string; city: string; zip: string; lat: number; lng: number; sourceUrl: string; paymentMethods: string[]; days: SaleDay[]; published?: boolean; description?: string; tags?: string[] };

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
// Tunable: DB_TIMEOUT_MS (default 1500) per query, DB_BACKOFF_MS (default 5 min) before retrying a down DB.
const DB_TIMEOUT_MS = Number(process.env.DB_TIMEOUT_MS) || 1500; const DB_BACKOFF_MS = Number(process.env.DB_BACKOFF_MS) || 300_000;
let dbDownUntil = 0; let lastDbError = "";
async function viaDb<T>(dbFn: () => Promise<T>, jsonFn: () => Promise<T>): Promise<T> {
  if (!hasDb || Date.now() < dbDownUntil) return jsonFn();
  try {
    let timer: NodeJS.Timeout | undefined;
    const timeout = new Promise<never>((_, rej) => { timer = setTimeout(() => rej(new Error("db timeout")), DB_TIMEOUT_MS); });
    try { return await Promise.race([dbFn(), timeout]); } finally { clearTimeout(timer); }
  } catch (e) {
    const err = e as { code?: string; message?: string; cause?: { code?: string } };
    lastDbError = err.cause?.code ?? err.code ?? String(err.message ?? e).slice(0, 40);
    if (Date.now() >= dbDownUntil) console.warn(`[data] database unreachable (${lastDbError}); using JSON fallback`);
    dbDownUntil = Date.now() + DB_BACKOFF_MS; return jsonFn();
  }
}
export const dbStatus = () => ({ configured: hasDb, up: hasDb && Date.now() >= dbDownUntil, lastError: lastDbError || null });

const jsonSales = () => readJson<Sale[]>(salesFile, mockSales as Sale[]);
const bySoonest = (s: Sale[]) => [...s].sort((a, b) => (a.days[0]?.date ?? "").localeCompare(b.days[0]?.date ?? ""));
export async function getVenues(): Promise<Venue[]> { return viaDb(() => pg.dbGetVenues(), () => readJson<Venue[]>(venuesFile, seedVenues as Venue[])); }
export async function getVenue(slug: string) { return (await getVenues()).find((v) => v.slug === slug) ?? null; }
/** All sales including unpublished drafts (admin). */
export async function getAllSales(): Promise<Sale[]> { return bySoonest(await viaDb(() => pg.dbGetSales(), jsonSales)); }
/** Public sales: published only. */
export async function getSales(): Promise<Sale[]> { return (await getAllSales()).filter((s) => s.published !== false); }
export async function getSale(slug: string) { return (await getSales()).find((s) => s.slug === slug) ?? null; }

export async function upsertSale(sale: Sale) {
  return viaDb(() => pg.dbUpsertSale(sale), () => mutate<Sale[]>(salesFile, mockSales as Sale[], (all) => [...all.filter((s) => s.slug !== sale.slug), sale]));
}
export async function setSalePublished(slug: string, published: boolean) {
  const s = (await getAllSales()).find((x) => x.slug === slug); if (!s) return false; await upsertSale({ ...s, published }); return true;
}
export async function deleteSale(slug: string) {
  return viaDb(() => pg.dbDeleteSale(slug), () => mutate<Sale[]>(salesFile, mockSales as Sale[], (all) => all.filter((s) => s.slug !== slug)));
}
export async function upsertVenue(v: Venue) {
  return viaDb(() => pg.dbUpsertVenue(v), () => mutate<Venue[]>(venuesFile, seedVenues as Venue[], (all) => [...all.filter((x) => x.slug !== v.slug), v]));
}
export async function deleteVenue(slug: string) {
  await viaDb(() => pg.dbDeleteVenue(slug), () => mutate<Venue[]>(venuesFile, seedVenues as Venue[], (all) => all.filter((x) => x.slug !== slug)));
  if (!hasDb || Date.now() < dbDownUntil) await mutate<DealRule[]>(rulesFile, seedDealRules, (all) => all.filter((r) => r.venue !== slug)); // DB cascades via FK
}

// Deal rules: JSON-backed (seeded from deal-rules.ts) so admins can edit them.
const rulesFile = path.join(DATA_DIR, "deal-rules.json");
export async function getDealRules(): Promise<DealRule[]> { return viaDb(() => pg.dbGetDealRules(), async () => (await readJson<DealRule[]>(rulesFile, seedDealRules)).map((r) => ({ ...r, id: r.id || ruleId(r) }))); }
const withIds = (rs: DealRule[]) => rs.map((r) => ({ ...r, id: r.id || ruleId(r) }));
export async function upsertDealRule(r: DealRule) { await viaDb(() => pg.dbUpsertDealRule(r), () => mutate<DealRule[]>(rulesFile, seedDealRules, (all) => [...withIds(all).filter((x) => x.id !== r.id), r].sort((a, b) => a.day - b.day))); }
export async function deleteDealRule(id: string) { return viaDb(() => pg.dbDeleteDealRule(id), () => mutate<DealRule[], boolean>(rulesFile, seedDealRules, (all) => { const w = withIds(all); return { next: w.filter((x) => x.id !== id), result: w.some((x) => x.id === id) }; })); }

// Public submissions → pending queue reviewed in /admin.
export type Submission = { id: string; at: string; email: string; sale: Sale };
const subsFile = path.join(DATA_DIR, "submissions.json");
export const listSubmissions = () => viaDb(() => pg.dbListSubmissions(), () => readJson<Submission[]>(subsFile, []));
export async function addSubmission(sale: Sale, email: string) {
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const sub: Submission = { id, at: new Date().toISOString(), email, sale: { ...sale, published: false } };
  await viaDb(() => pg.dbAddSubmission(sub), () => mutate<Submission[]>(subsFile, [], (list) => [...list, sub])); return id;
}
export async function resolveSubmission(id: string, approve: boolean) {
  const s = await viaDb(() => pg.dbTakeSubmission(id), () => mutate<Submission[], Submission | undefined>(subsFile, [], (list) => ({ next: list.filter((x) => x.id !== id), result: list.find((x) => x.id === id) })));
  if (!s) return null; if (approve) await upsertSale({ ...s.sale, published: true }); return s.sale.slug;
}

// Contact form messages (stored locally; no email sent).
export type ContactMsg = { id: string; at: string; name: string; email: string; message: string };
const contactFile = path.join(DATA_DIR, "contact.json");
export const listContacts = () => viaDb(() => pg.dbListContacts(), () => readJson<ContactMsg[]>(contactFile, []));
export async function addContact(m: Omit<ContactMsg, "id" | "at">) {
  const msg: ContactMsg = { ...m, id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, at: new Date().toISOString() };
  await viaDb(() => pg.dbAddContact(msg), () => mutate<ContactMsg[]>(contactFile, [], (l) => [...l, msg]));
}
export async function deleteContact(id: string) { await viaDb(() => pg.dbDeleteContact(id), () => mutate<ContactMsg[]>(contactFile, [], (l) => l.filter((x) => x.id !== id))); }

const subsJson = path.join(DATA_DIR, "digest-subscribers.json");
type Sub = { email: string; area: string; at: string };
export async function addDigestSubscriber(email: string, area: string) {
  return viaDb(() => pg.dbAddSubscriber(email, area), () => mutate<Sub[], boolean>(subsJson, [], (list) =>
    list.some((x) => x.email.toLowerCase() === email.toLowerCase()) ? { next: list, result: false } : { next: [...list, { email, area, at: new Date().toISOString() }], result: true }));
}
export async function listSubscribers(): Promise<Sub[]> { return viaDb(() => pg.dbListSubscribers(), () => readJson<Sub[]>(subsJson, [])); }
export async function removeSubscriber(email: string) {
  return viaDb(() => pg.dbRemoveSubscriber(email), () => mutate<Sub[], boolean>(subsJson, [], (list) => {
    const next = list.filter((x) => x.email.toLowerCase() !== email.toLowerCase()); return { next, result: next.length !== list.length }; }));
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
  try { await viaDb(() => pg.dbAudit(e), () => mutate<AuditEntry[]>(auditFile, [], (l) => [e, ...l].slice(0, 2000))); } catch (err) { console.warn("[audit]", (err as Error).message); }
}
export const listAudit = (limit = 200) => viaDb(() => pg.dbListAudit(limit), async () => (await readJson<AuditEntry[]>(auditFile, [])).slice(0, limit));
