// Security helpers shared by next.config (headers), API routes and server actions (rate limit + honeypot).
// Dependency-free so next.config.ts can import it.

/** Content-Security-Policy. No nonces (pages are statically rendered), so inline scripts are allowed;
 *  everything else is locked to self + MapTiler (tiles/styles/glyphs/sprites). MapLibre needs blob: workers + inline styles. */
export function buildCsp(dev = process.env.NODE_ENV !== "production") {
  const maptiler = "https://api.maptiler.com https://*.maptiler.com";
  const d: Record<string, string> = {
    "default-src": "'self'",
    "script-src": `'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src": "'self' 'unsafe-inline'",
    "img-src": `'self' data: blob: ${maptiler}`,
    "font-src": "'self' data:",
    "connect-src": `'self' ${maptiler}${dev ? " ws: wss:" : ""}`,
    "worker-src": "'self' blob:",
    "child-src": "'self' blob:",
    "manifest-src": "'self'",
    "frame-ancestors": "'self'",
    "form-action": "'self'",
    "base-uri": "'self'",
    "object-src": "'none'",
  };
  return Object.entries(d).map(([k, v]) => (v ? `${k} ${v}` : k)).join("; ");
}
export function securityHeaders(dev = process.env.NODE_ENV !== "production") {
  return [
    { key: "Content-Security-Policy", value: buildCsp(dev) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=(), usb=(), interest-cohort=(), geolocation=(self)" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    ...(dev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
  ];
}

/** Best-effort client IP (Vercel sets x-forwarded-for / x-real-ip). */
export function clientIp(h: Headers) {
  return h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip")?.trim() || "local";
}

/** Sliding-window in-memory limiter. Per server instance only (fine for spam control; not a hard quota). */
export function createLimiter(maxKeys = 10_000) {
  const hits = new Map<string, number[]>();
  return function hit(key: string, max: number, windowMs: number, now = Date.now()) {
    const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs); arr.push(now);
    hits.delete(key); hits.set(key, arr); // re-insert → Map order = LRU
    if (hits.size > maxKeys) hits.delete(hits.keys().next().value as string);
    return { limited: arr.length > max, remaining: Math.max(0, max - arr.length), retryAfterSec: Math.ceil((arr[0] + windowMs - now) / 1000) };
  };
}
const shared = createLimiter();
/** Limits for public write endpoints (per IP). */
export const LIMITS = { subscribe: { max: 5, windowMs: 60_000 }, submit: { max: 5, windowMs: 3_600_000 }, contact: { max: 5, windowMs: 3_600_000 } } as const;
export function limitHit(name: keyof typeof LIMITS, ip: string, now?: number) { const l = LIMITS[name]; return shared(`${name}:${ip}`, l.max, l.windowMs, now); }

/** Hidden fields bots fill in. "website" (submit/contact forms) and "company" (digest form). */
export const HONEYPOT_FIELDS = ["website", "company"] as const;
export const honeypotTripped = (o: Record<string, unknown> | FormData) =>
  HONEYPOT_FIELDS.some((f) => { const v = o instanceof FormData ? o.get(f) : o[f]; return v != null && String(v).trim() !== ""; });
