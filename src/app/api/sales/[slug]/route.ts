import { getSale, upsertSale, deleteSale } from "@/lib/data";
import { parseSale } from "@/lib/validate";
import { isAdminRequest } from "@/lib/auth";
export const dynamic = "force-dynamic";
type P = { params: Promise<{ slug: string }> };
export async function GET(_r: Request, { params }: P) { const s = await getSale((await params).slug); return s ? Response.json({ data: s }) : Response.json({ error: "not found" }, { status: 404 }); }
export async function PUT(req: Request, { params }: P) {
  if (!isAdminRequest(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const r = parseSale({ ...(await req.json().catch(() => ({}))), slug: (await params).slug }); if (!r.ok) return Response.json({ errors: r.errors }, { status: 400 });
  await upsertSale(r.value); return Response.json({ data: r.value });
}
export async function DELETE(req: Request, { params }: P) {
  if (!isAdminRequest(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  await deleteSale((await params).slug); return new Response(null, { status: 204 });
}
