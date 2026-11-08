import { getSales, getAllSales, getSaleAdmin, upsertSale, audit } from "@/lib/data";
import { parseSale, SALE_TYPES } from "@/lib/validate";
import { isAdminRequest } from "@/lib/auth";
import { refreshPages, handle, json, cachedJson, readBody, HttpError } from "@/lib/api";
export const dynamic = "force-dynamic";
export const GET = handle(async (req: Request) => {
  const u = new URL(req.url); const city = u.searchParams.get("city")?.toLowerCase(); const type = u.searchParams.get("type");
  const from = u.searchParams.get("from"); const upcoming = u.searchParams.get("upcoming") === "1"; const includeEnded = u.searchParams.get("includeEnded") === "1";
  if (type && !SALE_TYPES.includes(type as never)) throw new HttpError(400, "invalid type");
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  let s = includeEnded ? (await getAllSales()).filter((x) => x.published !== false) : await getSales();
  if (city) s = s.filter((x) => x.city.toLowerCase().replace(/\s+/g, "-") === city);
  if (type) s = s.filter((x) => x.type === type);
  const cutoff = from ?? (upcoming ? today : null); if (cutoff) s = s.filter((x) => x.days.some((d) => d.date >= cutoff));
  return cachedJson(req, { data: s, count: s.length });
});
export const POST = handle(async (req: Request) => {
  if (!isAdminRequest(req)) throw new HttpError(401, "unauthorized");
  const body = await readBody(req); const r = parseSale(body); if (!r.ok) throw new HttpError(400, "validation failed", r.errors);
  if (body.published === false || body.published === "false") r.value.published = false;
  if (await getSaleAdmin(r.value.slug)) throw new HttpError(409, "slug exists; use PUT /api/sales/" + r.value.slug);
  await upsertSale(r.value); await audit("sale.create", r.value.slug, "via API"); await refreshPages(); return json({ data: r.value }, 201);
});
