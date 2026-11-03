import { test } from "node:test";
import assert from "node:assert/strict";
import { getPrices, normalize, profit } from "../src/lib/prices";
import { STATIC_PAGES } from "../src/lib/seo";
test("tracker never invents prices", () => {
  const all = getPrices(); assert.ok(all.length > 0);
  for (const i of all) if (i.median !== null) assert.match(i.sourceUrl, /^https?:\/\//);
  assert.equal(normalize({ item: "X", sold_median_usd: "", source_url: "" }).median, null);
  assert.equal(normalize({ item: "X", sold_median_usd: "20", source_url: "" }).median, null, "unsourced price hidden");
  assert.ok(all.some((i) => i.median === null) || all.every((i) => i.median !== null));
});
test("history parsed only when valid", () => {
  const i = normalize({ item: "Y", sold_median_usd: "10", source_url: "https://x.com", history: [{ date: "2026-01-01", price: 9 }, { date: "", price: 3 }] } as never);
  assert.equal(i.history.length, 1);
});
test("profit math with eBay default fees", () => {
  const r = profit({ buy: 5, sale: 40, shipping: 5, packaging: 1, feePct: 13.25, feeFixed: 0.4 });
  assert.equal(r.fees.toFixed(2), "5.70"); assert.equal(r.net.toFixed(2), "23.30");
  assert.equal(r.margin!.toFixed(1), "58.2"); assert.equal(r.roi!.toFixed(1), "388.3");
  assert.equal(profit({ buy: 0, sale: 0, shipping: 0, packaging: 0, feePct: 13.25, feeFixed: 0.4 }).margin, null);
});
test("sitemap includes new pages", () => { assert.ok(STATIC_PAGES.includes("/prices") && STATIC_PAGES.includes("/calculator")); });
