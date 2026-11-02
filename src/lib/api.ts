// Shared API helpers: JSON errors, body parsing with size cap, rate limit (see security.ts).
export class HttpError extends Error { constructor(public status: number, message: string, public details?: unknown) { super(message); } }
export const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
export async function readBody(req: Request, maxBytes = 32_000): Promise<Record<string, unknown>> {
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError(413, "payload too large");
  if (!text) return {};
  try { const v = JSON.parse(text); if (!v || typeof v !== "object" || Array.isArray(v)) throw 0; return v; } catch { throw new HttpError(400, "invalid JSON body"); }
}
import { clientIp, limitHit, LIMITS } from "./security";
export function rateLimit(req: Request, name: keyof typeof LIMITS) {
  const r = limitHit(name, clientIp(req.headers)); if (r.limited) throw new HttpError(429, "too many requests", { retryAfterSec: r.retryAfterSec });
}
export function handle<A extends unknown[]>(fn: (...a: A) => Promise<Response>) {
  return async (...a: A) => {
    try { return await fn(...a); }
    catch (e) {
      if (e instanceof HttpError && e.status === 429) return Response.json({ error: e.message }, { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": String((e.details as { retryAfterSec?: number })?.retryAfterSec ?? 60) } });
      if (e instanceof HttpError) return json({ error: e.message, ...(e.details ? { details: e.details } : {}) }, e.status);
      console.error("[api]", e); return json({ error: "internal error" }, 500);
    }
  };
}
