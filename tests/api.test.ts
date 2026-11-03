// Route handlers invoked directly with Request objects (JSON data mode, temp data dir).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
const dir = mkdtempSync(path.join(tmpdir(), "tr-api-"));
process.env.THRIFTRADAR_DATA_DIR = dir; delete process.env.DATABASE_URL;
process.env.ADMIN_PASSWORD = "test-pw"; process.env.CRON_SECRET = "cron-test"; delete process.env.RESEND_API_KEY;
const U = "http://localhost:3000";
const req = (p: string, init?: RequestInit) => new Request(U + p, init);
const ctx = (slug: string) => ({ params: Promise.resolve({ slug }) });
/* eslint-disable @typescript-eslint/no-explicit-any */
let sales: any, saleOne: any, subs: any, ics: any, cal: any, digest: any, unsub: any, rules: any, venues: any, health: any, auth: any;
before(async () => {
  [sales, saleOne, subs, ics, cal, digest, unsub, rules, venues, health, auth] = await Promise.all([
    import("../src/app/api/sales/route"), import("../src/app/api/sales/[slug]/route"), import("../src/app/api/subscribers/route"), import("../src/app/api/ics/[slug]/route"),
    import("../src/app/api/calendar/route"), import("../src/app/api/cron/digest/route"), import("../src/app/api/unsubscribe/route"), import("../src/app/api/deal-rules/route"),
    import("../src/app/api/venues/route"), import("../src/app/api/health/route"), import("../src/lib/auth")]);
});
after(() => rmSync(dir, { recursive: true, force: true }));

test("GET /api/sales lists, filters and validates", async () => {
  const all = await (await sales.GET(req("/api/sales"))).json(); assert.ok(all.count > 0);
  const est = await (await sales.GET(req("/api/sales?type=estate"))).json(); assert.ok(est.data.every((s: any) => s.type === "estate"));
  assert.equal((await sales.GET(req("/api/sales?type=bogus"))).status, 400);
  const fut = await (await sales.GET(req("/api/sales?from=2099-01-01"))).json(); assert.equal(fut.count, 0);
});
test("POST /api/sales requires admin and validates", async () => {
  const body = JSON.stringify({ title: "API sale", type: "yard", city: "DeLand", days: "2099-03-01 08:00 12:00" });
  assert.equal((await sales.POST(req("/api/sales", { method: "POST", body }))).status, 401);
  const H = { authorization: "Bearer test-pw" };
  assert.equal((await sales.POST(req("/api/sales", { method: "POST", headers: H, body: "{bad" }))).status, 400);
  assert.equal((await sales.POST(req("/api/sales", { method: "POST", headers: H, body: JSON.stringify({ title: "" }) }))).status, 400);
  const r = await sales.POST(req("/api/sales", { method: "POST", headers: H, body })); assert.equal(r.status, 201);
  const slug = (await r.json()).data.slug; assert.equal((await sales.POST(req("/api/sales", { method: "POST", headers: H, body }))).status, 409);
  assert.equal((await saleOne.GET(req(`/api/sales/${slug}`), ctx(slug))).status, 200);
  assert.equal((await saleOne.GET(req("/api/sales/nope"), ctx("nope"))).status, 404);
});
test("subscribers: signup, dedupe, bad email, admin list", async () => {
  const post = (b: unknown) => subs.POST(req("/api/subscribers", { method: "POST", body: JSON.stringify(b), headers: { "x-forwarded-for": "10.0.0.9" } }));
  assert.equal((await post({ email: "x@y.co" })).status, 201); assert.equal((await post({ email: "X@y.co" })).status, 200);
  assert.equal((await post({ email: "nope" })).status, 400);
  assert.equal((await subs.GET(req("/api/subscribers"))).status, 401);
  assert.equal((await (await subs.GET(req("/api/subscribers", { headers: { authorization: "Bearer test-pw" } }))).json()).count, 1);
});
test("unsubscribe needs a valid token", async () => {
  assert.equal((await unsub.GET(req("/api/unsubscribe?e=x@y.co&t=bad"))).status, 400);
  const ok = await unsub.GET(req(`/api/unsubscribe?e=x@y.co&t=${auth.unsubToken("x@y.co")}`)); assert.equal(ok.status, 200);
});
test(".ics per sale and calendar feed", async () => {
  const first = (await (await sales.GET(req("/api/sales"))).json()).data[0];
  const r = await ics.GET(req(`/api/ics/${first.slug}`), ctx(first.slug)); assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type") ?? "", /text\/calendar/); const body = await r.text();
  assert.ok(body.startsWith("BEGIN:VCALENDAR\r\n")); assert.ok(body.trimEnd().endsWith("END:VCALENDAR"));
  assert.equal((body.match(/BEGIN:VEVENT/g) ?? []).length, first.days.length); assert.ok(body.includes("UID:"));
  assert.equal((await ics.GET(req("/api/ics/nope"), ctx("nope"))).status, 404);
  const feed = await (await cal.GET(req("/api/calendar"))).text(); assert.ok((feed.match(/BEGIN:VEVENT/g) ?? []).length >= first.days.length);
});
test("cron digest: auth required, dry run never sends", async () => {
  assert.equal((await digest.GET(req("/api/cron/digest"))).status, 401);
  const j = await (await digest.GET(req("/api/cron/digest?dry=1&from=2026-11-10", { headers: { authorization: "Bearer cron-test" } }))).json();
  assert.equal(j.dryRun, true); assert.ok(j.subject.startsWith("ThriftRadarFL")); assert.equal(j.unsubscribeLinkOk, true);
});
test("deal-rules, venues, health", async () => {
  const r = await (await rules.GET(req("/api/deal-rules"))).json(); assert.ok(r.count > 0); assert.ok(r.data.every((x: any) => x.id));
  const v = await (await venues.GET(req("/api/venues"))).json(); assert.ok(v.count > 0);
  const h = await (await health.GET()).json(); assert.equal(h.dataMode, "json"); assert.equal(h.adminConfigured, true);
});

test("PUT /api/sales/{slug} honours published:false (hidden, out of public API) and can re-publish; edits keep the flag", async () => {
  const H = { authorization: "Bearer test-pw", "content-type": "application/json" }; const slug = "pub-flag-test"; const d = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10);
  assert.equal((await sales.POST(req("/api/sales", { method: "POST", headers: H, body: JSON.stringify({ slug, title: "Pub Flag", type: "estate", city: "Port Orange", zip: "32127", days: [{ date: d, start: "09:00", end: "14:00" }] }) }))).status, 201);
  const put = (body: object) => saleOne.PUT(req(`/api/sales/${slug}`, { method: "PUT", headers: H, body: JSON.stringify(body) }), ctx(slug));
  assert.equal((await put({ published: false })).status, 200);
  assert.equal((await saleOne.GET(req(`/api/sales/${slug}`), ctx(slug))).status, 404, "unpublished sale must not be public");
  assert.equal((await put({ title: "Pub Flag edited" })).status, 200, "admin can still edit an unpublished sale");
  assert.equal((await saleOne.GET(req(`/api/sales/${slug}`), ctx(slug))).status, 404, "editing must not silently re-publish");
  assert.equal((await sales.POST(req("/api/sales", { method: "POST", headers: H, body: JSON.stringify({ slug, title: "Clobber", type: "estate", city: "Port Orange", days: [{ date: d, start: "09:00", end: "14:00" }] }) }))).status, 409, "POST can't overwrite an unpublished slug");
  const del = (s2: string) => saleOne.DELETE(req(`/api/sales/${s2}`, { method: "DELETE", headers: H }), ctx(s2));
  assert.equal((await sales.POST(req("/api/sales", { method: "POST", headers: H, body: JSON.stringify({ slug: slug + "-2", title: "Hidden", type: "estate", city: "Port Orange", published: false, days: [{ date: d, start: "09:00", end: "14:00" }] }) }))).status, 201);
  assert.equal((await saleOne.GET(req(`/api/sales/${slug}-2`), ctx(slug + "-2"))).status, 404, "POST published:false stays hidden");
  assert.equal((await del(slug + "-2")).status, 204, "admin can delete an unpublished sale");
  assert.equal((await put({ published: true })).status, 200);
  const got = await (await saleOne.GET(req(`/api/sales/${slug}`), ctx(slug))).json(); assert.equal(got.data.title, "Pub Flag edited");
  assert.equal((await saleOne.DELETE(req(`/api/sales/${slug}`, { method: "DELETE", headers: H }), ctx(slug))).status, 204);
});
