// 9 PM pass: embeddable store widget, compare stores, API docs, per-city Atom feed, admin CSV exports.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
const dir = mkdtempSync(path.join(tmpdir(), "tr-embed-"));
process.env.THRIFTRADAR_DATA_DIR = dir; delete process.env.DATABASE_URL; process.env.ADMIN_PASSWORD = "test-pw";
import { storeWidgetHtml, notFoundWidgetHtml, embedSnippet, embedOpts, esc } from "../src/lib/embed";
import { parseCompare, compareStores, MAX_COMPARE } from "../src/lib/compare";
import { API_DOCS } from "../src/lib/api-docs";
import { atomFeed } from "../src/lib/new-sales";
import { csvCell, toCsv, submissionsCsv } from "../src/lib/csv-export";
import { securityHeaders, buildCsp } from "../src/lib/security";
import type { DealRule } from "../src/lib/deal-rules";
/* eslint-disable @typescript-eslint/no-explicit-any */
after(() => rmSync(dir, { recursive: true, force: true }));
const R = (venue: string, day: number, label: string, discountPct?: number, verified = false): DealRule => ({ id: `${venue}-${day}`, venue, day, kind: "half_off", label, color: "bg-coral", verified, discountPct });
const V = (slug: string, extra: any = {}) => ({ slug, name: `Store <${slug}>`, city: "Port Orange", type: "thrift", lat: 29.1, lng: -81.0, hoursJson: { daily: "9:00-21:00" } as Record<string, string> | null, ...extra });
const rules = [R("a", 1, "Half off <all>", 50, true), R("a", 3, "Seniors", 10), R("b", 1, "Quarter off", 25), R("b", 4, "Dollar day", 40)];

test("widget: escapes names/labels, marks today, best day, compact hides the list, links back", () => {
  const html = storeWidgetHtml(V("a"), rules, "2026-11-02", "https://x.test"); // Monday
  assert.ok(html.startsWith("<!doctype html>") && html.includes("noindex") && html.includes('<base target="_blank">'));
  assert.ok(html.includes("Store &lt;a&gt;") && !html.includes("<a>") && html.includes("Half off &lt;all&gt;"));
  assert.match(html, /50% OFF/); assert.match(html, /<li class="t"><span class="d">Mon/); assert.match(html, /BEST DAY<\/span><b>Mon/);
  assert.ok(html.includes("https://x.test/stores/a?ref=embed")); assert.ok(!/<script/i.test(html));
  const c = storeWidgetHtml(V("a"), rules, "2026-11-02", "https://x.test", { compact: true }); assert.ok(!c.includes("<ul>") && c.includes("50% OFF"));
  const tue = storeWidgetHtml(V("a"), rules, "2026-11-03", "https://x.test"); assert.match(tue, /No deal today/); assert.match(tue, /Tomorrow/);
  const none = storeWidgetHtml(V("z"), rules, "2026-11-02", "https://x.test"); assert.match(none, /No weekly deals listed/); assert.match(none, /no weekly deal days on file/);
  assert.match(notFoundWidgetHtml("https://x.test"), /Store not found/);
  assert.equal(esc(`"'&`), "&quot;&#39;&amp;");
  assert.deepEqual(embedOpts(new URLSearchParams("compact=1")), { compact: true }); assert.deepEqual(embedOpts(new URLSearchParams("")), { compact: false });
  assert.match(embedSnippet("https://x.test", "a", true), /src="https:\/\/x\.test\/embed\/stores\/a\?compact=1".*height="96"/);
});
test("embed headers: framable from anywhere, rest of the site stays SAMEORIGIN", async () => {
  const e = securityHeaders(false, true); assert.ok(!e.some((h) => h.key === "X-Frame-Options"));
  assert.match(e.find((h) => h.key === "Content-Security-Policy")!.value, /frame-ancestors \*/); assert.match(buildCsp(false), /frame-ancestors 'self'/);
  const rulesCfg = await ((await import("../next.config")).default as any).headers();
  const embed = rulesCfg.find((r: any) => r.source === "/embed/:path*"); assert.ok(embed);
  const global = rulesCfg.find((r: any) => r.source === "/((?!embed/).*)"); assert.ok(global.headers.some((h: any) => h.key === "X-Frame-Options"));
  const re = new RegExp("^" + global.source.replace("(.*)", ".*") + "$"); assert.ok(re.test("/stores/a") && re.test("/") && !re.test("/embed/stores/a"));
});
test("embed route: 200 HTML for a real store, 404 page for unknown", async () => {
  const { GET } = await import("../src/app/embed/stores/[slug]/route");
  const ok = await GET(new Request("http://l/embed/stores/goodwill-port-orange"), { params: Promise.resolve({ slug: "goodwill-port-orange" }) });
  assert.equal(ok.status, 200); assert.match(ok.headers.get("content-type")!, /text\/html/); assert.match(await ok.text(), /Goodwill/);
  const nf = await GET(new Request("http://l/embed/stores/nope"), { params: Promise.resolve({ slug: "nope" }) }); assert.equal(nf.status, 404);
});
test("compare: parse/dedupe/cap, per-day winners, ties give no pick, closed days", () => {
  const known = new Set(["a", "b", "c", "d", "e"]);
  assert.deepEqual(parseCompare("a,b,a,x,<script>", known), { slugs: ["a", "b"], unknown: ["x"] });
  assert.equal(parseCompare(["a", "b,c", "d", "e"], known).slugs.length, MAX_COMPARE); assert.deepEqual(parseCompare(undefined, known).slugs, []);
  const venues = [V("a"), V("b", { lat: 29.2, hoursJson: { "mon-sat": "9:00-20:00" } })];
  const r = compareStores(["a", "b"], venues, rules, "2026-11-02");
  assert.equal(r.cols.length, 2); assert.deepEqual(r.cols[0].week.map((d) => d.day), [1, 2, 3, 4, 5, 6, 0]);
  assert.equal(r.winners[0], 0, "Mon: a (50%) beats b (25%)"); assert.equal(r.winners[3], 1, "Thu: only b"); assert.equal(r.winners[1], -1, "Tue: nobody");
  assert.equal(r.cols[1].week[6].hours, "Closed"); assert.ok(r.miles! > 5 && r.miles! < 10); assert.equal(r.cols[0].verified, 1);
  const tie = compareStores(["a", "b"], venues, [R("a", 2, "x", 30), R("b", 2, "y", 30)], "2026-11-02"); assert.equal(tie.winners[1], -1);
  assert.equal(compareStores(["a", "zz"], venues, rules, "2026-11-02").cols.length, 1);
});
test("API docs: every documented route exists, examples are relative, all GET", () => {
  assert.ok(API_DOCS.length >= 10);
  for (const d of API_DOCS) { assert.ok(existsSync(d.file), d.file); assert.equal(d.method, "GET"); assert.ok(d.example.startsWith("/"), d.example); }
  assert.ok(!API_DOCS.some((d) => d.path.startsWith("/api/admin") || d.path.startsWith("/api/cron")), "no admin/cron in public docs");
});
test("per-city Atom feed: filters, titles, self link; route 404s unknown city", async () => {
  const s = (slug: string, city: string) => ({ slug, title: slug, type: "estate", city, zip: "32127", lat: 0, lng: 0, sourceUrl: "", paymentMethods: [], days: [{ date: "2099-01-01", start: "08:00", end: "12:00", discountPct: 0 }], addedAt: "2026-11-01T12:00:00Z" });
  const xml = atomFeed([s("one", "Port Orange"), s("two", "DeLand")], "https://x.test", new Date("2026-11-02T12:00:00Z"), "Port Orange");
  assert.match(xml, /New estate sales in Port Orange, FL/); assert.match(xml, /href="https:\/\/x\.test\/feed\.xml\?city=port-orange"/); assert.match(xml, /\/city\/port-orange/);
  assert.ok(xml.includes("sale/one") && !xml.includes("sale/two"));
  const { GET } = await import("../src/app/feed.xml/route");
  assert.equal((await GET(new Request("http://l/feed.xml?city=atlantis"))).status, 404);
  const ok = await GET(new Request("http://l/feed.xml?city=port-orange")); assert.equal(ok.status, 200); assert.match(await ok.text(), /Port Orange, FL/);
  assert.equal((await GET(new Request("http://l/feed.xml"))).status, 200);
});
test("admin CSV export: auth, kinds, formula-injection guard, quoting", async () => {
  assert.equal(csvCell('=HYPERLINK("x")'), `"'=HYPERLINK(""x"")"`); assert.equal(csvCell(["a", "b"]), '"a; b"'); assert.equal(csvCell(null), '""');
  assert.equal(toCsv(["h"], [["a,b"]]), '"h"\r\n"a,b"\r\n');
  const sub = submissionsCsv([{ id: "1", at: "t", email: "e@x", sale: { title: "T", type: "estate", city: "C", zip: "1", days: [{ date: "2099-01-01", start: "08:00", end: "12:00", discountPct: 50 }], sourceUrl: "", lat: 0, lng: 0, slug: "t", paymentMethods: [] } } as any]);
  assert.match(sub, /2099-01-01 08:00-12:00 50%/);
  const { GET } = await import("../src/app/api/admin/export/route");
  assert.equal((await GET(new Request("http://l/api/admin/export?what=audit"))).status, 401);
  const auth = { headers: { authorization: "Bearer test-pw" } };
  assert.equal((await GET(new Request("http://l/api/admin/export?what=bogus", auth))).status, 400);
  for (const w of ["submissions", "contacts", "audit"]) { const r = await GET(new Request(`http://l/api/admin/export?what=${w}`, auth)); assert.equal(r.status, 200, w); assert.match(r.headers.get("content-disposition")!, new RegExp(`thriftradarfl-${w}-`)); }
});
