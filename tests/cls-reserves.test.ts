// Keel P3 CLS: reserved frames + layout-matched loading skeletons for map/calendar/plan/search.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("CLS reserves: map-frame / calendar-frame / plan-frame / search-frame in CSS", () => {
  const css = readFileSync("src/app/globals.css", "utf8");
  for (const c of [".map-frame", ".calendar-frame", ".plan-frame", ".search-frame"]) assert.match(css, new RegExp(c.replace(".", "\\.")));
  assert.match(css, /font-synthesis:\s*none/);
});

test("map: reserved frame wraps SaleMap/SvgPlot; loading matches map+list", () => {
  const ex = readFileSync("src/app/map/MapExplorer.tsx", "utf8");
  assert.match(ex, /className="map-frame relative/);
  assert.match(readFileSync("src/components/SaleMap.tsx", "utf8"), /absolute inset-0/);
  const load = readFileSync("src/app/map/loading.tsx", "utf8");
  assert.match(load, /map-frame/); assert.match(load, /md:grid-cols-3/);
});

test("calendar/plan/search loading skeletons reserve final layout", () => {
  assert.match(readFileSync("src/app/calendar/loading.tsx", "utf8"), /calendar-frame/);
  assert.match(readFileSync("src/app/calendar/page.tsx", "utf8"), /calendar-frame/);
  // Footer CLS at 1280px: sm+ reserve must cover two deal-dense rows (~3200px), not the old 22rem.
  const calCss = readFileSync("src/app/globals.css", "utf8");
  assert.match(calCss, /\.calendar-frame[^{]*\{[\s\S]*?min-height:\s*200rem/);
  assert.match(calCss, /grid-auto-rows:\s*minmax\(100rem,\s*auto\)/);
  assert.match(readFileSync("src/app/plan/loading.tsx", "utf8"), /plan-frame/);
  assert.match(readFileSync("src/app/plan/Planner.tsx", "utf8"), /plan-frame/);
  const searchLoad = readFileSync("src/app/search/loading.tsx", "utf8");
  assert.match(searchLoad, /search-frame/);
  assert.doesNotMatch(searchLoad, /Sales.*Stores/s);
  assert.match(readFileSync("src/app/search/page.tsx", "utf8"), /search-frame/);
});

test("admin #import jumps to CSV panel, not the listing URL input", () => {
  const a = readFileSync("src/app/admin/page.tsx", "utf8");
  assert.match(a, /id="import-url"/);
  assert.match(a, /Panel id="import"/);
  assert.doesNotMatch(a, /htmlFor="import"/);
});
