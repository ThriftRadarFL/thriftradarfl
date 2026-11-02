import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as s from "../src/db/schema";
import { seedOrgs, seedVenues, seedDealRules, seedTags, mockSales } from "../src/lib/seed-data";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set (see .env.example)");
  const client = postgres(process.env.DATABASE_URL, { prepare: false });
  const db = drizzle(client);
  const orgIds: Record<string, number> = {};
  for (const o of seedOrgs) {
    const [r] = await db.insert(s.organizations).values({ name: o.name, type: o.type, website: o.website }).returning({ id: s.organizations.id });
    orgIds[o.key] = r.id;
  }
  const venueIds: Record<string, number> = {};
  for (const v of seedVenues) {
    const { org, ...rest } = v;
    const [r] = await db.insert(s.venues).values({ ...rest, orgId: orgIds[org] }).onConflictDoNothing().returning({ id: s.venues.id });
    if (r) venueIds[v.slug] = r.id;
  }
  for (const d of seedDealRules) {
    const { venue, ...rest } = d;
    if (venueIds[venue]) await db.insert(s.dealRules).values({ ...rest, venueId: venueIds[venue] });
  }
  await db.insert(s.tags).values(seedTags.map((name) => ({ name }))).onConflictDoNothing();
  for (const m of mockSales) {
    if (m.type !== "estate" && m.type !== "auction" && m.type !== "yard") continue; // thrift/bins mocks are UI-only
    const { days, type, ...rest } = m;
    const [r] = await db.insert(s.sales).values({ ...rest, type, source: "estatesales_net" as const }).onConflictDoNothing().returning({ id: s.sales.id });
    if (r) await db.insert(s.saleDays).values(days.map((d) => ({ saleId: r.id, date: d.date, startTime: d.start, endTime: d.end, discountPct: d.discountPct })));
  }
  console.log("Seeded.");
  await client.end();
}
main().catch((e) => { console.error(e); process.exit(1); });
