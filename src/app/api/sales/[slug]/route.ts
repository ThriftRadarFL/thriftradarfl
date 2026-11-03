import { getSale, getAllSales, upsertSale, deleteSale, audit } from "@/lib/data";
import { parseSale } from "@/lib/validate";
import { isAdminRequest } from "@/lib/auth";
import { refreshPages, handle, json, cachedJson, readBody, HttpError } from "@/lib/api";
export const dynamic = "force-dynamic";
type P = { params: Promise<{ slug: string }> };
export const GET = handle(async (req: Request, { params }: P) => { const s = await getSale((await params).slug); if (!s) throw new HttpError(404, "not found"); return cachedJson(req, { data: s }); });
export const PUT = handle(async (req: Request, { params }: P) => {
  if (!isAdminRequest(req)) throw new HttpError(401, "unauthorized");
  // Admins can edit (and re-publish) unpublished sales too; `published` is honoured and otherwise kept from the existing row.
  const slug = (await params).slug; const existing = (await getAllSales()).find((x) => x.slug === slug); if (!existing) throw new HttpError(404, "not found");
  const body = await readBody(req); const r = parseSale({ ...existing, ...body, slug }); if (!r.ok) throw new HttpError(400, "validation failed", r.errors);
  const published = body.published === undefined ? existing.published !== false : body.published !== false && body.published !== "false";
  await upsertSale({ ...r.value, published }); r.value.published = published; await audit("sale.save", slug, "via API"); await refreshPages(); return json({ data: r.value });
});
export const DELETE = handle(async (req: Request, { params }: P) => {
  if (!isAdminRequest(req)) throw new HttpError(401, "unauthorized");
  const slug = (await params).slug; if (!(await getAllSales()).some((x) => x.slug === slug)) throw new HttpError(404, "not found");
  await deleteSale(slug); await audit("sale.delete", slug, "via API"); await refreshPages(); return new Response(null, { status: 204 });
});
