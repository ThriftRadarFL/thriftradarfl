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
// Read-after-write under live sweep load can briefly hit a seed-fallback isolate; poll a few times before failing.
const eventually = async (fn, msg, tries = 8, ms = 400) => { for (let i = 0; i < tries; i++) { if (await fn()) { ok++; return true; } await new Promise((r) => setTimeout(r, ms)); } fails.push(msg); return false; };

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
  if (p.startsWith("/stores/") && !["/stores/compare", "/stores/report-cards"].includes(p)) check(/"@type":"(Store|LocalBusiness|ThriftStore|[A-Za-z]*Store)"/.test(ld), `${p} no Store JSON-LD`);
  if (p.startsWith("/sales/")) check(/"@type":"(Event|SaleEvent)"/.test(ld), `${p} no Event JSON-LD`);
  check(h.length < 400_000, `${p} HTML is ${Math.round(h.length / 1024)} KB`);
  if (seenTitles.has(title)) fails.push(`duplicate <title> "${title}" on ${p} and ${seenTitles.get(title)}`); else seenTitles.set(title, p);
}

// 2 · Non-sitemap pages + 404s are real 404s with noindex.
for (const p of ["/saved", "/search?q=goodwill", "/admin", "/offline", "/weekend?zip=32127&r=25", "/plan?day=2026-11-07", "/saved?list=a,b"]) { const r = await get(p); check(r.status === 200, `${p} → ${r.status}`); }
for (const p of ["/nope", "/sales/nope", "/stores/nope", "/city/nope", "/stores/../../etc/passwd", "/sales/%3Cscript%3E"]) {
  const r = await get(p); const h = await r.text();
  // Vercel's edge firewall rejects path traversal with a plain 403 before the app sees it; that's fine too.
  if (p.includes("..") && r.status === 403) { ok++; continue; }
  check(r.status === 404, `${p} → ${r.status} (want 404)`); check(/noindex/.test(h), `${p} 404 without noindex`);
}

// 3 · APIs + feeds.
const api = [["/api/health", 200, "application/json"], ["/api/sales?upcoming=1", 200, "application/json"], ["/api/venues", 200, "application/json"], ["/api/deal-rules", 200, "application/json"],
  ["/api/venues/goodwill-port-orange/today", 200, "application/json"], ["/api/venues/nope/today", 404], ["/api/sales/nope", 404], ["/api/sales?type=bogus", 400],
  ["/api/calendar", 200, "text/calendar"], ["/api/calendar/deals", 200, "text/calendar"], ["/api/calendar/deals?venue=goodwill-port-orange", 200, "text/calendar"],
  ["/feed.xml", 200, "xml"], ["/robots.txt", 200, "text/plain"], ["/manifest.webmanifest", 200], ["/opengraph-image", 200, "image/png"], ["/stores/goodwill-port-orange/opengraph-image", 200, "image/png"],
  ["/api/cron/digest", 401], ["/api/admin/subscribers", 401], ["/api/admin/export?what=audit", 401],
  ["/embed/stores/goodwill-port-orange", 200, "text/html"], ["/embed/stores/goodwill-port-orange?compact=1", 200, "text/html"], ["/embed/stores/nope", 404], ["/feed.xml?city=port-orange", 200, "xml"], ["/feed.xml?city=atlantis", 404],
  ["/stores/compare?s=goodwill-pine-hills-outlet,goodwill-taft-outlet", 200, "text/html"], ["/stores/compare?s=nope", 200, "text/html"],
  ["/stores/report-cards?grade=D", 200, "text/html"], ["/stores/report-cards?grade=zz&city=nowhere", 200, "text/html"], ["/api/report-cards", 200, "application/json"], ["/api/report-cards?venue=nope", 404, "application/json"]];
for (const [p, want, ct] of api) { const r = await get(p); check(r.status === want, `${p} → ${r.status} (want ${want})`); if (ct) check((r.headers.get("content-type") ?? "").includes(ct), `${p} content-type ${r.headers.get("content-type")}`); }
{ const e = await get("/embed/stores/goodwill-port-orange"); check(/frame-ancestors \*/.test(e.headers.get("content-security-policy") ?? ""), "embed not framable"); check(!e.headers.get("x-frame-options"), "embed sends X-Frame-Options");
  { const s = await (await get("/stores/goodwill-port-orange")).text(); check(s.includes("Info report card"), "store page missing report card"); const r = await (await get("/api/report-cards?venue=goodwill-port-orange")).json(); check(r.count === 1 && /^[A-F]$/.test(r.data[0].grade), "report-cards API shape"); }
  check(/<script/i.test(await e.text()) === false, "embed has a script"); const c = await (await get("/stores/compare?s=goodwill-pine-hills-outlet,goodwill-taft-outlet")).text(); check(c.includes("Best pick") || c.includes("Best day"), "compare table missing");
  check(/frame-ancestors 'self'/.test((await get("/stores/goodwill-port-orange")).headers.get("content-security-policy") ?? ""), "store page framable"); }
const sec = await get("/"); for (const h of ["content-security-policy", "x-content-type-options", "referrer-policy", "x-frame-options"]) check(sec.headers.get(h), `missing header ${h}`);

// 3b · 10 PM pass: suggest API, public-read caching + ETag/304, homepage hero, errors stay no-store.
{ const r = await get("/api/suggest?q=port%20or"); const j = await r.json(); check(r.status === 200 && j.count > 0, "suggest returned nothing for 'port or'");
  check(j.data?.every((x) => ["city", "store", "sale"].includes(x.kind) && x.href.startsWith("/")), "suggest item shape"); check(j.data?.[0]?.href === "/city/port-orange", `suggest top hit ${j.data?.[0]?.href}`);
  for (const x of (j.data ?? []).slice(0, 4)) { const t = await get(x.href); check(t.status === 200, `suggest link ${x.href} → ${t.status}`); }
  const e = await (await get("/api/suggest?q=a")).json(); check(e.count === 0, "suggest answers 1-char queries");
  const long = await get("/api/suggest?q=" + "x".repeat(500)); check(long.status === 200, "suggest long q → " + long.status);
  for (const p of ["/api/sales?upcoming=1", "/api/venues", "/api/deal-rules", "/api/venues/goodwill-port-orange", "/api/venues/goodwill-port-orange/today", "/api/suggest?q=goodwill"]) {
    const a = await get(p); check(/public, max-age=\d+/.test(a.headers.get("cache-control") ?? ""), `${p} cache-control ${a.headers.get("cache-control")}`); const et = a.headers.get("etag"); check(et, `${p} no ETag`);
    if (et) { const b = await get(p, { headers: { "if-none-match": et } }); check(b.status === 304, `${p} If-None-Match → ${b.status} (want 304)`); } }
  for (const p of ["/api/sales/nope", "/api/health"]) check((await get(p)).headers.get("cache-control") === "no-store", `${p} should be no-store`);
  const h = await (await get("/")).text(); check(/action="\/weekend"/.test(h) && /name="zip"/.test(h), "home hero ZIP form missing"); check(/role="combobox"/.test(h), "nav combobox missing"); check(/Quick links/.test(h), "home quick links missing"); }

// 4 · Admin write flow over the REST API (JSON mode): create → read → edit → publish toggle → delete, plus venue + deal rule.
if (PW) {
  check((await get("/api/sales", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })).status === 401, "POST /api/sales without auth not 401");
  const slug = "sweep-test-sale"; const d = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10);
  const sale = { slug, title: "Sweep Test Sale", type: "estate", city: "Port Orange", zip: "32127", days: [{ date: d, start: "09:00", end: "14:00" }], paymentMethods: ["cash"] };
  let r = await get("/api/sales", { method: "POST", headers: auth, body: JSON.stringify(sale) }); check(r.status === 201, `create sale → ${r.status} ${await r.text()}`);
  r = await get("/api/sales", { method: "POST", headers: auth, body: JSON.stringify(sale) }); check(r.status === 409, `duplicate sale → ${r.status}`);
  await eventually(async () => (await get(`/sales/${slug}`)).status === 200, "new sale page not 200");
  r = await get(`/api/sales/${slug}`, { method: "PUT", headers: auth, body: JSON.stringify({ title: "Sweep Test Sale (edited)" }) }); check(r.status === 200, `edit sale → ${r.status}`);
  await eventually(async () => (await (await get(`/sales/${slug}`)).text()).includes("Sweep Test Sale (edited)"), "edited title not shown");
  r = await get(`/api/sales/${slug}`, { method: "PUT", headers: auth, body: JSON.stringify({ published: false }) }); check(r.status === 200, `unpublish → ${r.status}`);
  check(!(await (await get("/sitemap.xml")).text()).includes(slug), "unpublished sale still in sitemap");
  r = await get("/api/sales", { method: "POST", headers: auth, body: JSON.stringify({ ...sale, slug: "sweep-bad", days: [{ date: "2026-02-30", start: "09:00", end: "14:00" }] }) }); check(r.status === 400, `invalid date accepted → ${r.status}`);
  r = await get(`/api/sales/${slug}`, { method: "DELETE", headers: auth }); check(r.status === 204, `delete sale → ${r.status}`);
  check((await get(`/sales/${slug}`)).status === 404, "deleted sale page not 404");
  const rule = { venue: "goodwill-port-orange", day: 5, kind: "half_off", label: "Sweep test half off", discountPct: 50, verified: false };
  r = await get("/api/deal-rules", { method: "POST", headers: auth, body: JSON.stringify(rule) }); const body = await r.json().catch(() => ({})); check(r.status === 201, `create rule → ${r.status}`);
  await eventually(async () => (await (await get("/deals")).text()).includes("Sweep test half off"), "new rule not on /deals");
  if (body.data?.id) { r = await get(`/api/deal-rules?id=${encodeURIComponent(body.data.id)}`, { method: "DELETE", headers: auth }); check(r.status === 200, `delete rule → ${r.status}`); }
  const origNotes = (await (await get("/api/venues/goodwill-port-orange")).json()).data?.notes ?? "";
  r = await get("/api/venues/goodwill-port-orange", { method: "PUT", headers: auth, body: JSON.stringify({ notes: "Sweep note" }) }); check(r.status === 200, `edit venue → ${r.status}`);
  await eventually(async () => (await (await get("/stores/goodwill-port-orange")).text()).includes("Sweep note"), "venue edit not shown");
  await get("/api/venues/goodwill-port-orange", { method: "PUT", headers: auth, body: JSON.stringify({ notes: origNotes }) }); // restore prod notes
} else console.log("(skipping admin write checks: set ADMIN_PASSWORD)");

console.log(`${ok} checks passed, ${fails.length} failed, ${urls.length} sitemap URLs`);
for (const f of fails) console.log("  ✗ " + f);
process.exit(fails.length ? 1 : 0);
