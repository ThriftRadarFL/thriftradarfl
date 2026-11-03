import { addDigestSubscriber, listSubscribers } from "@/lib/data";
import { isAdminRequest } from "@/lib/auth";
import { handle, json, readBody, rateLimit, HttpError } from "@/lib/api";
import { parseSubscriber } from "@/lib/validate";
import { honeypotTripped } from "@/lib/security";
export const dynamic = "force-dynamic";
export const POST = handle(async (req: Request) => {
  rateLimit(req, "subscribe");
  const b = await readBody(req, 2000);
  if (honeypotTripped(b)) return json({ added: false }); // bot: pretend success, store nothing
  const r = parseSubscriber(b); if (!r.ok) throw new HttpError(400, r.errors[0], r.errors);
  const added = await addDigestSubscriber(r.value.email, r.value.area, r.value.keywords); return json({ added }, added ? 201 : 200);
});
export const GET = handle(async (req: Request) => {
  if (!isAdminRequest(req)) throw new HttpError(401, "unauthorized");
  const list = await listSubscribers(); return json({ data: list, count: list.length });
});
