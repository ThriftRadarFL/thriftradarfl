import { getVenues, upsertVenue } from "@/lib/data";
import { parseVenue } from "@/lib/validate";
import { isAdminRequest } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET() { return Response.json({ data: await getVenues() }); }
export async function POST(req: Request) {
  if (!isAdminRequest(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const r = parseVenue(await req.json().catch(() => ({}))); if (!r.ok) return Response.json({ errors: r.errors }, { status: 400 });
  await upsertVenue(r.value); return Response.json({ data: r.value }, { status: 201 });
}
