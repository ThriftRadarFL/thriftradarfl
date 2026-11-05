// Postgres (Drizzle) implementation of the data layer. Used automatically when DATABASE_URL is set.
import { eq, asc, inArray, sql } from "drizzle-orm";
import { getDb } from "@/db";
import * as t from "@/db/schema";
import type { Sale, Venue, Submission, ContactMsg } from "./data";
import { KIND_COLOR, ruleId, type DealRule } from "./deal-rules";

const D = () => { const db = getDb(); if (!db) throw new Error("DATABASE_URL not set"); return db; };
const hm = (x: string | null) => (x ?? "00:00").slice(0, 5);

export async function dbGetSales(): Promise<Sale[]> {
  const rows = await D().select().from(t.sales).orderBy(asc(t.sales.id));
  if (!rows.length) return [];
  const days = await D().select().from(t.saleDays).where(inArray(t.saleDays.saleId, rows.map((r) => r.id))).orderBy(asc(t.saleDays.date));
  return rows.map((r) => ({ slug: r.slug, title: r.title, type: r.type, city: r.city, zip: r.zip ?? "", lat: r.lat ?? 0, lng: r.lng ?? 0,
    sourceUrl: r.sourceUrl ?? "", paymentMethods: r.paymentMethods ?? [], published: r.published, addedAt: r.createdAt.toISOString(), ...(r.tags?.length ? { tags: r.tags } : {}), ...(r.description ? { description: r.description } : {}),
    days: days.filter((d) => d.saleId === r.id).map((d) => ({ date: String(d.date), start: hm(d.startTime), end: hm(d.endTime), discountPct: d.discountPct })) }));
}
export async function dbUpsertSale(s: Sale) {
  await D().transaction(async (tx) => {
    const vals = { slug: s.slug, title: s.title, type: s.type as (typeof t.saleType.enumValues)[number], city: s.city, zip: s.zip, lat: s.lat, lng: s.lng, sourceUrl: s.sourceUrl, paymentMethods: s.paymentMethods, published: s.published !== false, tags: s.tags ?? null, description: s.description ?? null, ...(s.published === false && s.sourceUrl === "" ? { source: "submitted" as const } : {}) };
    const [r] = await tx.insert(t.sales).values({ ...vals, ...(s.addedAt && !Number.isNaN(Date.parse(s.addedAt)) ? { createdAt: new Date(s.addedAt) } : {}) }).onConflictDoUpdate({ target: t.sales.slug, set: vals }).returning({ id: t.sales.id });
    await tx.delete(t.saleDays).where(eq(t.saleDays.saleId, r.id));
    if (s.days.length) await tx.insert(t.saleDays).values(s.days.map((d) => ({ saleId: r.id, date: d.date, startTime: d.start, endTime: d.end, discountPct: d.discountPct })));
  });
}
export async function dbDeleteSale(slug: string) { await D().delete(t.sales).where(eq(t.sales.slug, slug)); }

export async function dbGetSale(slug: string): Promise<Sale | null> {
  const [r] = await D().select().from(t.sales).where(eq(t.sales.slug, slug));
  if (!r) return null;
  const days = await D().select().from(t.saleDays).where(eq(t.saleDays.saleId, r.id)).orderBy(asc(t.saleDays.date));
  return { slug: r.slug, title: r.title, type: r.type, city: r.city, zip: r.zip ?? "", lat: r.lat ?? 0, lng: r.lng ?? 0,
    sourceUrl: r.sourceUrl ?? "", paymentMethods: r.paymentMethods ?? [], published: r.published, addedAt: r.createdAt.toISOString(), ...(r.tags?.length ? { tags: r.tags } : {}), ...(r.description ? { description: r.description } : {}),
    days: days.map((d) => ({ date: String(d.date), start: hm(d.startTime), end: hm(d.endTime), discountPct: d.discountPct })) };
}

export async function dbGetVenues(): Promise<Venue[]> {
  const rows = await D().select().from(t.venues).where(eq(t.venues.active, true)).orderBy(asc(t.venues.name));
  return rows.map((v) => ({ slug: v.slug, org: v.orgKey ?? "", name: v.name, type: v.type, address: v.address, city: v.city, zip: v.zip, lat: v.lat ?? 0, lng: v.lng ?? 0,
    phone: v.phone, hoursJson: (v.hoursJson as Record<string, string> | null) ?? null, notes: v.notes ?? "", ...(v.sourceUrl ? { sourceUrl: v.sourceUrl } : {}) }));
}
export async function dbGetVenue(slug: string): Promise<Venue | null> {
  const [v] = await D().select().from(t.venues).where(eq(t.venues.slug, slug));
  if (!v || !v.active) return null;
  return { slug: v.slug, org: v.orgKey ?? "", name: v.name, type: v.type, address: v.address, city: v.city, zip: v.zip, lat: v.lat ?? 0, lng: v.lng ?? 0,
    phone: v.phone, hoursJson: (v.hoursJson as Record<string, string> | null) ?? null, notes: v.notes ?? "", ...(v.sourceUrl ? { sourceUrl: v.sourceUrl } : {}) };
}
export async function dbUpsertVenue(v: Venue) {
  const vals = { slug: v.slug, name: v.name, type: v.type as (typeof t.venueType.enumValues)[number], address: v.address, city: v.city, zip: v.zip, lat: v.lat, lng: v.lng, phone: v.phone, hoursJson: v.hoursJson, notes: v.notes, sourceUrl: v.sourceUrl || null, orgKey: v.org || null };
  await D().insert(t.venues).values(vals).onConflictDoUpdate({ target: t.venues.slug, set: vals });
}
export async function dbDeleteVenue(slug: string) { await D().delete(t.venues).where(eq(t.venues.slug, slug)); }
export async function dbAddSubscriber(email: string, area: string, keywords: string[] = []) {
  const r = await D().insert(t.subscribers).values({ email: email.toLowerCase(), area, interests: keywords }).onConflictDoNothing().returning({ id: t.subscribers.id });
  if (!r.length && keywords.length) await D().update(t.subscribers).set({ interests: keywords }).where(eq(sql`lower(${t.subscribers.email})`, email.toLowerCase()));
  return r.length > 0;
}
export async function dbListSubscribers() {
  const r = await D().select().from(t.subscribers).orderBy(asc(t.subscribers.createdAt));
  return r.map((x) => ({ email: x.email, area: x.area ?? "", at: x.createdAt.toISOString(), ...(x.interests?.length ? { keywords: x.interests } : {}) }));
}
export async function dbRemoveSubscriber(email: string) {
  const r = await D().delete(t.subscribers).where(eq(sql`lower(${t.subscribers.email})`, email.toLowerCase())).returning({ id: t.subscribers.id }); return r.length > 0;
}

// --- Deal rules (venue slug ↔ venue_id; rule_key is the stable public id) ---
export async function dbGetDealRules(): Promise<DealRule[]> {
  const rows = await D().select({ r: t.dealRules, slug: t.venues.slug }).from(t.dealRules).innerJoin(t.venues, eq(t.dealRules.venueId, t.venues.id)).orderBy(asc(t.dealRules.dayOfWeek));
  return rows.map(({ r, slug }) => { const base = { venue: slug, day: r.dayOfWeek ?? 0, kind: r.kind, label: r.label ?? r.description ?? r.kind, color: r.color ?? KIND_COLOR[r.kind],
    verified: r.verified || !!r.verifiedAt, ...(r.startTime ? { time: hm(r.startTime) } : {}), ...(r.discountPct ? { discountPct: r.discountPct } : {}) };
    return { ...base, id: r.ruleKey ?? ruleId(base) }; });
}
export async function dbUpsertDealRule(r: DealRule) {
  const [v] = await D().select({ id: t.venues.id }).from(t.venues).where(eq(t.venues.slug, r.venue)); if (!v) throw new Error(`unknown venue ${r.venue}`);
  const vals = { ruleKey: r.id ?? ruleId(r), venueId: v.id, kind: r.kind, dayOfWeek: r.day, startTime: r.time ?? null, color: r.color, discountPct: r.discountPct ?? null, label: r.label, description: r.label, verified: r.verified, verifiedAt: r.verified ? new Date() : null };
  await D().insert(t.dealRules).values(vals).onConflictDoUpdate({ target: t.dealRules.ruleKey, set: vals });
}
export async function dbDeleteDealRule(id: string) { const r = await D().delete(t.dealRules).where(eq(t.dealRules.ruleKey, id)).returning({ id: t.dealRules.id }); return r.length > 0; }

export async function dbListSubmissions(): Promise<Submission[]> {
  const r = await D().select().from(t.submissions).orderBy(asc(t.submissions.createdAt));
  return r.map((x) => ({ id: x.id, email: x.email, at: x.createdAt.toISOString(), sale: x.sale as Submission["sale"] }));
}
export async function dbAddSubmission(s: Submission) { await D().insert(t.submissions).values({ id: s.id, email: s.email, sale: s.sale, createdAt: new Date(s.at) }); }
export async function dbTakeSubmission(id: string) { const [r] = await D().delete(t.submissions).where(eq(t.submissions.id, id)).returning(); return r ? { id: r.id, email: r.email, at: r.createdAt.toISOString(), sale: r.sale as Submission["sale"] } : undefined; }

export async function dbListContacts(): Promise<ContactMsg[]> {
  const r = await D().select().from(t.contactMessages).orderBy(asc(t.contactMessages.createdAt));
  return r.map((x) => ({ id: x.id, name: x.name, email: x.email, message: x.message, at: x.createdAt.toISOString() }));
}
export async function dbAddContact(m: ContactMsg) { await D().insert(t.contactMessages).values({ ...m, createdAt: new Date(m.at) }); }
export async function dbDeleteContact(id: string) { await D().delete(t.contactMessages).where(eq(t.contactMessages.id, id)); }

export async function dbAudit(e: { at: string; action: string; target: string; detail: string }) { await D().insert(t.auditLog).values({ ...e, at: new Date(e.at) }); }
export async function dbListAudit(limit = 200) {
  const r = await D().select().from(t.auditLog).orderBy(sql`${t.auditLog.at} desc`).limit(limit);
  return r.map((x) => ({ at: x.at.toISOString(), action: x.action, target: x.target ?? "", detail: x.detail ?? "" }));
}

import type { TagReport, TagStatus, TagColor } from "./color-tags";
const toTag = (r: typeof t.colorTagReports.$inferSelect): TagReport => ({ id: r.id, at: r.createdAt.toISOString(), venue: r.venue, color: r.color as TagColor, discountPct: r.discountPct, note: r.note, status: r.status as TagStatus, weekOf: r.weekOf, expiresOn: r.expiresOn });
// Self-healing: if migration 0006 hasn't been applied (Postgres 42P01 "relation does not exist"), create the table
// (same idempotent SQL as drizzle/0006_color_tag_reports.sql) once and retry. Additive only; never alters existing tables.
let tagTableReady: Promise<unknown> | null = null;
const TAG_DDL = [`CREATE TABLE IF NOT EXISTS "color_tag_reports" ("id" text PRIMARY KEY NOT NULL, "venue" text NOT NULL, "color" text NOT NULL, "discount_pct" integer, "note" text DEFAULT '' NOT NULL, "status" text DEFAULT 'pending' NOT NULL, "week_of" text NOT NULL, "expires_on" text NOT NULL, "created_at" timestamp with time zone DEFAULT now() NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS "color_tag_reports_expires_idx" ON "color_tag_reports" ("expires_on")`];
const missingTable = (e: unknown) => { const x = e as { code?: string; cause?: { code?: string } }; return (x?.cause?.code ?? x?.code) === "42P01"; };
async function withTagTable<T>(fn: () => Promise<T>): Promise<T> {
  try { return await fn(); } catch (e) {
    if (!missingTable(e)) throw e;
    tagTableReady ??= (async () => { for (const q of TAG_DDL) await D().execute(sql.raw(q)); })().catch((err) => { tagTableReady = null; throw err; });
    await tagTableReady; return fn();
  }
}
/** Reports still worth showing/moderating (not expired before `since`), newest first. */
export async function dbListTagReports(since: string): Promise<TagReport[]> {
  return withTagTable(async () => (await D().select().from(t.colorTagReports).where(sql`${t.colorTagReports.expiresOn} >= ${since} and ${t.colorTagReports.status} <> 'rejected'`).orderBy(sql`${t.colorTagReports.createdAt} desc`)).map(toTag));
}
export async function dbAddTagReport(r: TagReport) { await withTagTable(() => D().insert(t.colorTagReports).values({ id: r.id, venue: r.venue, color: r.color, discountPct: r.discountPct, note: r.note, status: r.status, weekOf: r.weekOf, expiresOn: r.expiresOn, createdAt: new Date(r.at) })); }
export async function dbSetTagStatus(id: string, status: TagStatus) { const r = await withTagTable(() => D().update(t.colorTagReports).set({ status }).where(eq(t.colorTagReports.id, id)).returning({ id: t.colorTagReports.id })); return r.length > 0; }
export async function dbDeleteTagReport(id: string) { const r = await withTagTable(() => D().delete(t.colorTagReports).where(eq(t.colorTagReports.id, id)).returning({ id: t.colorTagReports.id })); return r.length > 0; }
