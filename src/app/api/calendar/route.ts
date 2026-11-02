// Subscribable feed of all upcoming sales: /api/calendar?city=deland (webcal-friendly, no download header)
import { getSales, citySlug } from "@/lib/data";
import { buildIcs, icsHeaders } from "@/lib/ics";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const city = new URL(req.url).searchParams.get("city");
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const sales = (await getSales()).filter((s) => s.days.some((d) => d.date >= today) && (!city || citySlug(s.city) === city));
  return new Response(buildIcs(sales, city ? `ThriftRadarFL · ${city}` : "ThriftRadarFL · Central FL sales"), { headers: icsHeaders("thriftradarfl.ics", false) });
}
