import { getVenue, upsertVenue } from "@/lib/data";
import { parseVenue } from "@/lib/validate";
import { isAdminRequest } from "@/lib/auth";
import { handle, json, readBody, HttpError } from "@/lib/api";
import { dealRules } from "@/lib/deal-rules";
export const dynamic = "force-dynamic";
type P = { params: Promise<{ slug: string }> };
export const GET = handle(async (_r: Request, { params }: P) => {
  const v = await getVenue((await params).slug); if (!v) throw new HttpError(404, "not found");
  return json({ data: { ...v, dealRules: dealRules.filter((r) => r.venue === v.slug) } });
});
export const PUT = handle(async (req: Request, { params }: P) => {
  if (!isAdminRequest(req)) throw new HttpError(401, "unauthorized");
  const slug = (await params).slug; const ex = await getVenue(slug); if (!ex) throw new HttpError(404, "not found");
  const r = parseVenue({ ...ex, hours: ex.hoursJson ? Object.values(ex.hoursJson)[0] : "", ...(await readBody(req)), slug }); if (!r.ok) throw new HttpError(400, "validation failed", r.errors);
  await upsertVenue(r.value); return json({ data: r.value });
});
