import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
process.env.THRIFTRADAR_DATA_DIR = mkdtempSync(path.join(tmpdir(), "tr-city-")); delete process.env.DATABASE_URL;
import { cityList, cityData, nearbyCities, weekendDates, upcomingSales } from "../src/lib/cities";
import type { Sale, Venue } from "../src/lib/data";
import type { DealRule } from "../src/lib/deal-rules";
const sale = (slug: string, city: string, dates: string[], lat = 29.1, lng = -81.0): Sale => ({ slug, title: slug, type: "estate", city, zip: "", lat, lng, sourceUrl: "", paymentMethods: [], days: dates.map((date) => ({ date, start: "08:00", end: "14:00", discountPct: 25 })) });
const venue = (slug: string, city: string, lat: number, lng: number) => ({ slug, org: "", name: slug.toUpperCase(), type: "thrift", address: "1 Main", city, zip: "", lat, lng, phone: null, hoursJson: null, notes: "" }) as Venue;
test("weekendDates: Fri–Sun, current weekend when inside it, never past", () => {
  assert.deepEqual(weekendDates("2026-11-02"), ["2026-11-06", "2026-11-07", "2026-11-08"]); // Mon
  assert.deepEqual(weekendDates("2026-11-07"), ["2026-11-07", "2026-11-08"]); // Sat
  assert.deepEqual(weekendDates("2026-11-08"), ["2026-11-08"]); // Sun
});
test("cityList derives every city with data, counts only upcoming sales, keeps core cities", () => {
  const sales = [sale("a", "Sanford", ["2026-11-07"]), sale("old", "Sanford", ["2026-10-01"]), sale("b", "Port Orange", ["2026-11-06", "2026-11-07"])];
  const list = cityList(sales, [venue("gw", "Winter Park", 28.6, -81.35)], "2026-11-02");
  const by = Object.fromEntries(list.map((c) => [c.slug, c]));
  assert.equal(by.sanford.sales, 1); assert.equal(by["winter-park"].venues, 1); assert.ok(by.deland, "core city kept even when empty");
  assert.equal(upcomingSales(sales, "2026-11-02").length, 2);
});
test("cityData: weekend sales + deal days for that city's stores only; nearby sorted by distance", () => {
  const sales = [sale("a", "Port Orange", ["2026-11-07"]), sale("x", "Orlando", ["2026-11-07"], 28.5, -81.4)];
  const venues = [venue("po", "Port Orange", 29.13, -81.0), venue("orl", "Orlando", 28.5, -81.4), venue("db", "Daytona Beach", 29.2, -81.03)];
  const rules: DealRule[] = [{ venue: "po", day: 6, kind: "half_off", label: "Half-off Saturday", color: "bg-coral", verified: false }, { venue: "orl", day: 6, kind: "half_off", label: "Other city", color: "bg-coral", verified: false }];
  const d = cityData("Port Orange", sales, venues, rules, "2026-11-02");
  const sat = d.weekend.find((w) => w.date === "2026-11-07")!;
  assert.deepEqual(sat.sales.map((s) => s.sale.slug), ["a"]); assert.deepEqual(sat.deals.map((r) => r.label), ["Half-off Saturday"]);
  assert.equal(d.stores[0].rules.length, 1); assert.equal(d.bestPct, 25);
  const near = nearbyCities(cityList(sales, venues, "2026-11-02"), "port-orange");
  assert.equal(near[0].slug, "daytona-beach"); assert.ok(near.every((c, i) => i === 0 || (c.miles ?? 0) >= (near[i - 1].miles ?? 0)));
});
import { sitemapEntries, robotsRules, saleEnded } from "../src/lib/seo";
test("sitemap: only live published sales, no empty cities, absolute URLs, no fake lastmod on detail pages", () => {
  const mk = (slug: string, date: string, published = true) => ({ slug, title: slug, type: "estate", city: "DeLand", zip: "32720", lat: 29, lng: -81.3, sourceUrl: "", paymentMethods: [], published, days: [{ date, start: "08:00", end: "12:00", discountPct: 0 }] });
  const venue = { slug: "v1", org: "", name: "V", type: "thrift", address: "1", city: "Sanford", zip: "32771", lat: 28.8, lng: -81.27, phone: null, hoursJson: null, notes: "" };
  const urls = sitemapEntries("https://x.test", [mk("old", "2026-10-01"), mk("new", "2026-11-05"), mk("draft", "2026-11-05", false)], [venue], "2026-11-02");
  const u = urls.map((e) => e.url);
  assert.ok(u.includes("https://x.test/sales/new")); assert.ok(!u.includes("https://x.test/sales/old")); assert.ok(!u.includes("https://x.test/sales/draft"));
  assert.ok(u.includes("https://x.test/city/sanford")); assert.ok(u.includes("https://x.test/city/deland")); assert.ok(!u.includes("https://x.test/city/ormond-beach"), "empty city excluded");
  assert.ok(u.every((x) => x.startsWith("https://x.test"))); assert.equal(new Set(u).size, u.length, "no duplicates");
  assert.equal(urls.find((e) => e.url.endsWith("/sales/new"))?.lastModified, undefined);
  assert.equal(saleEnded(mk("a", "2026-11-01"), "2026-11-02"), true); assert.equal(saleEnded(mk("a", "2026-11-02"), "2026-11-02"), false);
});
test("robots: blocks admin/api/preview, points at absolute sitemap; preview deploys fully disallowed", () => {
  const r = robotsRules("https://x.test", { VERCEL_ENV: "production" }); assert.equal(r.sitemap, "https://x.test/sitemap.xml");
  const rule = Array.isArray(r.rules) ? r.rules[0] : r.rules; assert.ok((rule.disallow as string[]).includes("/admin")); assert.ok((rule.disallow as string[]).includes("/api/"));
  assert.equal(robotsRules("https://x.test", {}).sitemap, "https://x.test/sitemap.xml");
  const p = robotsRules("https://x.test", { VERCEL_ENV: "preview" }); const pr = Array.isArray(p.rules) ? p.rules[0] : p.rules; assert.equal(pr.disallow, "/"); assert.equal(p.sitemap, undefined);
});
