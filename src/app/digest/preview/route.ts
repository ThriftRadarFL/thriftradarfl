// Renders the current digest email HTML in the browser: /digest/preview
import { getSales } from "@/lib/data";
import { buildDigest } from "@/lib/digest";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const from = new URL(req.url).searchParams.get("from") ?? new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  return new Response(buildDigest(await getSales(), from).html, { headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" } });
}
