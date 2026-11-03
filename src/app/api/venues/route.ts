import { getVenues, upsertVenue, audit } from "@/lib/data";
import { parseVenue } from "@/lib/validate";
import { isAdminRequest } from "@/lib/auth";
import { handle, json, readBody, HttpError } from "@/lib/api";
export const dynamic = "force-dynamic";
export const GET = handle(async (req: Request) => {
  const city = new URL(req.url).searchParams.get("city")?.toLowerCase(); let v = await getVenues();
  if (city) v = v.filter((x) => x.city.toLowerCase().replace(/\s+/g, "-") === city); return json({ data: v, count: v.length });
});
export const POST = handle(async (req: Request) => {
  if (!isAdminRequest(req)) throw new HttpError(401, "unauthorized");
  const r = parseVenue(await readBody(req)); if (!r.ok) throw new HttpError(400, "validation failed", r.errors);
  await upsertVenue(r.value); await audit("venue.create", r.value.slug, "via API"); return json({ data: r.value }, 201);
});
