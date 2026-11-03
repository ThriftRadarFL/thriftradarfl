import { getVenues, listTagReports } from "@/lib/data";
import { buildBoard, weekBounds } from "@/lib/color-tags";
import { todayET } from "@/lib/cities";
import { cachedJson } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const venue = new URL(req.url).searchParams.get("venue"); const today = todayET();
  const [venues, reports] = await Promise.all([getVenues(), listTagReports()]); const known = new Set(venues.map((v) => v.slug));
  const data = buildBoard(reports, today).filter((r) => known.has(r.venue) && (!venue || r.venue === venue));
  return cachedJson(req, { ...weekBounds(today), crowdsourced: true, verified: false, note: "Shopper reports, approved by a moderator; not confirmed with stores. Cleared each Sunday.", data, count: data.length }, "public, max-age=30, s-maxage=60, stale-while-revalidate=120");
}
