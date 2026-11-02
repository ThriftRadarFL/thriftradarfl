// Weekly store deal days as recurring iCal events. Subscribable: /api/calendar/deals[?city=port-orange|&venue=<slug>][&verified=1]
// ?download=1 adds Content-Disposition (one-off import). Unknown venue → 404; unknown city → empty calendar.
import { getVenues, getDealRules, citySlug } from "@/lib/data";
import { buildDealIcs, icsHeaders } from "@/lib/ics";
import { todayET } from "@/lib/cities";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams; const venue = sp.get("venue"), city = sp.get("city");
  const [venues, rules] = await Promise.all([getVenues(), getDealRules()]);
  if (venue && !venues.some((v) => v.slug === venue)) return new Response("Not found", { status: 404 });
  const vs = venues.filter((v) => (!venue || v.slug === venue) && (!city || citySlug(v.city) === city)); const keep = new Set(vs.map((v) => v.slug));
  const rs = rules.filter((r) => keep.has(r.venue) && (sp.get("verified") !== "1" || r.verified));
  const name = venue ? `${vs[0].name} · deal days` : city ? `ThriftRadarFL · ${vs[0]?.city ?? city} deal days` : "ThriftRadarFL · Central FL deal days";
  return new Response(buildDealIcs(rs, vs, todayET(), name), { headers: icsHeaders(`${venue ?? city ?? "thriftradarfl"}-deal-days.ics`, sp.get("download") === "1") });
}
