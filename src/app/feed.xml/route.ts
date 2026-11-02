import { getSales } from "@/lib/data";
import { atomFeed } from "@/lib/new-sales";
import { SITE_URL } from "@/lib/site";
export const dynamic = "force-dynamic";
export async function GET() {
  return new Response(atomFeed(await getSales(), SITE_URL), { headers: { "Content-Type": "application/atom+xml; charset=utf-8", "Cache-Control": "public, max-age=900" } });
}
