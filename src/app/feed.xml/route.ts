// GET /feed.xml[?city=<slug>] → Atom feed of newest listed upcoming sales (site-wide or one city). Unknown city → 404.
import { getSales, getVenues } from "@/lib/data";
import { atomFeed, citySlug } from "@/lib/new-sales";
import { SITE_URL } from "@/lib/site";
export const dynamic = "force-dynamic";
const H = { "Content-Type": "application/atom+xml; charset=utf-8", "Cache-Control": "public, max-age=900" };
export async function GET(req: Request) {
  const want = new URL(req.url).searchParams.get("city"); const sales = await getSales();
  if (!want) return new Response(atomFeed(sales, SITE_URL), { headers: H });
  const city = [...sales.map((s) => s.city), ...(await getVenues()).map((v) => v.city)].find((c) => citySlug(c) === citySlug(want));
  if (!city) return Response.json({ error: "unknown city" }, { status: 404 });
  return new Response(atomFeed(sales, SITE_URL, new Date(), city), { headers: H });
}
