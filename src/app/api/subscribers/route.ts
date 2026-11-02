import { addDigestSubscriber, listSubscribers } from "@/lib/data";
import { isAdminRequest } from "@/lib/auth";
import { handle, json, readBody, rateLimit, HttpError } from "@/lib/api";
import { isEmail } from "@/lib/validate";
export const dynamic = "force-dynamic";
export const POST = handle(async (req: Request) => {
  rateLimit(req, "subscribe", 5);
  const b = await readBody(req, 2000); const email = String(b.email ?? "").trim();
  if (b.company) return json({ added: false }); // honeypot
  if (!isEmail(email)) throw new HttpError(400, "invalid email");
  const added = await addDigestSubscriber(email, String(b.area ?? "All").slice(0, 60)); return json({ added }, added ? 201 : 200);
});
export const GET = handle(async (req: Request) => {
  if (!isAdminRequest(req)) throw new HttpError(401, "unauthorized");
  const list = await listSubscribers(); return json({ data: list, count: list.length });
});
