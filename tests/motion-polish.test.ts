import { readFileSync } from "fs";
import assert from "node:assert/strict";
import { test } from "node:test";

const css = readFileSync("src/app/globals.css", "utf8");
const nav = readFileSync("src/components/NavLinks.tsx", "utf8");
const map = readFileSync("src/app/map/MapExplorer.tsx", "utf8");
const saleMap = readFileSync("src/components/SaleMap.tsx", "utf8");
const home = readFileSync("src/app/page.tsx", "utf8");

test("motion polish: panel/hero enter keyframes + short duration", () => {
  assert.match(css, /@keyframes trfl-panel-in/);
  assert.match(css, /@keyframes trfl-hero-in/);
  assert.match(css, /\.panel\s*\{\s*animation:\s*trfl-panel-in\s+180ms/);
  assert.match(css, /\.hero-gloss\s*\{\s*animation:\s*trfl-hero-in\s+220ms/);
});

test("motion polish: glossy CTA hover lift/shine + active press", () => {
  assert.match(css, /\.btn-gloss:hover,\s*\.btn-red:hover/);
  assert.match(css, /translateY\(-1px\)/);
  assert.match(css, /@keyframes trfl-shine/);
  assert.match(css, /\.btn-gloss:active,\s*\.btn-red:active/);
});

test("motion polish: prefers-reduced-motion disables animations/transitions", () => {
  assert.match(css, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /animation:\s*none\s*!important/);
  assert.match(css, /transition:\s*none\s*!important/);
});

test("motion polish: nav tabs + map list/popup hooks", () => {
  assert.match(nav, /nav-tab/);
  assert.match(map, /map-list-row/);
  assert.match(map, /map-list-row--focus/);
  assert.match(saleMap, /className:\s*"trfl-popup"/);
  assert.match(css, /\.maplibregl-popup\.trfl-popup/);
});

test("motion polish: homepage today panel + skeleton shimmer", () => {
  assert.match(home, /motion-today/);
  assert.match(css, /@keyframes trfl-skel/);
  assert.match(css, /\.skel\s*\{/);
  assert.match(readFileSync("src/app/today/loading.tsx", "utf8"), /skel-wrap/);
  assert.match(readFileSync("src/app/search/loading.tsx", "utf8"), /skel-wrap/);
});
