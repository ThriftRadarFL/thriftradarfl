import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { openState, storeToday, nowMinutesET } from "../src/lib/store-today";
import { cleanNotes } from "../src/lib/notes";
import venues from "../data/venues.json";
/* eslint-disable @typescript-eslint/no-explicit-any */
test("open now / closed now from ET minutes", () => {
  assert.equal(openState("9:00-21:00", 9 * 60), "open"); assert.equal(openState("9:00-21:00", 21 * 60), "closed"); assert.equal(openState("9:00-21:00", 8 * 60 + 59), "closed");
  assert.equal(openState("Closed", 600), "closed"); assert.equal(openState(null, 600), null); assert.equal(openState("by appointment", 600), null);
  const t = storeToday("x", [], "2026-11-03", { daily: "9:00-21:00" }, 12 * 60); assert.equal(t.hours, "9 AM–9 PM"); assert.equal(t.openNow, "open");
  assert.equal(storeToday("x", [], "2026-11-08", { "mon-sat": "10:00-18:00", sun: "closed" }, 12 * 60).openNow, "closed");
  assert.equal(nowMinutesET(new Date("2026-11-03T17:30:00Z")), 12 * 60 + 30); // EST = UTC-5
});
test("badge says 'Today …' with open-now indicator (store page + embed)", () => {
  const c = readFileSync("src/components/StoreToday.tsx", "utf8"); assert.match(c, /`Today \$\{t\.hours\}`/); assert.match(c, /Open now/); assert.doesNotMatch(c, /`Open \$\{t\.hours\}`/);
  assert.match(readFileSync("src/lib/embed.ts", "utf8"), /`Today \$\{esc\(t\.hours\)\}/);
});
test("store notes carry one unverified warning", () => {
  assert.equal(cleanNotes("Hours from a directory listing, unverified. UNVERIFIED listing (x). Hours: a. Hours: a."), "UNVERIFIED listing (x). Hours: a.");
  for (const v of venues as any[]) { assert.ok((v.notes.match(/unverified listing/gi) ?? []).length <= 1, v.slug); assert.ok(!(/UNVERIFIED listing/.test(v.notes) && /directory listing, unverified/.test(v.notes)), v.slug); }
});
test("Nov 3 hours round 3 merged", () => {
  const by = Object.fromEntries((venues as any[]).map((v) => [v.slug, v]));
  assert.deepEqual(by["city-thrift-semoran"].hoursJson, { "mon-sat": "9:00-21:00", sun: "10:00-19:00" });
  for (const k of ["salvation-army-orlando-thrift-store-2", "salvation-army-orlando-thrift-store-4"]) { assert.deepEqual(by[k].hoursJson, { "mon-sat": "10:00-18:00", sun: "closed" }); assert.match(by[k].notes, /unverified/); }
  const sc = by["sharing-center-village-shoppes-longwood"]; assert.ok(sc.lat === 0 && /not on the map yet/i.test(sc.notes), "unpinned stays flagged");
});
test("map has a keyboard list mirroring pins + 40px controls", () => {
  const m = readFileSync("src/app/map/MapExplorer.tsx", "utf8"); assert.match(m, /aria-label=\{`Show \$\{p\.name\} on the map`\}/); assert.match(readFileSync("src/components/SaleMap.tsx", "utf8"), /focusKey/);
  assert.match(readFileSync("src/app/globals.css", "utf8"), /\.maplibregl-ctrl-group button \{ width: 40px/);
});
