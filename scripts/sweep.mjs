#!/usr/bin/env node
// End-to-end verification sweep against a running server (no deps; Node 18+ fetch).
// Usage: B=http://localhost:3100 ADMIN_PASSWORD=... node scripts/sweep.mjs
// Run it against `next start` with THRIFTRADAR_DATA_DIR pointing at a scratch copy of data/ and DATABASE_URL="" so
// the admin write checks never touch real data. Exits 1 on any failure.
const B = process.env.B ?? "http://localhost:3100"; const PW = process.env.ADMIN_PASSWORD ?? "";
const fails = []; let ok = 0;
const check = (cond, msg) => { if (cond) ok++; else fails.push(msg); };
const get = (p, init) => fetch(B + p, { redirect: "manual", ...init });
const auth = { authorization: `Bearer ${PW}`, "content-type": "application/json" };

// 1 · Sitemap: every URL resolves 200 with a title, description, canonical, og:title and parseable JSON-LD.
const sm = await (await get("/sitemap.xml")).text();
const urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
check(urls.length > 20, `sitemap has only ${urls.length} URLs`);
const seenTitles = new Map();
for (const p of urls) {
  const r = await get(p); const h = await r.text();
  check(r.status === 200, `sitemap ${p} → ${r.status}`);
  const title = h.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";
  check(title.length > 5, `${p} missing <title>`);
  check(/<meta name="description" content="[^"]{30,}/.test(h), `${p} missing/short meta description`);
  check(/<link rel="canonical"/.test(h), `${p} missing canonical`);
  check(/<meta property="og:title"/.test(h), `${p} missing og:title`);
  check(!/noindex/.test(h.match(/<meta name="robots"[^>]*>/)?.[0] ?? ""), `${p} is in the sitemap but noindex`);
  for (const m of h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); ok++; } catch { fails.push(`${p} JSON-LD does not parse`); } }
  check(/<meta property="og:image"/.test(h), `${p} missing og:image`);
  check((h.match(/<h1[\s>]/g) ?? []).length === 1, `${p} has ${(h.match(/<h1[\s>]/g) ?? []).length} <h1>`);
  const ld = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]).join(" ");
  if (p.startsWith("/stores/")) check(/"@type":"(Store|LocalBusiness|ThriftStore|[A-Za-z]*Store)"/.test(ld), `${p} no Store JSON-LD`);
  if (p.startsWith("/sales/")) check(/"@type":"(Event|SaleEvent)"/.test(ld), `${p} no Event JSON-LD`);
  check(h.length < 400_000, `${p} HTML is ${Math.round(h.length / 1024)} KB`);
  if (seenTitles.has(title)) fails.push(`duplicate <title> "${title}" on ${p} and ${seenTitles.get(title)}`); else seenTitles.set(title, p);
}

// 2 · Non-sitemap pages + 404s are real 404s with noindex.
for (const p of ["/saved", "/search?q=goodwill", "/admin", "/offline", "/weekend?zip=32127&r=25", "/plan?day=2026-11-07", "/saved?list=a,b"]) { const r = await get(p); check(r.status === 200, `${p} → ${r.status}`); }
for (const p of ["/nope", "/sales/nope", "/stores/nope", "/city/nope", "/stores/../../etc/passwd", "/sales/%3Cscript%3E"]) {
  const r = await get(p); const h = await r.text(); check(r.status === 404, `${p} → ${r.status} (want 404)`); check(/noindex/.test(h), `${p} 404 without noindex`);
}

// 3 · APIs + feeds.
const api = [["/api/health", 200, "application/json"], ["/api/sales?upcoming=1", 200, "application/json"], ["/api/venues", 200, "application/json"], ["/api/deal-rules", 200, "application/json"],
  ["/api/venues/goodwill-port-orange/today", 200, "application/json"], ["/api/venues/nope/today", 404], ["/api/sales/nope", 404], ["/api/sales?type=bogus", 400],
  ["/api/calendar", 200, "text/calendar"], ["/api/calendar/deals", 200, "text/calendar"], ["/api/calendar/deals?venue=goodwill-port-orange", 200, "text/calendar"],
  ["/feed.xml", 200, "xml"], ["/robots.txt", 200, "text/plain"], ["/manifest.webmanifest", 200], ["/opengraph-image", 200, "image/png"], ["/stores/goodwill-port-orange/opengraph-image", 200, "image/png"],
  ["/api/cron/digest", 401], ["/api/admin/subscribers", 401]];
for (const [p, want, ct] of api) { const r = await get(p); check(r.status === want, `${p} → ${r.status} (want ${want})`); if (ct) check((r.headers.get("content-type") ?? "").includes(ct), `${p} content-type ${r.headers.get("content-type")}`); }
const sec = await get("/"); for (const h of ["content-security-policy", "x-content-type-options", "referrer-policy", "x-frame-options"]) check(sec.headers.get(h), `missing header ${h}`);

// 4 · Admin write flow over the REST API (JSON mode): create → read → edit → publish toggle → delete, plus venue + deal rule.
if (PW) {
  check((await get("/api/sales", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).status === 401, "POST /api/sales without auth not 401");
  const slug = "sweep-test-sale"; const d = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10);
  const sale = { slug, title: "Sweep Test Sale", type: "estate", city: "Port Orange", zip: "32127", days: [{ date: d, start: "09:00", end: "14:00" }], paymentMethods: ["cash"] };
  let r = await get("/api/sales", { method: "POST", headers: auth, body: JSON.stringify(sale) }); check(r.status === 201, `create sale → ${r.status} ${await r.text()}`);
  r = await get("/api/sales", { method: "POST", headers: auth, body: JSON.stringify(sale) }); check(r.status === 409, `duplicate sale → ${r.status}`);
  check((await get(`/sales/${slug}`)).status === 200, "new sale page not 200");
  r = await get(`/api/sales/${slug}`, { method: "PUT", headers: auth, body: JSON.stringify({ title: "Sweep Test Sale (edited)" }) }); check(r.status === 200, `edit sale → ${r.status}`);
  check((await (await get(`/sales/${slug}`)).text()).includes("Sweep Test Sale (edited)"), "edited title not shown");
  r = await get(`/api/sales/${slug}`, { method: "PUT", headers: auth, body: JSON.stringify({ published: false }) }); check(r.status === 200, `unpublish → ${r.status}`);
  check(!(await (await get("/sitemap.xml")).text()).includes(slug), "unpublished sale still in sitemap");
  r = await get("/api/sales", { method: "POST", headers: auth, body: JSON.stringify({ ...sale, slug: "sweep-bad", days: [{ date: "2026-02-30", start: "09:00", end: "14:00" }] }) }); check(r.status === 400, `invalid date accepted → ${r.status}`);
  r = await get(`/api/sales/${slug}`, { method: "DELETE", headers: auth }); check(r.status === 204, `delete sale → ${r.status}`);
  check((await get(`/sales/${slug}`)).status === 404, "deleted sale page not 404");
  const rule = { venue: "goodwill-port-orange", day: 5, kind: "half_off", label: "Sweep test half off", discountPct: 50, verified: false };
  r = await get("/api/deal-rules", { method: "POST", headers: auth, body: JSON.stringify(rule) }); const body = await r.json().catch(() => ({})); check(r.status === 201, `create rule → ${r.status}`);
  check((await (await get("/deals")).text()).includes("Sweep test half off"), "new rule not on /deals");
  if (body.data?.id) { r = await get(`/api/deal-rules?id=${encodeURIComponent(body.data.id)}`, { method: "DELETE", headers: auth }); check(r.status === 200, `delete rule → ${r.status}`); }
  r = await get("/api/venues/goodwill-port-orange", { method: "PUT", headers: auth, body: JSON.stringify({ notes: "Sweep note" }) }); check(r.status === 200, `edit venue → ${r.status}`);
  check((await (await get("/stores/goodwill-port-orange")).text()).includes("Sweep note"), "venue edit not shown");
} else console.log("(skipping admin write checks: set ADMIN_PASSWORD)");

console.log(`${ok} checks passed, ${fails.length} failed, ${urls.length} sitemap URLs`);
for (const f of fails) console.log("  ✗ " + f);
process.exit(fails.length ? 1 : 0);
