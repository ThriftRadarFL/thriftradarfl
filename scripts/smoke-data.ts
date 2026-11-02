// Exercise the data layer in whichever mode is active (JSON or Postgres if DATABASE_URL set): `npx tsx scripts/smoke-data.ts`
import "dotenv/config";
import { getSales, getVenues, upsertSale, deleteSale, upsertVenue, addDigestSubscriber, dataMode } from "../src/lib/data";
async function main() {
  console.log("mode:", dataMode);
  const sales = await getSales(); const venues = await getVenues();
  console.log("sales", sales.length, "venues", venues.length, "first sale days", sales[0]?.days.length);
  const t = { slug: "smoke-test-sale", title: "Smoke", type: "estate", city: "DeLand", zip: "32724", lat: 29, lng: -81.3, sourceUrl: "", paymentMethods: ["cash"], days: [{ date: "2026-12-01", start: "09:00", end: "12:00", discountPct: 10 }] };
  await upsertSale(t); await upsertSale({ ...t, title: "Smoke 2" });
  const got = (await getSales()).find((s) => s.slug === t.slug); console.log("upsert ok:", got?.title === "Smoke 2" && got.days.length === 1);
  await deleteSale(t.slug); console.log("delete ok:", !(await getSales()).some((s) => s.slug === t.slug));
  await upsertVenue({ ...venues[0], notes: venues[0].notes }); console.log("venue upsert ok");
  console.log("sub new:", await addDigestSubscriber("smoke@example.com", "All"), "dup:", await addDigestSubscriber("SMOKE@example.com", "All"));
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
