// Shared API helpers: JSON errors, body parsing with size cap, simple in-memory rate limit.
export class HttpError extends Error { constructor(public status: number, message: string, public details?: unknown) { super(message); } }
export const json = (data: unknown, status = 200) => Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
export async function readBody(req: Request, maxBytes = 32_000): Promise<Record<string, unknown>> {
  const text = await req.text();
  if (text.length > maxBytes) throw new HttpError(413, "payload too large");
  if (!text) return {};
  try { const v = JSON.parse(text); if (!v || typeof v !== "object" || Array.isArray(v)) throw 0; return v; } catch { throw new HttpError(400, "invalid JSON body"); }
}
const hits = new Map<string, number[]>();
export function rateLimit(req: Request, key: string, max = 10, windowMs = 60_000) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "local";
  const k = `${key}:${ip}`; const now = Date.now(); const arr = (hits.get(k) ?? []).filter((t) => now - t < windowMs);
  arr.push(now); hits.set(k, arr); if (arr.length > max) throw new HttpError(429, "too many requests");
}
export function handle<A extends unknown[]>(fn: (...a: A) => Promise<Response>) {
  return async (...a: A) => {
    try { return await fn(...a); }
    catch (e) {
      if (e instanceof HttpError) return json({ error: e.message, ...(e.details ? { details: e.details } : {}) }, e.status);
      console.error("[api]", e); return json({ error: "internal error" }, 500);
    }
  };
}
