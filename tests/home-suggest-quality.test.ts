import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { homeSummary } from "../src/lib/home";
import { suggest, score } from "../src/lib/suggest";
import { checkData, summarize, urlProblem, isListingUrl, phoneOk } from "../src/lib/data-quality";
import { cachedJson, PUBLIC_CACHE } from "../src/lib/api";
import type { Sale, Venue } from "../src/lib/data";
import type { DealRule } from "../src/lib/deal-rules";

const V = (slug: string, name: string, city: string, o: Partial<Venue> = {}): Venue => ({ slug, org: "x", name, type: "thrift", address: "1 Main St", city, zip: "32127", lat: 29.1, lng: -81.0, phone: "(386) 555-1212", hoursJson: { daily: "9:00-21:00" }, notes: "", sourceUrl: "https://example.org/stores", ...o } as Venue);
const S = (slug: string, title: string, city: string, dates: string[], o: Partial<Sale> = {}): Sale => ({ slug, title, type: "estate", city, zip: "32127", lat: 29.1, lng: -81.0, sourceUrl: `https://www.estatesales.net/FL/X/32127/${1000 + slug.length}${slug}`, paymentMethods: [], days: dates.map((date) => ({ date, start: "09:00", end: "14:00", discountPct: 0 })), ...o });
const R = (venue: string, day: number, label: string, discountPct?: number, verified = false): DealRule => ({ id: `${venue}-${day}-${label}`, venue, day, kind: "half_off", label, color: "bg-coral", verified, discountPct });
const venues = [V("gw-po", "Goodwill Port Orange", "Port Orange"), V("gw-dl", "Goodwill DeLand", "DeLand"), V("hab", "Habitat ReStore", "Port Orange")];
const today = "2026-11-02"; // Monday
const sales = [S("a", "Port Orange Garage Sale", "Port Orange", ["2026-11-06", "2026-11-07"]), S("b", "DeLand Moving Sale", "DeLand", ["2026-11-02"]), S("old", "Port Orange Old Sale", "Port Orange", ["2026-10-01"]), S("c", "Ormond Estate", "Ormond Beach", ["2026-11-20"])];

test("homeSummary: counts, weekend, today's deals sorted by discount then verified; ignores orphan rules", () => {
  const rules = [R("gw-po", 1, "Seniors"), R("gw-dl", 1, "Half off", 50), R("hab", 1, "Tools 25%", 25, true), R("gw-po", 1, "Tag 25%", 25), R("ghost", 1, "Orphan", 90), R("gw-po", 2, "Tue")];
  const h = homeSummary(sales, venues, rules, today);
  assert.equal(h.upcoming, 3); assert.equal(h.cities, 3); assert.equal(h.stores, 3); assert.equal(h.openToday, 1); assert.equal(h.weekendSales, 1);
  assert.equal(h.todayDealCount, 4); assert.equal(h.halfOffToday, 1);
  assert.deepEqual(h.todayDeals.map((d) => d.label), ["Half off", "Tools 25%", "Tag 25%", "Seniors"]);
  assert.equal(h.todayDeals[0].storeName, "Goodwill DeLand");
  assert.equal(homeSummary(sales, venues, rules, today, 2).todayDeals.length, 2);
});
test("suggest: ranking (prefix > word start > contains), cities, past sales hidden, min length, limit", () => {
  assert.equal(score("Goodwill Port Orange", "", "goodwill"), 4); assert.equal(score("Goodwill Port Orange", "", "port"), 3);
  assert.equal(score("Goodwill Port Orange", "", "will"), 2); assert.equal(score("Goodwill", "Port Orange 32127", "32127"), 1); assert.equal(score("Goodwill", "", "zzz"), 0);
  assert.deepEqual(suggest("p", sales, venues, today), []);
  const r = suggest("port or", sales, venues, today);
  assert.equal(r[0].kind, "city"); assert.equal(r[0].href, "/city/port-orange");
  assert.ok(r.some((x) => x.href === "/sales/a")); assert.ok(!r.some((x) => x.href === "/sales/old"), "ended sales are not suggested");
  assert.ok(r.findIndex((x) => x.href === "/sales/a") < r.findIndex((x) => x.href === "/stores/gw-po"), "title prefix beats word-start");
  assert.match(r.find((x) => x.href === "/sales/a")!.sub, /Port Orange · Fri, Nov 6/);
  assert.equal(suggest("Délànd", sales, venues, today)[0].label, "DeLand", "accent-insensitive");
  assert.ok(suggest("o", sales, venues, today, 2).length <= 2); assert.ok(suggest("goodwill", sales, venues, today, 1).length === 1);
});
test("data quality: urls, listing urls, phones", () => {
  assert.equal(urlProblem("https://goodwillcfl.org/x"), null); assert.equal(urlProblem(""), null);
  assert.match(urlProblem("not a url")!, /valid/); assert.match(urlProblem("javascript:alert(1)")!, /scheme/); assert.match(urlProblem("http://localhost:3000/x")!, /local/); assert.match(urlProblem("http://example.org")!, /http/);
  assert.ok(isListingUrl("https://www.estatesales.net/FL/Port-Orange/32127/5139969")); assert.ok(!isListingUrl("https://www.estatesales.net/FL/Daytona-Beach")); assert.ok(isListingUrl("https://hibid.com/x?lot=1"));
  assert.ok(phoneOk("(386) 898-0308")); assert.ok(phoneOk("1-888-6THRIFT")); assert.ok(phoneOk("(386) 428-5010 ext 117")); assert.ok(!phoneOk("555-1212"));
});
test("data quality: finds dupes, coords problems, orphans, bad hours; clean data is clean", () => {
  const clean = checkData([S("a", "One", "Port Orange", ["2026-11-06"])], [V("v", "Store", "Port Orange")], [R("v", 1, "Half", 50)]);
  assert.deepEqual(clean, []);
  const bad = checkData(
    [S("a", "Same Sale", "Port Orange", ["2026-11-06"]), S("b", "Same  sale!", "Port Orange", ["2026-11-06"], { lat: 0, lng: 0 }), S("c", "X", "Y", ["2026-11-07"], { lat: -81.0, lng: 29.1, days: [{ date: "2026-11-07", start: "14:00", end: "09:00", discountPct: 0 }], sourceUrl: "https://www.estatesales.net/FL/Daytona-Beach" })],
    [V("v1", "Goodwill X", "Port Orange"), V("v2", "goodwill x", "Port Orange", { address: "1 Main Street" }), V("v3", "Far", "Port Orange", { lat: 28.54, lng: -81.38 }), V("v4", "Nozip", "Port Orange", { zip: "321", hoursJson: null })],
    [R("v1", 1, "Half"), R("ghost", 1, "Orphan"), R("v1", 9, "Bad day", 150)]);
  const codes = new Set(bad.map((i) => i.code));
  for (const c of ["sale.dup-title", "sale.coords-zero", "sale.coords-swapped", "sale.bad-hours", "sale.generic-source", "store.dup-name", "store.dup-address", "store.coords-far-from-zip", "store.bad-zip", "store.no-hours", "rule.orphan", "rule.bad-day", "rule.bad-pct"]) assert.ok(codes.has(c), `expected ${c}`);
  assert.match(bad.find((i) => i.code === "sale.coords-swapped")!.msg, /swapped/);
  assert.equal(bad[0].level, "error", "errors sort first");
  const s = summarize(bad); assert.ok(s.errors >= 5 && s.warnings >= 5);
});
test("repo data passes the data check with zero errors", async () => {
  const sales = JSON.parse(readFileSync("data/sales.json", "utf8")); const venues = JSON.parse(readFileSync("data/venues.json", "utf8"));
  const rules = existsSync("data/deal-rules.json") ? JSON.parse(readFileSync("data/deal-rules.json", "utf8")) : (await import("../src/lib/deal-rules")).dealRules;
  const errs = checkData(sales, venues, rules).filter((i) => i.level === "error"); assert.deepEqual(errs, []);
});
test("cachedJson: public cache headers, weak ETag, 304 on If-None-Match", async () => {
  const r = cachedJson(new Request("http://x/api/venues"), { a: 1 }); assert.equal(r.status, 200);
  assert.equal(r.headers.get("cache-control"), PUBLIC_CACHE); const et = r.headers.get("etag")!; assert.match(et, /^W\/"/); assert.deepEqual(await r.json(), { a: 1 });
  const r2 = cachedJson(new Request("http://x/api/venues", { headers: { "if-none-match": `"other", ${et}` } }), { a: 1 }); assert.equal(r2.status, 304); assert.equal(await r2.text(), "");
  assert.equal(cachedJson(new Request("http://x", { headers: { "if-none-match": et } }), { a: 2 }).status, 200, "changed body → new ETag");
});
test("public GET API routes use cachedJson; homepage has hero ZIP form + one h1; nav uses the suggest combobox", () => {
  for (const f of ["src/app/api/sales/route.ts", "src/app/api/sales/[slug]/route.ts", "src/app/api/venues/route.ts", "src/app/api/venues/[slug]/route.ts", "src/app/api/venues/[slug]/today/route.ts", "src/app/api/deal-rules/route.ts", "src/app/api/suggest/route.ts"])
    assert.match(readFileSync(f, "utf8"), /cachedJson\(req,/, f);
  const home = readFileSync("src/app/page.tsx", "utf8"); assert.match(home, /action="\/weekend"/); assert.equal((home.match(/<h1[\s>]/g) ?? []).length, 1);
  const nav = readFileSync("src/components/NavSearch.tsx", "utf8"); assert.match(nav, /role="combobox"/); assert.match(nav, /\/api\/suggest/); assert.match(nav, /action="\/search"/);
});
