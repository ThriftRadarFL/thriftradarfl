import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pinInfo } from "../src/lib/map-pins";
import { dayKey } from "../src/lib/time";
import { getPrices, thriftRange, thriftMid } from "../src/lib/prices";
import venues from "../data/venues.json";
/* eslint-disable @typescript-eslint/no-explicit-any */
const src = (f: string) => readFileSync(f, "utf8");
test("sitemap is built per request from live data", () => { assert.match(src("src/app/sitemap.ts"), /dynamic = "force-dynamic"/); assert.doesNotMatch(src("src/app/sitemap.ts"), /revalidate = /); });
test("map pins open a popup (no direct navigation) and cluster", () => {
  const s = src("src/components/SaleMap.tsx");
  assert.match(s, /cluster: true/); assert.match(s, /setDOMContent\(popupNode/); assert.match(s, /View details/); assert.doesNotMatch(s, /dot\.href/);
  assert.match(s, /textContent = p\.name/, "names inserted as text, not HTML");
});
test("pin popup info: sale dates + hours, store hours", () => {
  const sale = { slug: "s", title: "T", type: "estate", city: "Orlando", zip: "32801", lat: 28.5, lng: -81.3, sourceUrl: "", paymentMethods: [], days: [{ date: "2026-11-06", start: "09:00", end: "15:00", discountPct: 0 }, { date: "2026-11-07", start: "09:00", end: "15:00", discountPct: 0 }] };
  assert.match(pinInfo({ kind: "sale", s: sale as any }), /Fri, Nov 6 – Sat, Nov 7 · 9(:00)? ?AM–3(:00)? ?PM/i);
  assert.match(pinInfo({ kind: "store", v: { ...(venues[0] as any), hoursJson: { daily: "9:00-21:00" } } }), /^Daily /);
  assert.match(pinInfo({ kind: "store", v: { ...(venues[0] as any), hoursJson: null } }), /hours not verified/);
});
test("plan defaults to Any day", () => { assert.match(src("src/app/plan/Planner.tsx"), /initialDay : ""\); \/\/ default "Any day"/); });
test("dayKey renders comma day lists", () => { assert.equal(dayKey("mon,wed,fri,sat"), "Mon, Wed, Fri, Sat"); assert.equal(dayKey("tue-sat"), "Tue–Sat"); });
test("Nov 3 store merge: 4 pins fixed, hours filled", () => {
  const by = Object.fromEntries((venues as any[]).map((v) => [v.slug, v]));
  for (const [k, lat] of [["goodwill-casselberry", 28.69771], ["goodwill-oviedo", 28.64422], ["goodwill-apopka", 28.67319], ["salvation-army-orlando-thrift-store-4", 28.63025]] as const) assert.equal(by[k].lat, lat);
  for (const k of ["goodwill-casselberry", "goodwill-oviedo", "goodwill-apopka"]) assert.deepEqual(by[k].hoursJson, { daily: "9:00-21:00" });
  assert.ok((venues as any[]).filter((v) => v.hoursJson).length >= 40);
});
test("est. thrift cost is low-confidence metadata, never a sold price", () => {
  const p = getPrices(); const tee = p.find((i) => i.item === "Vintage band tee")!;
  assert.equal(thriftRange(tee.estThrift), "$3.99–$13.99"); assert.equal(thriftMid(tee.estThrift)!.toFixed(2), "8.99");
  assert.equal(thriftRange({ low: null, high: 7.99, sourceUrl: "", date: "", confidence: "low", notes: "" }), "up to $7.99");
  assert.match(src("src/app/prices/page.tsx"), /est\. thrift cost .*low confidence/);
});
test("touch targets: global 40px min for form controls", () => { assert.match(src("src/app/globals.css"), /select, input:not\(\[type="checkbox"\]\).*min-height: 2\.5rem/); });
