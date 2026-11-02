// Postgres (Drizzle) implementation of the data layer. Used automatically when DATABASE_URL is set.
import { eq, asc, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import type { Sale, Venue, Submission, ContactMsg } from "./data";
import { KIND_COLOR, ruleId, type DealRule } from "./deal-rules";

const D = () => { if (!db) throw new Error("DATABASE_URL not set"); return db; };
const hm = (x: string | null) => (x ?? "00:00").slice(0, 5);

export async function dbGetSales(): Promise<Sale[]> {
  const rows = await D().select().from(t.sales).orderBy(asc(t.sales.id));
  if (!rows.length) return [];
  const days = await D().select().from(t.saleDays).where(inArray(t.saleDays.saleId, rows.map((r) => r.id))).orderBy(asc(t.saleDays.date));
  return rows.map((r) => ({ slug: r.slug, title: r.title, type: r.type, city: r.city, zip: r.zip ?? "", lat: r.lat ?? 0, lng: r.lng ?? 0,
    sourceUrl: r.sourceUrl ?? "", paymentMethods: r.paymentMethods ?? [], published: r.published, ...(r.tags?.length ? { tags: r.tags } : {}), ...(r.description ? { description: r.description } : {}),
    days: days.filter((d) => d.saleId === r.id).map((d) => ({ date: String(d.date), start: hm(d.startTime), end: hm(d.endTime), discountPct: d.discountPct })) }));
}
export async function dbUpsertSale(s: Sale) {
  await D().transaction(async (tx) => {
    const vals = { slug: s.slug, title: s.title, type: s.type as (typeof t.saleType.enumValues)[number], city: s.city, zip: s.zip, lat: s.lat, lng: s.lng, sourceUrl: s.sourceUrl, paymentMethods: s.paymentMethods, published: s.published !== false, tags: s.tags ?? null, description: s.description ?? null, ...(s.published === false && s.sourceUrl === "" ? { source: "submitted" as const } : {}) };
    const [r] = await tx.insert(t.sales).values(vals).onConflictDoUpdate({ target: t.sales.slug, set: vals }).returning({ id: t.sales.id });
    await tx.delete(t.saleDays).where(eq(t.saleDays.saleId, r.id));
    if (s.days.length) await tx.insert(t.saleDays).values(s.days.map((d) => ({ saleId: r.id, date: d.date, startTime: d.start, endTime: d.end, discountPct: d.discountPct })));
  });
}
export async function dbDeleteSale(slug: string) { await D().delete(t.sales).where(eq(t.sales.slug, slug)); }

export async function dbGetVenues(): Promise<Venue[]> {
  const rows = await D().select().from(t.venues).where(eq(t.venues.active, true)).orderBy(asc(t.venues.name));
  return rows.map((v) => ({ slug: v.slug, org: v.orgKey ?? "", name: v.name, type: v.type, address: v.address, city: v.city, zip: v.zip, lat: v.lat ?? 0, lng: v.lng ?? 0,
    phone: v.phone, hoursJson: (v.hoursJson as Record<string, string> | null) ?? null, notes: v.notes ?? "", ...(v.sourceUrl ? { sourceUrl: v.sourceUrl } : {}) }));
}
export async function dbUpsertVenue(v: Venue) {
  const vals = { slug: v.slug, name: v.name, type: v.type as (typeof t.venueType.enumValues)[number], address: v.address, city: v.city, zip: v.zip, lat: v.lat, lng: v.lng, phone: v.phone, hoursJson: v.hoursJson, notes: v.notes, sourceUrl: v.sourceUrl || null, orgKey: v.org || null };
  await D().insert(t.venues).values(vals).onConflictDoUpdate({ target: t.venues.slug, set: vals });
}
export async function dbDeleteVenue(slug: string) { await D().delete(t.venues).where(eq(t.venues.slug, slug)); }
export async function dbAddSubscriber(email: string, area: string) {
  const r = await D().insert(t.subscribers).values({ email: email.toLowerCase(), area }).onConflictDoNothing().returning({ id: t.subscribers.id });
  return r.length > 0;
}
export async function dbListSubscribers() {
  const r = await D().select().from(t.subscribers).orderBy(asc(t.subscribers.createdAt));
  return r.map((x) => ({ email: x.email, area: x.area ?? "", at: x.createdAt.toISOString() }));
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
