// Subscribable feed of all upcoming sales: /api/calendar?city=deland (webcal-friendly, no download header). &deals=1 adds weekly store deal days.
import { getSales, getVenues, getDealRules, citySlug } from "@/lib/data";
import { buildIcs, dealEvents, icsHeaders } from "@/lib/ics";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const city = new URL(req.url).searchParams.get("city");
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const sales = (await getSales()).filter((s) => s.days.some((d) => d.date >= today) && (!city || citySlug(s.city) === city));
  let extra: string[] = [];
  if (new URL(req.url).searchParams.get("deals") === "1") { const [venues, rules] = await Promise.all([getVenues(), getDealRules()]);
    extra = dealEvents(rules, venues.filter((v) => !city || citySlug(v.city) === city), today); }
  return new Response(buildIcs(sales, city ? `ThriftRadarFL · ${city}` : "ThriftRadarFL · Central FL sales", extra), { headers: icsHeaders("thriftradarfl.ics", false) });
}
