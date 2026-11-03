// GET /api/suggest?q= → up to 8 search-as-you-type suggestions (stores, upcoming sales, cities). Public, cached.
import { getSales, getVenues } from "@/lib/data";
import { handle, cachedJson } from "@/lib/api";
import { suggest, MAX_Q } from "@/lib/suggest";
import { todayET } from "@/lib/cities";
export const dynamic = "force-dynamic";
export const GET = handle(async (req: Request) => {
  const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, MAX_Q);
  const data = q.length < 2 ? [] : suggest(q, await getSales(), await getVenues(), todayET());
  return cachedJson(req, { q, data, count: data.length }, "public, max-age=120, s-maxage=600, stale-while-revalidate=1800");
});
