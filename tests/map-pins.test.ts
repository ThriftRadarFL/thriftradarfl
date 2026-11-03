// Every map pin must link to a page that exists (regression: stale prerendered pins → 404s).
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
const dir = mkdtempSync(path.join(tmpdir(), "tr-pins-"));
cpSync("data", dir, { recursive: true });
process.env.THRIFTRADAR_DATA_DIR = dir; delete process.env.DATABASE_URL;
test("every map pin href resolves to an existing sale/store by slug", async () => {
  const { getSales, getVenues, getSale, getVenue } = await import("../src/lib/data");
  const { buildPins } = await import("../src/lib/map-pins");
  const pins = buildPins(await getVenues(), await getSales()); assert.ok(pins.length > 20);
  assert.equal(new Set(pins.map((p) => p.key)).size, pins.length, "unique keys");
  for (const p of pins) {
    const m = /^\/(sales|stores)\/([a-z0-9-]+)$/.exec(p.href); assert.ok(m, `bad href ${p.href}`);
    const hit = m[1] === "sales" ? await getSale(decodeURIComponent(m[2])) : await getVenue(decodeURIComponent(m[2]));
    assert.ok(hit, `${p.href} would 404`);
  }
  rmSync(dir, { recursive: true, force: true });
});
test("pages that list sales/stores render per request (no stale prerender)", async () => {
  const { readFileSync } = await import("node:fs");
  for (const f of ["src/app/map/page.tsx", "src/app/page.tsx", "src/app/search/page.tsx", "src/app/saved/page.tsx"]) assert.match(readFileSync(f, "utf8"), /dynamic = "force-dynamic"/, f);
});
