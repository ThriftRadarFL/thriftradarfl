import { getVenue, upsertVenue, getDealRules, deleteVenue, audit } from "@/lib/data";
import { parseVenue } from "@/lib/validate";
import { isAdminRequest } from "@/lib/auth";
import { handle, json, cachedJson, readBody, HttpError } from "@/lib/api";
export const dynamic = "force-dynamic";
type P = { params: Promise<{ slug: string }> };
export const GET = handle(async (req: Request, { params }: P) => {
  const v = await getVenue((await params).slug); if (!v) throw new HttpError(404, "not found");
  return cachedJson(req, { data: { ...v, dealRules: (await getDealRules()).filter((r) => r.venue === v.slug) } });
});
export const PUT = handle(async (req: Request, { params }: P) => {
  if (!isAdminRequest(req)) throw new HttpError(401, "unauthorized");
  const slug = (await params).slug; const ex = await getVenue(slug); if (!ex) throw new HttpError(404, "not found");
  const r = parseVenue({ ...ex, hours: ex.hoursJson ? Object.values(ex.hoursJson)[0] : "", ...(await readBody(req)), slug }); if (!r.ok) throw new HttpError(400, "validation failed", r.errors);
  await upsertVenue(r.value); await audit("venue.save", slug, "via API"); return json({ data: r.value });
});
export const DELETE = handle(async (req: Request, { params }: P) => {
  if (!isAdminRequest(req)) throw new HttpError(401, "unauthorized");
  const slug = (await params).slug; if (!(await getVenue(slug))) throw new HttpError(404, "not found");
  await deleteVenue(slug); await audit("venue.delete", slug, "via API"); return json({ data: { slug, deleted: true } });
});
