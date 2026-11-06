// Homepage cold TTFB: list getters must pass a cold JSON seed into cached() so Promise.all on /
// cannot wait the full viaDb retry on an empty isolate (see src/lib/data.ts cached()).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("cached() soft-falls back to JSON on cold isolates after DB_TIMEOUT_MS", () => {
  const src = readFileSync("src/lib/data.ts", "utf8");
  assert.match(src, /function cached<T>\(key: string, fn: \(\) => Promise<T>, coldJson\?:/);
  assert.match(src, /setTimeout\(\(\) => \{ void seed\.then\(res/);
  assert.match(src, /DB_TIMEOUT_MS/);
  assert.match(src, /cached\("venues", \(\) => viaDb\([\s\S]*?\), venuesJson\)/);
  assert.match(src, /cached\("sales", \(\) => viaDb\([\s\S]*?\), jsonSales\)/);
  assert.match(src, /cached\("rules", \(\) => viaDb\([\s\S]*?\), rulesJson\)/);
});

test("homepage still Promise.all-loads sales+venues+rules (force-dynamic)", () => {
  const src = readFileSync("src/app/page.tsx", "utf8");
  assert.match(src, /export const dynamic = "force-dynamic"/);
  assert.match(src, /Promise\.all\(\[getSales\(\), getVenues\(\), getDealRules\(\)\]\)/);
});
