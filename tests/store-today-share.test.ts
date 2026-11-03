import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { storeToday, keyCovers, hoursOn, dowOf, addDaysIso } from "../src/lib/store-today";
import { parseSharedList, sharedListPath, mergeFavs, MAX_SHARED } from "../src/lib/share-list";
import { nextDealDate, type DealRule } from "../src/lib/deal-rules";

const R = (venue: string, day: number, label: string, discountPct?: number): DealRule => ({ id: `${venue}-${day}-${label}`, venue, day, kind: "half_off", label, color: "bg-coral", verified: false, discountPct });
const rules = [R("gw", 1, "Seniors"), R("gw", 1, "Half off", 50), R("gw", 3, "Military", 10), R("other", 2, "Nope")];

test("dowOf/addDaysIso are timezone-independent", () => {
  assert.equal(dowOf("2026-11-02"), 1); assert.equal(dowOf("2026-11-08"), 0);
  assert.equal(addDaysIso("2026-12-31", 1), "2027-01-01"); assert.equal(addDaysIso("2026-03-07", 1), "2026-03-08"); // DST weekend
});
test("store today: today's deals sorted by discount, next deal skips today", () => {
  const t = storeToday("gw", rules, "2026-11-02", { daily: "9:00-21:00" });
  assert.deepEqual(t.today.map((r) => r.label), ["Half off", "Seniors"]); assert.equal(t.dayName, "Mon"); assert.equal(t.hours, "9 AM–9 PM");
  assert.deepEqual([t.next?.rule.label, t.next?.date, t.next?.inDays], ["Military", "2026-11-04", 2]);
  const tue = storeToday("gw", rules, "2026-11-03"); assert.equal(tue.today.length, 0); assert.equal(tue.next?.rule.label, "Military"); assert.equal(tue.hours, null);
  const thu = storeToday("gw", rules, "2026-11-05"); assert.deepEqual([thu.next?.date, thu.next?.inDays], ["2026-11-09", 4]); // wraps the week
  const none = storeToday("nobody", rules, "2026-11-02"); assert.equal(none.today.length, 0); assert.equal(none.next, null);
  // only-rule-is-today → next is the same weekday next week
  assert.deepEqual([storeToday("other", rules, "2026-11-03").next?.inDays], [7]);
});
test("hours keys: ranges, wraps, specific beats daily, closed days", () => {
  assert.ok(keyCovers("tue-sat", 2) && keyCovers("tue-sat", 6) && !keyCovers("tue-sat", 0));
  assert.ok(keyCovers("fri-mon", 0) && keyCovers("fri-mon", 1) && !keyCovers("fri-mon", 3));
  assert.ok(keyCovers("mon,wed", 3) && keyCovers("Daily", 4) && !keyCovers("bogus", 1));
  assert.equal(hoursOn({ daily: "9:00-21:00", sun: "10:00-18:00" }, 0), "10 AM–6 PM");
  assert.equal(hoursOn({ "tue-sat": "10:00-17:00", "sun-mon": "closed" }, 1), "Closed");
  assert.equal(hoursOn({ wed: "18:30-22:00" }, 1), "Closed"); assert.equal(hoursOn({ wed: "18:30-22:00" }, 3), "6:30 PM–10 PM");
  assert.equal(hoursOn(null, 1), null); assert.equal(hoursOn({}, 1), null);
});
test("nextDealDate uses the Eastern-time date even when the server clock is UTC", () => {
  // 2026-11-03 02:00 UTC = Mon Nov 2, 9 PM ET → a Monday rule is "today" (Nov 2), not Tue
  const late = new Date("2026-11-03T02:00:00Z");
  assert.equal(nextDealDate(R("gw", 1, "x"), late), "2026-11-02"); assert.equal(nextDealDate(R("gw", 2, "x"), late), "2026-11-03"); assert.equal(nextDealDate(R("gw", 0, "x"), late), "2026-11-08");
});
test("shared list links: sanitized, deduped, capped, round-trip", () => {
  assert.deepEqual(parseSharedList("a-1,B-2,a-1,,<script>,../etc, c"), ["a-1", "b-2", "c"]);
  assert.deepEqual(parseSharedList(["x", "y,z"]), ["x", "y", "z"]); assert.deepEqual(parseSharedList(undefined), []);
  assert.equal(parseSharedList(Array.from({ length: 80 }, (_, i) => `s${i}`).join(",")).length, MAX_SHARED);
  const p = sharedListPath(["a", "b"]); assert.equal(p, "/saved?list=a,b"); assert.deepEqual(parseSharedList(new URL(p, "http://x").searchParams.get("list")), ["a", "b"]);
  assert.deepEqual(mergeFavs(["a", "b"], ["b", "c"]), ["a", "b", "c"]);
});
test("a11y/robustness guards: global error boundary, 404 has an h1, date-dependent pages are dynamic", () => {
  assert.ok(existsSync("src/app/global-error.tsx")); assert.match(readFileSync("src/app/global-error.tsx", "utf8"), /<html lang="en">/);
  assert.match(readFileSync("src/app/not-found.tsx", "utf8"), /<h1/);
  for (const f of ["src/app/deals/page.tsx", "src/app/stores/page.tsx", "src/app/stores/[slug]/page.tsx"]) assert.match(readFileSync(f, "utf8"), /export const dynamic = "force-dynamic"/, f);
  assert.doesNotMatch(readFileSync("src/app/deals/page.tsx", "utf8"), /new Date\(\)\.getDay\(\)/);
  const nav = readFileSync("src/components/NavSearch.tsx", "utf8"); assert.match(nav, /role="search" aria-label=/); assert.match(readFileSync("src/components/Nav.tsx", "utf8"), /<NavSearch \/>/);
});
test("GET /api/venues/[slug]/today: shape + 404", async () => {
  const { GET } = await import("../src/app/api/venues/[slug]/today/route");
  const ok = await GET(new Request("http://x/api/venues/goodwill-port-orange/today"), { params: Promise.resolve({ slug: "goodwill-port-orange" }) });
  assert.equal(ok.status, 200); const b = (await ok.json()).data;
  assert.equal(b.store.slug, "goodwill-port-orange"); assert.match(b.date, /^\d{4}-\d{2}-\d{2}$/); assert.ok(Array.isArray(b.today)); assert.ok(b.next === null || typeof b.next.inDays === "number");
  const nf = await GET(new Request("http://x"), { params: Promise.resolve({ slug: "nope-nope" }) }); assert.equal(nf.status, 404);
});
