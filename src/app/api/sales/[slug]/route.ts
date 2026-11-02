import { getSale, upsertSale, deleteSale } from "@/lib/data";
import { parseSale } from "@/lib/validate";
import { isAdminRequest } from "@/lib/auth";
import { handle, json, readBody, HttpError } from "@/lib/api";
export const dynamic = "force-dynamic";
type P = { params: Promise<{ slug: string }> };
export const GET = handle(async (_r: Request, { params }: P) => { const s = await getSale((await params).slug); if (!s) throw new HttpError(404, "not found"); return json({ data: s }); });
export const PUT = handle(async (req: Request, { params }: P) => {
  if (!isAdminRequest(req)) throw new HttpError(401, "unauthorized");
  const slug = (await params).slug; const existing = await getSale(slug); if (!existing) throw new HttpError(404, "not found");
  const r = parseSale({ ...existing, ...(await readBody(req)), slug }); if (!r.ok) throw new HttpError(400, "validation failed", r.errors);
  await upsertSale(r.value); return json({ data: r.value });
});
export const DELETE = handle(async (req: Request, { params }: P) => {
  if (!isAdminRequest(req)) throw new HttpError(401, "unauthorized");
  const slug = (await params).slug; if (!(await getSale(slug))) throw new HttpError(404, "not found");
  await deleteSale(slug); return new Response(null, { status: 204 });
});
