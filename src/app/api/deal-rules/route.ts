import { getDealRules, upsertDealRule, deleteDealRule, audit } from "@/lib/data";
import { parseDealRule } from "@/lib/validate";
import { isAdminRequest } from "@/lib/auth";
import { handle, json, cachedJson, readBody, HttpError } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const v = new URL(req.url).searchParams.get("venue"); const all = await getDealRules();
  const d = v ? all.filter((r) => r.venue === v) : all;
  const body = { data: d, count: d.length, note: "verified=false rules are not yet confirmed with the store" };
  // Admin/auth reads skip CDN cache (public users still get the normal cachedJson headers).
  if (isAdminRequest(req)) return json(body);
  return cachedJson(req, body);
}
// Admin-only (Bearer ADMIN_PASSWORD): upsert one rule by id (defaults to ruleId of venue/day/label).
export const POST = handle(async (req: Request) => {
  if (!isAdminRequest(req)) throw new HttpError(401, "unauthorized");
  const r = parseDealRule(await readBody(req)); if (!r.ok) throw new HttpError(400, "validation failed", r.errors);
  await upsertDealRule(r.value); await audit("rule.save", r.value.id ?? r.value.label, "via API"); return json({ data: r.value }, 201);
});
export const DELETE = handle(async (req: Request) => {
  if (!isAdminRequest(req)) throw new HttpError(401, "unauthorized");
  const id = new URL(req.url).searchParams.get("id"); if (!id) throw new HttpError(400, "id required");
  if (!(await deleteDealRule(id))) throw new HttpError(404, "not found"); await audit("rule.delete", id, "via API"); return json({ data: { id, deleted: true } });
});
