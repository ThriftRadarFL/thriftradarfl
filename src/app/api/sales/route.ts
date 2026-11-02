import { getSales, upsertSale } from "@/lib/data";
import { parseSale } from "@/lib/validate";
import { isAdminRequest } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const u = new URL(req.url); const city = u.searchParams.get("city")?.toLowerCase(); const type = u.searchParams.get("type");
  let s = await getSales(); if (city) s = s.filter((x) => x.city.toLowerCase().replace(/\s+/g, "-") === city); if (type) s = s.filter((x) => x.type === type);
  return Response.json({ data: s });
}
export async function POST(req: Request) {
  if (!isAdminRequest(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const r = parseSale(await req.json().catch(() => ({}))); if (!r.ok) return Response.json({ errors: r.errors }, { status: 400 });
  await upsertSale(r.value); return Response.json({ data: r.value }, { status: 201 });
}
