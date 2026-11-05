import test from "node:test"; import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dealRules } from "../src/lib/deal-rules";
import venues from "../data/venues.json";
import { STATIC_PAGES } from "../src/lib/seo";
import {
  GWCFL_OFFERS, GWCFL_SHOP_URL, GWCFL_STACKING_NOTE, GWCFL_COUNTIES,
  gwcflCoveredRetail, gwcflUnconfirmed, hasVerifiedColorOfWeek,
  collapseDayRules, gwcflChainOfferKey, isGwcflChainRule,
} from "../src/lib/goodwill-cfl";

test("GWCFL facts match goodwillcfl.org/shop (no invented boutique/outlet coverage)", () => {
  assert.equal(GWCFL_SHOP_URL, "https://www.goodwillcfl.org/shop/");
  assert.equal(GWCFL_OFFERS.length, 3);
  assert.equal(GWCFL_OFFERS[0].day, 0);
  assert.match(GWCFL_OFFERS[0].detail, /Half off|50%/i);
  assert.match(GWCFL_OFFERS[1].detail, /10%/);
  assert.equal(GWCFL_OFFERS[1].day, 1);
  assert.match(GWCFL_OFFERS[2].detail, /10%/);
  assert.equal(GWCFL_OFFERS[2].day, 3);
  assert.match(GWCFL_STACKING_NOTE, /cannot be combined|stacked/i);
  assert.match(GWCFL_COUNTIES, /Brevard/); assert.match(GWCFL_COUNTIES, /Volusia/);
});

test("covered retail = verified Sunday color_tag only; boutique + outlets excluded", () => {
  const covered = gwcflCoveredRetail(venues as never, dealRules);
  const out = gwcflUnconfirmed(venues as never, dealRules);
  assert.ok(covered.length >= 14, `expected ≥14 covered, got ${covered.length}`);
  assert.ok(covered.every((v) => v.org === "gwcfl" && v.type === "thrift"));
  assert.ok(covered.every((v) => hasVerifiedColorOfWeek(dealRules, v.slug)));
  assert.ok(!covered.some((v) => v.slug.includes("boutique") || v.type === "outlet_bins"));
  assert.ok(out.some((v) => v.slug === "goodwill-winter-park-boutique"));
  assert.ok(out.some((v) => v.slug === "goodwill-pine-hills-outlet"));
  assert.ok(out.some((v) => v.slug === "goodwill-taft-outlet"));
  assert.ok(!hasVerifiedColorOfWeek(dealRules, "goodwill-winter-park-boutique"));
});

test("page + sitemap + no Winter Park Boutique invention", () => {
  assert.ok(existsSync("src/app/goodwill-cfl/page.tsx"));
  assert.ok(STATIC_PAGES.includes("/goodwill-cfl"));
  const src = readFileSync("src/app/goodwill-cfl/page.tsx", "utf8");
  assert.match(src, /goodwillcfl\.org\/shop/);
  assert.match(src, /Winter Park Boutique/);
  assert.match(src, /not confirmed|Not confirmed/i);
  assert.doesNotMatch(src, /Winter Park Boutique[^.]{0,80}50%/i);
  assert.ok(existsSync("src/app/admin/actions.ts"));
  const admin = readFileSync("src/app/admin/actions.ts", "utf8");
  assert.match(admin, /toggleVerify/);
});

test("collapseDayRules: collapses ≥2 verified GWCFL chain pills; keeps outlets/unverified individual", () => {
  const covered = gwcflCoveredRetail(venues as never, dealRules);
  const slugs = new Set(covered.map((v) => v.slug));
  assert.ok(slugs.size >= 2);
  const sun = collapseDayRules(0, dealRules, slugs);
  assert.equal(sun.summaries.length, 1);
  assert.equal(sun.summaries[0].key, "color");
  assert.ok(sun.summaries[0].storeCount >= 14);
  assert.ok(!sun.others.some((r) => isGwcflChainRule(r, slugs) && gwcflChainOfferKey(r) === "color"));
  const mon = collapseDayRules(1, dealRules, slugs);
  assert.ok(mon.summaries.some((s) => s.key === "senior"));
  // Pine Hills outlet restock stays individual (not covered retail)
  assert.ok(mon.others.some((r) => r.venue === "goodwill-pine-hills-outlet"));
  const tue = collapseDayRules(2, dealRules, slugs);
  assert.equal(tue.summaries.length, 0, "Tue has no chain offer");
  assert.ok(tue.others.some((r) => r.venue === "goodwill-port-orange" && r.kind === "restock"));
  // Single matching rule is not collapsed
  const one = collapseDayRules(0, dealRules.filter((r) => r.venue === "goodwill-port-orange"), slugs);
  assert.equal(one.summaries.length, 0);
  assert.equal(one.others.filter((r) => r.day === 0).length, 1);
});

test("gwcflChainOfferKey: only verified color/senior/military patterns", () => {
  assert.equal(gwcflChainOfferKey({ venue: "x", day: 0, kind: "color_tag", label: "Color of the Week", color: "bg-teal", verified: true }), "color");
  assert.equal(gwcflChainOfferKey({ venue: "x", day: 1, kind: "senior_day", label: "Seniors 55+ 10% off", color: "bg-gray-700", verified: true }), "senior");
  assert.equal(gwcflChainOfferKey({ venue: "x", day: 3, kind: "senior_day", label: "Military 10% off", color: "bg-gray-700", verified: true }), "military");
  assert.equal(gwcflChainOfferKey({ venue: "x", day: 0, kind: "color_tag", label: "Color of the Week", color: "bg-teal", verified: false }), null);
  assert.equal(gwcflChainOfferKey({ venue: "x", day: 2, kind: "restock", label: "Restock", color: "bg-royal", verified: true }), null);
});

test("/deals page collapses GWCFL chain pills + has openGraph", () => {
  const src = readFileSync("src/app/deals/page.tsx", "utf8");
  assert.match(src, /collapseDayRules/);
  assert.match(src, /Goodwill CFL retail/);
  assert.match(src, /openGraph/);
  assert.ok(existsSync("src/app/deals/opengraph-image.tsx"));
  assert.doesNotMatch(src, /Winter Park Boutique[^.]{0,80}50%/i);
});
