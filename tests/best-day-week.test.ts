import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { bestDay, ruleValue, heat } from "../src/lib/best-day";
import { weekSheet, sheetText } from "../src/lib/week-sheet";
import { STATIC_PAGES } from "../src/lib/seo";
import type { DealRule } from "../src/lib/deal-rules";
import type { Sale, Venue } from "../src/lib/data";

const R = (venue: string, day: number, kind: DealRule["kind"], label: string, discountPct?: number, verified = true): DealRule => ({ id: `${venue}-${day}-${label}`, venue, day, kind, label, color: "bg-coral", verified, discountPct });
const V = (slug: string, city: string, hoursJson: Record<string, string> | null = null) => ({ slug, name: slug.toUpperCase(), city, type: "thrift", address: "1 Main", zip: "32127", lat: 29, lng: -81, phone: null, hoursJson, notes: "" }) as unknown as Venue;

test("ruleValue: senior days and unverified rules count less", () => {
  assert.equal(ruleValue(R("a", 0, "color_tag", "Color", 50)), 50);
  assert.equal(ruleValue(R("a", 0, "color_tag", "Color", 50, false)), 40);
  assert.equal(ruleValue(R("a", 0, "senior_day", "Seniors 30%", 30)), 12);
  assert.ok(ruleValue(R("a", 0, "restock", "Restock")) > 0);
});
test("bestDay picks the biggest real discount, skips closed days, has a runner-up", () => {
  const rules = [R("gw", 0, "color_tag", "Color of the Week 50%", 50), R("gw", 1, "senior_day", "Seniors", 30), R("gw", 2, "restock", "Restock"), R("x", 3, "half_off", "Other store", 90)];
  const b = bestDay("gw", rules, { "mon-sat": "9:00-21:00" }); // closed Sunday → Color day doesn't count
  assert.equal(b?.best.name, "Tue"); assert.equal(b?.runnerUp?.name, "Mon"); assert.equal(b?.week[0].closed, true); assert.equal(b?.week[0].score, 0);
  const open = bestDay("gw", rules, { daily: "9:00-21:00" });
  assert.equal(open?.best.name, "Sun"); assert.match(open!.reason, /Color of the Week/); assert.equal(open?.week.length, 7);
  assert.equal(bestDay("none", rules), null);
  assert.equal(bestDay("gw", [R("gw", 0, "color_tag", "x", 50)], { "mon-sat": "9-5" }), null); // only deal falls on a closed day
});
test("bestDay: ties go to the earlier weekday; extra rules add a little", () => {
  const b = bestDay("s", [R("s", 4, "half_off", "Half", 50), R("s", 2, "half_off", "Half", 50), R("s", 2, "restock", "Restock")]);
  assert.equal(b?.best.name, "Tue"); assert.ok(b!.best.score > b!.week[4].score);
  assert.equal(heat(0, 50), 0); assert.equal(heat(50, 50), 4); assert.equal(heat(1, 50), 1);
});
test("weekSheet: 7 ET days from today, deals by weekday, open sales, city + verified filters", () => {
  const venues = [V("gw", "Port Orange"), V("sa", "Orlando")];
  const rules = [R("gw", 1, "half_off", "Mon half", 50), R("sa", 1, "restock", "Mon restock", undefined, false), R("gw", 6, "dollar_day", "Sat $1")];
  const sale = { slug: "s1", title: "Estate", type: "estate", city: "Port Orange", zip: "32127", lat: 0, lng: 0, sourceUrl: "", paymentMethods: [], days: [{ date: "2026-11-07", start: "09:00", end: "14:00", discountPct: 25 }] } as Sale;
  const draft = { ...sale, slug: "draft", published: false } as Sale;
  const d = weekSheet("2026-11-02", rules, venues, [sale, draft]);
  assert.equal(d.length, 7); assert.equal(d[0].date, "2026-11-02"); assert.equal(d[6].date, "2026-11-08");
  assert.deepEqual(d[0].deals.map((x) => x.rule.label), ["Mon half", "Mon restock"]);
  assert.deepEqual(d[5].sales.map((x) => [x.sale.slug, x.hours, x.discountPct]), [["s1", "9 AM–2 PM", 25]]);
  assert.equal(d[5].deals[0].rule.label, "Sat $1");
  assert.deepEqual(weekSheet("2026-11-02", rules, venues, [sale], { city: "orlando" })[0].deals.map((x) => x.venue.slug), ["sa"]);
  assert.equal(weekSheet("2026-11-02", rules, venues, [sale], { city: "orlando" })[5].sales.length, 0);
  assert.equal(weekSheet("2026-11-02", rules, venues, [sale], { verifiedOnly: true })[0].deals.length, 1);
  assert.equal(weekSheet("2026-12-29", rules, venues, [], { days: 99 }).length, 14); // capped, crosses the year
  const txt = sheetText(d, "https://x.test", "Port Orange");
  assert.match(txt, /deal-day sheet · Port Orange/); assert.match(txt, /\[unverified\]/); assert.match(txt, /SALE Estate \(Port Orange\) 9 AM–2 PM · 25% off https:\/\/x.test\/sales\/s1/);
  assert.match(sheetText(weekSheet("2026-11-03", [], [], []), "https://x.test"), /Nothing listed/);
});
test("deal-day sheet is wired: page exists, in sitemap, has its own OG + print header", () => {
  assert.ok(STATIC_PAGES.includes("/deals/week"));
  const src = readFileSync("src/app/deals/week/page.tsx", "utf8"); assert.match(src, /canonical: "\/deals\/week"/); assert.match(src, /print:block/);
  assert.ok(existsSync("src/app/city/[city]/opengraph-image.tsx") && existsSync("src/app/deals/week/opengraph-image.tsx"), "pages with their own openGraph need an og:image file");
  assert.match(readFileSync("src/app/stores/[slug]/page.tsx", "utf8"), /<BestDay /);
});
test("every admin REST write (POST/PUT/DELETE) is audited", () => {
  for (const f of ["src/app/api/sales/route.ts", "src/app/api/sales/[slug]/route.ts", "src/app/api/venues/route.ts", "src/app/api/venues/[slug]/route.ts", "src/app/api/deal-rules/route.ts"]) {
    const s = readFileSync(f, "utf8"); const writes = (s.match(/await (upsert|delete)[A-Z]\w*\(/g) ?? []).length; const audits = (s.match(/await audit\(/g) ?? []).length;
    assert.ok(writes > 0 && audits >= writes, `${f}: ${writes} writes, ${audits} audits`);
  }
});
