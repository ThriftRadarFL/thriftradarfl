// Crowdsourced color-tag board: validation, week expiry, moderation, grouping, JSON storage.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
const dir = mkdtempSync(path.join(tmpdir(), "tr-tags-"));
process.env.THRIFTRADAR_DATA_DIR = dir; delete process.env.DATABASE_URL;
after(() => rmSync(dir, { recursive: true, force: true }));
import { weekBounds, isActive, parseTagReport, buildBoard, pruneReports, type TagReport } from "../src/lib/color-tags";
import { tagVenues } from "../src/lib/color-tag-board";
const mk = (o: Partial<TagReport>): TagReport => ({ id: Math.random().toString(36), at: "2026-11-03T12:00:00Z", venue: "goodwill-port-orange", color: "blue", discountPct: 50, note: "", status: "approved", weekOf: "2026-11-01", expiresOn: "2026-11-07", ...o });

test("weekBounds: Sunday–Saturday in Eastern dates", () => {
  assert.deepEqual(weekBounds("2026-11-03"), { weekOf: "2026-11-01", expiresOn: "2026-11-07" }); // Tue
  assert.deepEqual(weekBounds("2026-11-01"), { weekOf: "2026-11-01", expiresOn: "2026-11-07" }); // Sun
  assert.deepEqual(weekBounds("2026-11-07"), { weekOf: "2026-11-01", expiresOn: "2026-11-07" }); // Sat
  assert.deepEqual(weekBounds("2026-12-29"), { weekOf: "2026-12-27", expiresOn: "2027-01-02" }); // year wrap
});

test("isActive: only approved, only inside its week", () => {
  assert.ok(isActive(mk({}), "2026-11-07")); assert.ok(!isActive(mk({}), "2026-11-08"));
  assert.ok(!isActive(mk({ status: "pending" }), "2026-11-03")); assert.ok(!isActive(mk({ status: "rejected" }), "2026-11-03"));
  assert.ok(!isActive(mk({}), "2026-10-31"));
});

test("parseTagReport: validates store, color, % and note; stamps this week", () => {
  const ok = parseTagReport({ venue: "goodwill-port-orange", color: "Blue", discountPct: "50%", note: "  by  registers " }, ["goodwill-port-orange"], "2026-11-03");
  assert.ok(ok.ok); if (ok.ok) assert.deepEqual(ok.value, { venue: "goodwill-port-orange", color: "blue", discountPct: 50, note: "by registers", weekOf: "2026-11-01", expiresOn: "2026-11-07" });
  const blank = parseTagReport({ venue: "a", color: "red", discountPct: "" }, ["a"], "2026-11-03"); assert.ok(blank.ok && blank.value.discountPct === null);
  for (const bad of [{ venue: "nope", color: "red" }, { venue: "a", color: "plaid" }, { venue: "a", color: "red", discountPct: "150" }, { venue: "a", color: "red", discountPct: "12.5" },
    { venue: "a", color: "red", note: "x".repeat(141) }, { venue: "a", color: "red", note: "deals at https://spam.example" }]) assert.equal(parseTagReport(bad, ["a"], "2026-11-03").ok, false, JSON.stringify(bad));
});

test("buildBoard: groups by store+color, counts reports, hides pending/expired, never merges conflicting %", () => {
  const today = "2026-11-03";
  const b = buildBoard([mk({ at: "2026-11-02T10:00:00Z" }), mk({ at: "2026-11-03T09:00:00Z", note: "sign at door" }), mk({ color: "green", discountPct: 50 }), mk({ color: "green", discountPct: 75 }), mk({ color: "green", discountPct: null }),
    mk({ venue: "other", status: "pending" }), mk({ venue: "old", weekOf: "2026-10-25", expiresOn: "2026-10-31" })], today);
  assert.equal(b.length, 1); assert.equal(b[0].venue, "goodwill-port-orange");
  const blue = b[0].colors.find((c) => c.color === "blue")!, green = b[0].colors.find((c) => c.color === "green")!;
  assert.equal(blue.reports, 2); assert.equal(blue.discountPct, 50); assert.equal(blue.lastAt, "2026-11-03T09:00:00Z"); assert.deepEqual(blue.notes, ["sign at door"]);
  assert.equal(green.reports, 3); assert.equal(green.discountPct, null, "50 vs 75 conflict → no number shown");
  assert.equal(b[0].colors[0].color, "green", "most-reported first");
  assert.deepEqual(buildBoard([], today), []);
});

test("pruneReports drops rejected and long-expired", () => {
  const l = pruneReports([mk({ id: "keep" }), mk({ id: "rej", status: "rejected" }), mk({ id: "ancient", weekOf: "2026-09-06", expiresOn: "2026-09-12" })], "2026-11-03");
  assert.deepEqual(l.map((r) => r.id), ["keep"]);
});

test("tagVenues: thrift/outlets only, sorted", () => {
  const v = (slug: string, type: string, name: string) => ({ slug, type, name }) as unknown as import("../src/lib/data").Venue;
  assert.deepEqual(tagVenues([v("z", "thrift", "Zed"), v("b", "auction_house", "Berner"), v("a", "outlet_bins", "Alpha")]).map((x) => x.slug), ["a", "z"]);
});

test("JSON storage: report is pending until approved, then on the board; reject removes it", async () => {
  const data = await import("../src/lib/data"); const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const p = parseTagReport({ venue: "goodwill-port-orange", color: "pink", discountPct: "50" }, ["goodwill-port-orange"], today); assert.ok(p.ok); if (!p.ok) return;
  const id = await data.addTagReport(p.value); let all = await data.listTagReports();
  assert.equal(all.find((r) => r.id === id)?.status, "pending"); assert.equal(buildBoard(all, today).length, 0);
  assert.equal(await data.setTagStatus(id, "approved"), true); all = await data.listTagReports();
  assert.equal(buildBoard(all, today)[0]?.colors[0]?.color, "pink");
  const id2 = await data.addTagReport({ ...p.value, color: "red" }); await data.setTagStatus(id2, "rejected");
  assert.ok(!(await data.listTagReports()).some((r) => r.id === id2));
  assert.equal(await data.deleteTagReport(id), true); assert.equal((await data.listTagReports()).length, 0);
  assert.equal(await data.setTagStatus("missing", "approved"), false);
});

test("wired up: page labels unverified, nav + sitemap + API docs + migration", async () => {
  const page = readFileSync("src/app/color-tags/page.tsx", "utf8"); assert.match(page, /Crowdsourced &amp; unverified/); assert.match(page, /unverified<\/span>/);
  assert.match(readFileSync("src/components/Nav.tsx", "utf8"), /"\/color-tags"/);
  const { STATIC_PAGES } = await import("../src/lib/seo"); assert.ok(STATIC_PAGES.includes("/color-tags"));
  const { API_DOCS } = await import("../src/lib/api-docs"); assert.ok(API_DOCS.some((d) => d.path === "/api/color-tags"));
  assert.match(readFileSync("drizzle/0006_color_tag_reports.sql", "utf8"), /CREATE TABLE IF NOT EXISTS "color_tag_reports"/);
  assert.match(readFileSync("src/app/stores/[slug]/page.tsx", "utf8"), /unverified/);
});
