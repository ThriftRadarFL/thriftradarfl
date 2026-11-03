// GET /embed/stores/<slug>[?compact=1] → iframe-able HTML widget (deal days, today, best day). Framing allowed from any site
// (see next.config.ts: /embed/* gets frame-ancestors * and no X-Frame-Options); everything else stays SAMEORIGIN.
import { getVenue, getDealRules } from "@/lib/data";
import { todayET } from "@/lib/cities";
import { SITE_URL } from "@/lib/site";
import { storeWidgetHtml, notFoundWidgetHtml, embedOpts } from "@/lib/embed";
export const dynamic = "force-dynamic";
const H = { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=3600", "X-Robots-Tag": "noindex" };
export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const v = await getVenue((await params).slug);
    if (!v) return new Response(notFoundWidgetHtml(SITE_URL), { status: 404, headers: { ...H, "Cache-Control": "no-store" } });
    return new Response(storeWidgetHtml(v, await getDealRules(), todayET(), SITE_URL, embedOpts(new URL(req.url).searchParams)), { headers: H });
  } catch {
    return new Response("<!doctype html><title>Unavailable</title><p style=\"font:13px Verdana\">Deal days are temporarily unavailable.</p>", { status: 503, headers: { ...H, "Cache-Control": "no-store" } });
  }
}
