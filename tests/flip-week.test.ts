import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { flipEstimate, eligibleFlips, flipOfWeek, weekIndex } from "../src/lib/flip-week";
import { getPrices, normalize, type PriceItem } from "../src/lib/prices";
import { STATIC_PAGES } from "../src/lib/seo";
const P = (item: string, median: string, low?: string, high?: string, src = "https://www.ebay.com/sch/x"): PriceItem => normalize({ item, sold_median_usd: median, source_url: src, est_thrift_low_usd: low, est_thrift_high_usd: high, sample_size: "30" });

test("flip estimate: net after 13.25% + $0.40 fees, at low/mid/high thrift cost", () => {
  const f = flipEstimate(P("Tee", "50", "4", "14"))!;
  assert.equal(f.netAtLow, 38.98); assert.equal(f.netAtHigh, 28.98); assert.equal(f.netAtMid, 33.98);
});
test("flip estimate: needs a sourced median and both ends of the thrift range", () => {
  assert.equal(flipEstimate(P("No src", "50", "4", "14", "")), null);
  assert.equal(flipEstimate(P("No range", "50")), null); assert.equal(flipEstimate(P("Half", "50", undefined, "7.99")), null);
});
test("eligible flips exclude items that lose money at the top of the thrift range", () => {
  const l = eligibleFlips([P("Loser", "40", "4", "40"), P("Winner", "40", "4", "10")]); assert.deepEqual(l.map((f) => f.item.item), ["Winner"]);
});
test("flip of the week rotates by Eastern Sun–Sat week and is stable within a week", () => {
  const items = [P("A", "50", "1", "5"), P("B", "60", "1", "5"), P("C", "70", "1", "5")];
  assert.equal(weekIndex("2026-01-04"), 0); assert.equal(weekIndex("2026-01-10"), 0); assert.equal(weekIndex("2026-01-11"), 1);
  const a = flipOfWeek(items, "2026-11-01"), b = flipOfWeek(items, "2026-11-07"), c = flipOfWeek(items, "2026-11-08");
  assert.equal(a.pick!.item.item, b.pick!.item.item); assert.notEqual(a.pick!.item.item, c.pick!.item.item); assert.equal(a.weekOf, "2026-11-01"); assert.equal(a.expiresOn, "2026-11-07");
  assert.ok(!a.others.includes(a.pick!)); assert.equal(flipOfWeek([], "2026-11-03").pick, null);
});
test("real data: pick has a sourced sold median and est. thrift range; page labels estimates", () => {
  const { pick } = flipOfWeek(getPrices(), "2026-11-03"); assert.ok(pick && pick.item.sourceUrl.startsWith("https://") && pick.item.estThrift);
  assert.ok(existsSync("src/app/flip-of-the-week/page.tsx")); assert.ok(STATIC_PAGES.includes("/flip-of-the-week"));
  const src = readFileSync("src/app/flip-of-the-week/page.tsx", "utf8"); assert.match(src, /Estimates, not promises/); assert.match(src, /estimate/);
});
