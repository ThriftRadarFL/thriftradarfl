// Hardening: headers/CSP, rate limit, honeypot, validation caps, admin-auth audit, health, cron fail-closed.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
const dir = mkdtempSync(path.join(tmpdir(), "tr-sec-"));
process.env.THRIFTRADAR_DATA_DIR = dir; delete process.env.DATABASE_URL;
process.env.ADMIN_PASSWORD = "test-pw"; delete process.env.RESEND_API_KEY;
import { buildCsp, securityHeaders, createLimiter, honeypotTripped, clientIp, LIMITS } from "../src/lib/security";
import { parseSale, parseContact, parseSubscriber, CAPS } from "../src/lib/validate";
/* eslint-disable @typescript-eslint/no-explicit-any */
let subs: any, health: any, cron: any, data: any;
before(async () => { [subs, health, cron, data] = await Promise.all([import("../src/app/api/subscribers/route"), import("../src/app/api/health/route"), import("../src/app/api/cron/digest/route"), import("../src/lib/data")]); });
after(() => rmSync(dir, { recursive: true, force: true }));
const day = "2099-03-01 08:00 12:00";

test("CSP allows MapLibre/MapTiler and blocks framing/objects; dev-only eval", () => {
  const prod = buildCsp(false), dev = buildCsp(true);
  for (const d of ["default-src 'self'", "frame-ancestors 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "worker-src 'self' blob:"]) assert.ok(prod.includes(d), d);
  assert.match(prod, /connect-src [^;]*https:\/\/api\.maptiler\.com/); assert.match(prod, /img-src [^;]*blob:/);
  assert.ok(!prod.includes("unsafe-eval")); assert.ok(dev.includes("'unsafe-eval'"));
  const keys = securityHeaders(false).map((h) => h.key);
  for (const k of ["Content-Security-Policy", "X-Frame-Options", "Referrer-Policy", "X-Content-Type-Options", "Permissions-Policy", "Strict-Transport-Security"]) assert.ok(keys.includes(k), k);
  assert.ok(!securityHeaders(true).some((h) => h.key === "Strict-Transport-Security"), "no HSTS on localhost");
});
test("next.config applies security headers to every route", async () => {
  const cfg = (await import("../next.config")).default as any; const rules = await cfg.headers();
  const all = rules.find((r: any) => r.source === "/(.*)"); assert.ok(all.headers.some((h: any) => h.key === "Content-Security-Policy"));
  assert.equal(cfg.poweredByHeader, false);
});
test("limiter: sliding window, per key, bounded memory", () => {
  const hit = createLimiter(3); const t = 1_000_000;
  for (let i = 0; i < 5; i++) assert.equal(hit("a", 5, 60_000, t + i).limited, false);
  const sixth = hit("a", 5, 60_000, t + 10); assert.equal(sixth.limited, true); assert.ok(sixth.retryAfterSec > 0 && sixth.retryAfterSec <= 60);
  assert.equal(hit("b", 5, 60_000, t).limited, false, "other IP unaffected");
  assert.equal(hit("a", 5, 60_000, t + 61_000).limited, false, "window slides");
  hit("c", 5, 60_000, t); hit("d", 5, 60_000, t); // evicts oldest keys beyond 3
  assert.deepEqual(Object.keys(LIMITS).sort(), ["contact", "submit", "subscribe"]);
  assert.equal(clientIp(new Headers({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" })), "1.2.3.4"); assert.equal(clientIp(new Headers()), "local");
});
test("honeypot detects filled hidden fields (object + FormData)", () => {
  assert.equal(honeypotTripped({ email: "a@b.co" }), false); assert.equal(honeypotTripped({ website: "  " }), false);
  assert.equal(honeypotTripped({ website: "http://spam" }), true); assert.equal(honeypotTripped({ company: "ACME" }), true);
  const fd = new FormData(); fd.set("email", "a@b.co"); assert.equal(honeypotTripped(fd), false); fd.set("website", "x"); assert.equal(honeypotTripped(fd), true);
});
test("validation length caps", () => {
  assert.equal(parseSale({ title: "x".repeat(CAPS.title + 1), city: "DeLand", days: day }).ok, false);
  assert.equal(parseSale({ title: "ok", city: "c".repeat(CAPS.city + 1), days: day }).ok, false);
  assert.equal(parseSale({ title: "ok", city: "DeLand", days: Array(CAPS.days + 1).fill(day).join("\n") }).ok, false);
  assert.equal(parseSale({ title: "ok", city: "DeLand", days: day, zip: "<script>" }).ok, false);
  assert.equal(parseSale({ title: "ok", city: "DeLand", days: day, sourceUrl: "https://x.co/" + "a".repeat(CAPS.url) }).ok, false);
  const ok = parseSale({ title: "ok", city: "DeLand", days: day, zip: "32720", paymentMethods: Array(20).fill("cash".repeat(20)).join(",") });
  assert.ok(ok.ok && ok.value.paymentMethods.length === CAPS.payment && ok.value.paymentMethods.every((p) => p.length <= CAPS.paymentItem));
  assert.equal(parseContact({ name: "A", email: "a@b.co", message: "m".repeat(CAPS.message + 1) }).ok, false);
  const s = parseSubscriber({ email: "a@b.co", area: "z".repeat(500) }); assert.ok(s.ok && s.value.area.length === CAPS.area);
  assert.equal(parseSubscriber({ email: "x".repeat(300) + "@b.co" }).ok, false);
});
test("POST /api/subscribers: honeypot stores nothing, 6th request → 429 + Retry-After", async () => {
  const post = (b: unknown, ip: string) => subs.POST(new Request("http://localhost/api/subscribers", { method: "POST", body: JSON.stringify(b), headers: { "x-forwarded-for": ip } }));
  const bot = await post({ email: "bot@spam.co", company: "Spam LLC" }, "10.9.9.1"); assert.equal(bot.status, 200); assert.equal((await bot.json()).added, false);
  assert.ok(!(await data.listSubscribers()).some((s: any) => s.email === "bot@spam.co"));
  for (let i = 0; i < 5; i++) assert.notEqual((await post({ email: `u${i}@b.co` }, "10.9.9.2")).status, 429);
  const r = await post({ email: "u9@b.co" }, "10.9.9.2"); assert.equal(r.status, 429); assert.ok(Number(r.headers.get("retry-after")) > 0);
  assert.equal((await post({ email: "other@b.co" }, "10.9.9.3")).status, 201);
  const big = await subs.POST(new Request("http://localhost/api/subscribers", { method: "POST", body: JSON.stringify({ email: "a@b.co", pad: "x".repeat(5000) }), headers: { "x-forwarded-for": "10.9.9.4" } }));
  assert.equal(big.status, 413);
});
test("admin auth audit: every admin server action guards; every write API checks admin", () => {
  const actions = readFileSync("src/app/admin/actions.ts", "utf8");
  const fns = [...actions.matchAll(/export async function (\w+)\([^)]*\)[^{]*\{([\s\S]*?)(?=\nexport |\n?$)/g)];
  assert.ok(fns.length >= 10); const publicOk = new Set(["login", "logout"]);
  for (const [, name, body] of fns) if (!publicOk.has(name)) assert.match(body.trimStart(), /^await guard\(\)/, `${name} must start with await guard()`);
  const walk = (d: string): string[] => readdirSync(d).flatMap((f) => { const p = path.join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith("route.ts") ? [p] : []; });
  const publicWrites = new Set(["src/app/api/subscribers/route.ts:POST", "src/app/api/unsubscribe/route.ts:POST"]);
  for (const f of walk("src/app/api")) {
    const src = readFileSync(f, "utf8"); const rel = f.split(path.sep).join("/");
    for (const m of ["POST", "PUT", "PATCH", "DELETE"]) {
      const re = new RegExp(`export (const|async function) ${m}\\b([\\s\\S]*?)(?=\\nexport |$)`); const hit = src.match(re); if (!hit || publicWrites.has(`${rel}:${m}`)) continue;
      assert.match(hit[2], /isAdminRequest\(req\)/, `${rel} ${m} must check isAdminRequest`);
    }
    if (rel.startsWith("src/app/api/admin/")) assert.match(src, /isAdminRequest\(req\)/, `${rel} must check admin`);
  }
});
test("admin write APIs reject wrong password and missing auth", async () => {
  const sales = await import("../src/app/api/sales/route"); const body = JSON.stringify({ title: "x", city: "DeLand", days: day });
  for (const authorization of ["", "Bearer wrong", "Basic test-pw"]) assert.equal((await sales.POST(new Request("http://localhost/api/sales", { method: "POST", body, headers: authorization ? { authorization } : {} }))).status, 401);
});
test("health reports json mode without DB, never leaks secrets", async () => {
  const r = await health.GET(); assert.equal(r.status, 200); const h = await r.json();
  assert.equal(h.mode, "json"); assert.equal(h.dataMode, "json"); assert.equal(h.db.configured, false); assert.ok(h.venues > 0);
  assert.ok(!JSON.stringify(h).includes("test-pw"));
});
test("cron fails closed in production without CRON_SECRET", async () => {
  const env = process.env as Record<string, string | undefined>; const prev = env.NODE_ENV; delete env.CRON_SECRET; env.NODE_ENV = "production";
  try { assert.equal((await cron.GET(new Request("http://localhost/api/cron/digest?dry=1"))).status, 401); } finally { env.NODE_ENV = prev; }
});
