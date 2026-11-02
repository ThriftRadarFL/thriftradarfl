import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";
export const ADMIN_COOKIE = "tr_admin";
export const adminToken = () => createHash("sha256").update("thriftradar:" + (process.env.ADMIN_PASSWORD ?? "")).digest("hex");
export async function isAdmin() { if (!process.env.ADMIN_PASSWORD) return false; return (await cookies()).get(ADMIN_COOKIE)?.value === adminToken(); }
export function isAdminRequest(req: Request) {
  if (!process.env.ADMIN_PASSWORD) return false;
  const h = req.headers.get("authorization"); if (h?.startsWith("Bearer ") && checkPassword(h.slice(7))) return true;
  return (req.headers.get("cookie") ?? "").split(/;\s*/).includes(`${ADMIN_COOKIE}=${adminToken()}`);
}
export function checkPassword(input: string) {
  const pw = process.env.ADMIN_PASSWORD; if (!pw) return false;
  const a = createHash("sha256").update(input).digest(), b = createHash("sha256").update(pw).digest(); return timingSafeEqual(a, b);
}
// Stateless unsubscribe token (HMAC of email). Uses CRON_SECRET or ADMIN_PASSWORD as key.
export const unsubToken = (email: string) => createHash("sha256").update(`unsub:${process.env.CRON_SECRET ?? process.env.ADMIN_PASSWORD ?? "dev"}:${email.toLowerCase()}`).digest("hex").slice(0, 24);
