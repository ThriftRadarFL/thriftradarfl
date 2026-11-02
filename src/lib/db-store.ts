// Postgres (Drizzle) implementation of the data layer. Used automatically when DATABASE_URL is set.
import { eq, asc, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import * as t from "@/db/schema";
import type { Sale, Venue } from "./data";

const D = () => { if (!db) throw new Error("DATABASE_URL not set"); return db; };
const hm = (x: string | null) => (x ?? "00:00").slice(0, 5);

export async function dbGetSales(): Promise<Sale[]> {
  const rows = await D().select().from(t.sales).orderBy(asc(t.sales.id));
  if (!rows.length) return [];
  const days = await D().select().from(t.saleDays).where(inArray(t.saleDays.saleId, rows.map((r) => r.id))).orderBy(asc(t.saleDays.date));
  return rows.map((r) => ({ slug: r.slug, title: r.title, type: r.type, city: r.city, zip: r.zip ?? "", lat: r.lat ?? 0, lng: r.lng ?? 0,
    sourceUrl: r.sourceUrl ?? "", paymentMethods: r.paymentMethods ?? [],
    days: days.filter((d) => d.saleId === r.id).map((d) => ({ date: String(d.date), start: hm(d.startTime), end: hm(d.endTime), discountPct: d.discountPct })) }));
}
export async function dbUpsertSale(s: Sale) {
  await D().transaction(async (tx) => {
    const vals = { slug: s.slug, title: s.title, type: s.type as (typeof t.saleType.enumValues)[number], city: s.city, zip: s.zip, lat: s.lat, lng: s.lng, sourceUrl: s.sourceUrl, paymentMethods: s.paymentMethods };
    const [r] = await tx.insert(t.sales).values(vals).onConflictDoUpdate({ target: t.sales.slug, set: vals }).returning({ id: t.sales.id });
    await tx.delete(t.saleDays).where(eq(t.saleDays.saleId, r.id));
    if (s.days.length) await tx.insert(t.saleDays).values(s.days.map((d) => ({ saleId: r.id, date: d.date, startTime: d.start, endTime: d.end, discountPct: d.discountPct })));
  });
}
export async function dbDeleteSale(slug: string) { await D().delete(t.sales).where(eq(t.sales.slug, slug)); }

export async function dbGetVenues(): Promise<Venue[]> {
  const rows = await D().select().from(t.venues).where(eq(t.venues.active, true)).orderBy(asc(t.venues.name));
  return rows.map((v) => ({ slug: v.slug, org: "", name: v.name, type: v.type, address: v.address, city: v.city, zip: v.zip, lat: v.lat ?? 0, lng: v.lng ?? 0,
    phone: v.phone, hoursJson: (v.hoursJson as Record<string, string> | null) ?? null, notes: v.notes ?? "" }));
}
export async function dbUpsertVenue(v: Venue) {
  const vals = { slug: v.slug, name: v.name, type: v.type as (typeof t.venueType.enumValues)[number], address: v.address, city: v.city, zip: v.zip, lat: v.lat, lng: v.lng, phone: v.phone, hoursJson: v.hoursJson, notes: v.notes };
  await D().insert(t.venues).values(vals).onConflictDoUpdate({ target: t.venues.slug, set: vals });
}
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
