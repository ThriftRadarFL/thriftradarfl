import test from "node:test"; import assert from "node:assert/strict";
import { buildHeatmap, heatLevel } from "../src/lib/restock-heatmap";
import { recency, filterByWindow, getPrices } from "../src/lib/prices";
import { dealRules } from "../src/lib/deal-rules";
import venues from "../data/venues.json";
test("heatmap: outlets listed, scores only from rules, verified weighs 2", () => {
  const h = buildHeatmap(venues as never, dealRules);
  assert.ok(h.rows.some((r) => r.venue.type === "outlet_bins"));
  const pine = h.rows.find((r) => r.venue.slug === "goodwill-pine-hills-outlet")!; assert.equal(pine.cells[1].score, 1); assert.equal(pine.cells[0].score, 0);
  const po = h.rows.find((r) => r.venue.slug === "goodwill-port-orange")!; assert.equal(po.cells[0].score, 2);
  assert.ok(!h.rows.some((r) => r.venue.type === "auction_house"));
  assert.equal(h.dayTotals.length, 7); assert.equal(heatLevel(0, 4), 0); assert.equal(heatLevel(4, 4), 4);
});
test("heatmap: empty rules -> outlets shown with zero, nothing invented", () => {
  const h = buildHeatmap(venues as never, []); assert.ok(h.rows.length >= 1); assert.ok(h.rows.every((r) => r.total === 0));
});
test("recency + 90-day window", () => {
  const t = "2026-11-04";
  assert.equal(recency({ median: 5, dateRange: "2026-10-17 to 2026-11-02" }, t).level, "high");
  assert.equal(recency({ median: 5, dateRange: "2024-02-08 to 2026-11-02" }, t).level, "mixed");
  assert.equal(recency({ median: 5, dateRange: "2025-01-01 to 2025-03-01" }, t).level, "stale");
  assert.equal(recency({ median: null, dateRange: "" }, t).level, "unknown");
  const all = getPrices(); const strict = filterByWindow(all, t, "90"), any = filterByWindow(all, t, "90any");
  assert.ok(strict.length > 0 && strict.length <= any.length && any.length <= all.length);
  assert.equal(filterByWindow(all, t, "bogus").length, all.length);
  for (const i of strict) assert.equal(i.median, all.find((x) => x.slug === i.slug)!.median);
});
