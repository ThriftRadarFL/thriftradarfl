import { getSales, getSale, upsertSale } from "@/lib/data";
import { parseSale, SALE_TYPES } from "@/lib/validate";
import { isAdminRequest } from "@/lib/auth";
import { handle, json, readBody, HttpError } from "@/lib/api";
export const dynamic = "force-dynamic";
export const GET = handle(async (req: Request) => {
  const u = new URL(req.url); const city = u.searchParams.get("city")?.toLowerCase(); const type = u.searchParams.get("type");
  const from = u.searchParams.get("from"); const upcoming = u.searchParams.get("upcoming") === "1";
  if (type && !SALE_TYPES.includes(type as never)) throw new HttpError(400, "invalid type");
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  let s = await getSales();
  if (city) s = s.filter((x) => x.city.toLowerCase().replace(/\s+/g, "-") === city);
  if (type) s = s.filter((x) => x.type === type);
  const cutoff = from ?? (upcoming ? today : null); if (cutoff) s = s.filter((x) => x.days.some((d) => d.date >= cutoff));
  return json({ data: s, count: s.length });
});
export const POST = handle(async (req: Request) => {
  if (!isAdminRequest(req)) throw new HttpError(401, "unauthorized");
  const r = parseSale(await readBody(req)); if (!r.ok) throw new HttpError(400, "validation failed", r.errors);
  if (await getSale(r.value.slug)) throw new HttpError(409, "slug exists; use PUT /api/sales/" + r.value.slug);
  await upsertSale(r.value); return json({ data: r.value }, 201);
});
