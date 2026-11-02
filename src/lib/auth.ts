import { cookies } from "next/headers";
import { createHash } from "crypto";
export const ADMIN_COOKIE = "tr_admin";
export const adminToken = () => createHash("sha256").update("thriftradar:" + (process.env.ADMIN_PASSWORD ?? "")).digest("hex");
export async function isAdmin() { if (!process.env.ADMIN_PASSWORD) return false; return (await cookies()).get(ADMIN_COOKIE)?.value === adminToken(); }
export function isAdminRequest(req: Request) {
  if (!process.env.ADMIN_PASSWORD) return false;
  const h = req.headers.get("authorization"); if (h === `Bearer ${process.env.ADMIN_PASSWORD}`) return true;
  return (req.headers.get("cookie") ?? "").split(/;\s*/).includes(`${ADMIN_COOKIE}=${adminToken()}`);
}
