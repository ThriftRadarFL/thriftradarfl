import { getSale } from "@/lib/data";
import { buildIcs, icsHeaders } from "@/lib/ics";
export const dynamic = "force-dynamic";
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const s = await getSale((await params).slug);
  if (!s) return new Response("Not found", { status: 404 });
  return new Response(buildIcs([s], s.title), { headers: icsHeaders(`${s.slug}.ics`) });
}
