import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as s from "../src/db/schema";
import { eq } from "drizzle-orm";
import { seedOrgs, seedVenues, seedTags, mockSales } from "../src/lib/seed-data";
import { dealRules } from "../src/lib/deal-rules";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set (see .env.example)");
  const client = postgres(process.env.DATABASE_URL, { prepare: false });
  const db = drizzle(client);
  const orgIds: Record<string, number> = {};
  for (const o of seedOrgs) {
    const [ex] = await db.select({ id: s.organizations.id }).from(s.organizations).where(eq(s.organizations.name, o.name));
    if (ex) { orgIds[o.key] = ex.id; continue; }
    const [r] = await db.insert(s.organizations).values({ name: o.name, type: o.type, website: o.website }).returning({ id: s.organizations.id });
    orgIds[o.key] = r.id;
  }
  const venueIds: Record<string, number> = {};
  for (const v of seedVenues) {
    const { org, ...rest } = v;
    const [r] = await db.insert(s.venues).values({ ...rest, sourceUrl: rest.sourceUrl || null, orgKey: org, orgId: orgIds[org] }).onConflictDoNothing().returning({ id: s.venues.id });
    if (r) venueIds[v.slug] = r.id;
  }
  for (const d of dealRules) {
    if (!venueIds[d.venue]) continue; // only for newly inserted venues (keeps reseed idempotent)
    await db.insert(s.dealRules).values({ venueId: venueIds[d.venue], kind: d.kind, dayOfWeek: d.day, startTime: d.time ?? null, discountPct: d.discountPct ?? null,
      description: d.label, verifiedAt: d.verified ? new Date() : null, source: d.verified ? "estatesales.net" : "UNVERIFIED demo" });
  }
  await db.insert(s.tags).values(seedTags.map((name) => ({ name }))).onConflictDoNothing();
  for (const m of mockSales) {
    const { days, type, ...rest } = m;
    const [r] = await db.insert(s.sales).values({ ...rest, type, source: "estatesales_net" as const }).onConflictDoNothing().returning({ id: s.sales.id });
    if (r) await db.insert(s.saleDays).values(days.map((d) => ({ saleId: r.id, date: d.date, startTime: d.start, endTime: d.end, discountPct: d.discountPct })));
  }
  console.log("Seeded.");
  await client.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
