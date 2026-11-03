import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { reportCard, reportCards, lastChecked, gradeFor, gradeCounts, tagCountsThisWeek } from "../src/lib/report-card";
import type { Venue } from "../src/lib/data";
import type { DealRule } from "../src/lib/deal-rules";
import type { TagReport } from "../src/lib/color-tags";
import venues from "../data/venues.json";
import { dealRules } from "../src/lib/deal-rules";
import { API_DOCS } from "../src/lib/api-docs";
import { STATIC_PAGES } from "../src/lib/seo";

const V = (o: Partial<Venue> = {}): Venue => ({ slug: "s", org: "x", name: "Store", type: "thrift", address: "1 Main St", city: "Port Orange", zip: "32129", lat: 29.1, lng: -81.0, phone: "(386) 555-0100", hoursJson: { daily: "9:00-21:00" }, notes: "Hours from https://example.org (checked 2026-11-02).", sourceUrl: "https://example.org", ...o } as Venue);
const R = (venue: string, verified: boolean): DealRule => ({ venue, day: 1, kind: "half_off", label: "Half off", color: "bg-coral", verified });
const mark = (c: ReturnType<typeof reportCard>, k: string) => c.checks.find((x) => x.key === k)!.mark;

test("report card: complete store gets an A with all checks passing", () => {
  const c = reportCard(V(), [R("s", true)], "2026-11-03");
  assert.equal(c.grade, "A"); assert.equal(c.score, 100); assert.ok(c.checks.every((x) => x.mark === "pass")); assert.equal(c.checkedOn, "2026-11-02");
});
test("report card: unverified listing, aggregator hours, unverified deals, approximate pin, no phone", () => {
  const c = reportCard(V({ phone: null, notes: "UNVERIFIED listing (third-party directory only). Map pin approximate. Hours: Mon-Sat 9am-6pm (aggregator). Source: x (checked 2026-11-02)." }), [R("s", false)], "2026-11-03");
  assert.equal(mark(c, "listing"), "missing"); assert.equal(mark(c, "hours"), "partial"); assert.equal(mark(c, "deals"), "partial"); assert.equal(mark(c, "pin"), "partial"); assert.equal(mark(c, "phone"), "missing");
  assert.equal(mark(c, "source"), "pass"); assert.equal(c.score, 42); assert.equal(c.grade, "D");
});
test("report card: missing hours/coords/source; deals n/a for auction houses and excluded from score", () => {
  const c = reportCard(V({ type: "auction_house", hoursJson: null, lat: 0, lng: 0, notes: "", sourceUrl: undefined }), [], "2026-11-03");
  assert.equal(mark(c, "deals"), "na"); assert.equal(mark(c, "hours"), "missing"); assert.equal(mark(c, "pin"), "missing"); assert.equal(mark(c, "source"), "missing");
  assert.equal(c.score, 40); assert.equal(c.checks.length, 6);
});
test("source freshness: ≤30 days pass, ≤90 partial, older missing; latest checked date wins", () => {
  assert.equal(lastChecked("a (checked 2026-01-05). b (checked 2026-10-01)."), "2026-10-01"); assert.equal(lastChecked(null), null);
  assert.equal(mark(reportCard(V({ notes: "(checked 2026-10-04)" }), [], "2026-11-03"), "source"), "pass");
  assert.equal(mark(reportCard(V({ notes: "(checked 2026-09-01)" }), [], "2026-11-03"), "source"), "partial");
  assert.equal(mark(reportCard(V({ notes: "(checked 2026-07-01)" }), [], "2026-11-03"), "source"), "missing");
});
test("grade thresholds and counts", () => {
  assert.deepEqual([95, 90, 89, 75, 60, 59, 40, 39].map(gradeFor), ["A", "A", "B", "B", "C", "D", "D", "F"]);
  const cs = reportCards([V({ slug: "a" }), V({ slug: "b", phone: null })], [], "2026-11-03");
  assert.equal(cs[0].slug, "a"); const g = gradeCounts(cs); assert.equal(Object.values(g).reduce((a, b) => a + b, 0), 2);
});
test("color-tag counts: only approved reports active this week; ungraded", () => {
  const T = (venue: string, status: TagReport["status"], weekOf: string, expiresOn: string): TagReport => ({ id: venue + status + weekOf, at: weekOf + "T12:00:00Z", venue, color: "blue", discountPct: null, note: "", status, weekOf, expiresOn });
  const m = tagCountsThisWeek([T("a", "approved", "2026-11-01", "2026-11-07"), T("a", "approved", "2026-11-01", "2026-11-07"), T("a", "pending", "2026-11-01", "2026-11-07"), T("b", "approved", "2026-10-25", "2026-10-31")], "2026-11-03");
  assert.equal(m.get("a"), 2); assert.equal(m.has("b"), false);
  const with5 = reportCard(V(), [R("s", true)], "2026-11-03", 5), with0 = reportCard(V(), [R("s", true)], "2026-11-03", 0);
  assert.equal(with5.score, with0.score); assert.equal(with5.tagReportsThisWeek, 5);
});
test("real data: every store gets a card; no invented ratings fields", () => {
  const cs = reportCards(venues as unknown as Venue[], dealRules, "2026-11-03"); assert.equal(cs.length, venues.length);
  for (const c of cs) { assert.match(c.grade, /^[A-F]$/); assert.ok(c.score >= 0 && c.score <= 100); assert.ok(!("rating" in c) && !("stars" in c)); }
  assert.ok(cs.some((c) => c.grade === "A"));
});
test("report cards are wired up: route, API docs, sitemap, store page panel", () => {
  assert.ok(existsSync("src/app/stores/report-cards/page.tsx")); assert.ok(STATIC_PAGES.includes("/stores/report-cards"));
  const d = API_DOCS.find((x) => x.path === "/api/report-cards"); assert.ok(d && existsSync(d.file));
  assert.match(readFileSync("src/app/stores/[slug]/page.tsx", "utf8"), /ReportCardPanel/);
  assert.match(readFileSync("src/app/stores/report-cards/page.tsx", "utf8"), /not the stores/);
});
