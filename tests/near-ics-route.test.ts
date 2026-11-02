// 5 PM pass: ZIP/radius weekend filter, deal-day iCal (RRULE) feeds, printable route list.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { zipPoint, ZIPS, DEFAULT_ZIP } from "../src/lib/zips";
import { parseNearQuery, weekendNear, pointOf } from "../src/lib/near";
import { dealEvents, buildDealIcs, nextOnOrAfter, webcalUrl, googleCalUrl } from "../src/lib/ics";
import { routeLegs, routeText, dayLabel } from "../src/lib/route-list";
import { seedVenues, mockSales } from "../src/lib/seed-data";
import { dealRules } from "../src/lib/deal-rules";
import type { Sale, Venue } from "../src/lib/data";
import type { DealRule } from "../src/lib/deal-rules";
const dir = mkdtempSync(path.join(tmpdir(), "tr-near-")); process.env.THRIFTRADAR_DATA_DIR = dir; delete process.env.DATABASE_URL;
after(() => rmSync(dir, { recursive: true, force: true }));
const MON = "2026-11-02"; // weekend = Fri 11/6 – Sun 11/8
const venue = (slug: string, lat: number, lng: number, zip = "32127"): Venue => ({ slug, name: slug.toUpperCase(), type: "thrift", address: "1 Main St", city: "Port Orange", zip, lat, lng, phone: null, hoursJson: null, notes: "", org: null } as unknown as Venue);
const sale = (slug: string, date: string, lat: number, lng: number, zip = "32127"): Sale => ({ slug, title: slug, type: "estate", city: "Port Orange", zip, lat, lng, sourceUrl: "", paymentMethods: ["cash"], days: [{ date, start: "08:00", end: "14:00", discountPct: 0 }] });

test("zips: Central FL table covers every seed store + sale ZIP; ZIP+4 ok; outside FL null", () => {
  assert.ok(Object.keys(ZIPS).length > 200);
  assert.deepEqual(zipPoint("32127"), { lat: 29.1085, lng: -80.9757 }); assert.ok(zipPoint(" 32127-1234 "));
  for (const z of ["10001", "abcde", "", null, "3212"]) assert.equal(zipPoint(z), null, String(z));
  const missing = [...seedVenues, ...mockSales].map((x) => x.zip).filter((z) => z && !zipPoint(z)); assert.deepEqual(missing, []);
  // centroid sanity: Port Orange 32127 is within a few miles of the Port Orange Goodwill
  const gw = seedVenues.find((v) => v.slug === "goodwill-port-orange")!; assert.ok(Math.abs(gw.lat - zipPoint(DEFAULT_ZIP)!.lat) < 0.1);
});
test("parseNearQuery: defaults to 32127 / 25 mi; radius whitelist; lat/lng wins; bad ZIP → error + default", () => {
  assert.deepEqual([parseNearQuery({}).zip, parseNearQuery({}).radius, parseNearQuery({}).error], ["32127", 25, undefined]);
  assert.equal(parseNearQuery({ r: "50" }).radius, 50); assert.equal(parseNearQuery({ r: "any" }).radius, 0); assert.equal(parseNearQuery({ r: "7" }).radius, 25);
  assert.equal(parseNearQuery({ zip: "32720" }).origin.label, "ZIP 32720");
  const g = parseNearQuery({ lat: "28.54", lng: "-81.38", zip: "32127" }); assert.equal(g.origin.label, "your location"); assert.equal(g.zip, "");
  assert.equal(parseNearQuery({ lat: "40.7", lng: "-74" }).zip, "32127", "non-Florida coords ignored");
  const bad = parseNearQuery({ zip: "90210" }); assert.equal(bad.zip, "32127"); assert.match(bad.error ?? "", /Central Florida ZIPs only/);
  assert.equal(parseNearQuery({ zip: ["32720", "x"] }).zip, "32720");
});
test("weekendNear: radius filter, closest first, deal days by store, hidden counts + widen suggestion", () => {
  const o = zipPoint("32127")!;
  const sales = [sale("far-orlando", "2026-11-07", 28.54, -81.38), sale("near", "2026-11-07", 29.12, -80.99), sale("nearer", "2026-11-07", 29.109, -80.976),
    sale("no-coords", "2026-11-06", 0, 0, "32127"), sale("past", "2026-10-31", 29.11, -80.98), sale("monday", "2026-11-09", 29.11, -80.98)];
  const venues = [venue("po", 29.1385, -81.0175), venue("orl", 28.57, -81.45, "32818")];
  const rules: DealRule[] = [{ venue: "po", day: 6, kind: "color_tag", label: "Half off", color: "bg-teal", verified: true }, { venue: "orl", day: 6, kind: "restock", label: "Bins", color: "bg-royal", verified: false },
    { venue: "ghost", day: 6, kind: "restock", label: "Gone", color: "bg-royal", verified: false }];
  const n = weekendNear(sales, venues, rules, MON, o, 25);
  assert.deepEqual(n.days.map((d) => d.date), ["2026-11-06", "2026-11-07", "2026-11-08"]);
  const sat = n.days[1]; assert.deepEqual(sat.sales.map((s) => s.sale.slug), ["nearer", "near"]); assert.ok(sat.sales[0].miles! < sat.sales[1].miles!);
  assert.deepEqual(sat.deals.map((d) => d.store), ["PO"]); assert.equal(n.days[0].sales[0].sale.slug, "no-coords", "falls back to ZIP centroid");
  assert.equal(n.hiddenSales, 1); assert.equal(n.hiddenDeals, 1); assert.ok(n.nearestOutside! > 40 && n.nearestOutside! < 50); assert.equal(n.widenTo, 50, "Orlando is ~46 mi → widen to 50");
  const any = weekendNear(sales, venues, rules, MON, o, 0); assert.equal(any.hiddenSales + any.hiddenDeals, 0); assert.equal(any.days[1].sales.at(-1)!.sale.slug, "far-orlando"); assert.equal(any.widenTo, null);
  const tiny = weekendNear([sale("eleven", "2026-11-07", 29.27, -80.98)], [], [], MON, o, 10); assert.equal(tiny.total, 0); assert.equal(tiny.widenTo, 25);
  // Sunday: only Sunday remains of the current weekend
  assert.deepEqual(weekendNear([], [], [], "2026-11-08", o, 25).days.map((d) => d.date), ["2026-11-08"]);
  assert.equal(pointOf({ lat: 0, lng: 0, zip: "nope" }), null);
});
test("deal-day iCal: weekly RRULE, all-day vs timed, stable UID, unverified flagged, RFC folding", () => {
  assert.equal(nextOnOrAfter(MON, 1), MON); assert.equal(nextOnOrAfter(MON, 0), "2026-11-08"); assert.equal(nextOnOrAfter(MON, 3), "2026-11-04");
  const ev = dealEvents(dealRules, seedVenues as unknown as Venue[], MON).join("\r\n");
  assert.equal((ev.match(/BEGIN:VEVENT/g) ?? []).length, dealRules.filter((r) => seedVenues.some((v) => v.slug === r.venue)).length);
  assert.match(ev, /DTSTART;VALUE=DATE:20261108\r\nDTEND;VALUE=DATE:20261109\r\nTRANSP:TRANSPARENT\r\nRRULE:FREQ=WEEKLY;BYDAY=SU/);
  assert.match(ev, /DTSTART;TZID=America\/New_York:20261104T183000\r\nDTEND;TZID=America\/New_York:20261104T203000\r\nRRULE:FREQ=WEEKLY;BYDAY=WE/, "Berner's 6:30 PM auction");
  assert.match(ev, /UID:deal-goodwill-port-orange-0-color-of-the-week/); assert.match(ev, /\(unverified\)/); assert.match(ev, /LOCATION:1752 Dunlawton Ave\\, Port Orange\\, FL 32129/);
  const ics = buildDealIcs(dealRules, seedVenues as unknown as Venue[], MON);
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n") && ics.endsWith("END:VCALENDAR\r\n")); assert.ok(ics.split("\r\n").every((l) => Buffer.byteLength(l) <= 75));
  assert.equal((ics.match(/BEGIN:VEVENT/g) ?? []).length, (ics.match(/END:VEVENT/g) ?? []).length);
  assert.equal(dealEvents([{ venue: "ghost", day: 1, kind: "restock", label: "x", color: "", verified: true }], [], MON).length, 0);
  assert.equal(webcalUrl("/api/calendar/deals", "https://thriftradarfl.com"), "webcal://thriftradarfl.com/api/calendar/deals");
  assert.match(googleCalUrl("/x", "http://localhost:3000"), /cid=webcal%3A%2F%2Flocalhost%3A3000%2Fx$/);
});
/* eslint-disable @typescript-eslint/no-explicit-any */
let deals: any, cal: any;
before(async () => { [deals, cal] = await Promise.all([import("../src/app/api/calendar/deals/route"), import("../src/app/api/calendar/route")]); });
const req = (p: string) => new Request("http://localhost:3000" + p);
test("GET /api/calendar/deals: all, per store (+download), city, verified-only, 404; /api/calendar?deals=1 merges", async () => {
  const all = await deals.GET(req("/api/calendar/deals")); assert.equal(all.status, 200); assert.match(all.headers.get("content-type"), /text\/calendar/); assert.equal(all.headers.get("content-disposition"), null);
  const allN = ((await all.text()).match(/BEGIN:VEVENT/g) ?? []).length; assert.ok(allN >= 10);
  const po = await deals.GET(req("/api/calendar/deals?venue=goodwill-port-orange&download=1")); const poT = await po.text();
  assert.match(po.headers.get("content-disposition") ?? "", /goodwill-port-orange-deal-days\.ics/); assert.match(poT, /X-WR-CALNAME:Goodwill Port Orange · deal days/);
  assert.equal((poT.match(/BEGIN:VEVENT/g) ?? []).length, dealRules.filter((r) => r.venue === "goodwill-port-orange").length);
  const ver = await (await deals.GET(req("/api/calendar/deals?verified=1"))).text(); assert.ok(!/\(unverified\)/.test(ver)); assert.ok((ver.match(/BEGIN:VEVENT/g) ?? []).length < allN);
  const city = await (await deals.GET(req("/api/calendar/deals?city=orlando"))).text(); assert.ok(!city.includes("Port Orange")); assert.match(city, /BEGIN:VEVENT/);
  assert.equal((await deals.GET(req("/api/calendar/deals?venue=nope"))).status, 404);
  const both = await (await cal.GET(req("/api/calendar?deals=1"))).text(); const plain = await (await cal.GET(req("/api/calendar"))).text();
  assert.equal((both.match(/BEGIN:VEVENT/g) ?? []).length, (plain.match(/BEGIN:VEVENT/g) ?? []).length + allN); assert.ok(!plain.includes("RRULE:FREQ=WEEKLY"));
});
test("route list: legs, running total, hours for chosen day, text export", () => {
  const stops = [{ slug: "a", title: "A Sale", city: "Port Orange", lat: 29.11, lng: -80.98, days: [{ date: "2026-11-07", start: "08:00", end: "14:00" }, { date: "2026-11-08", start: "09:00", end: "12:30" }] },
    { slug: "b", title: "B Sale", city: "DeLand", lat: 29.03, lng: -81.30, days: [{ date: "2026-11-08", start: "10:00", end: "15:00" }] }];
  const legs = routeLegs(stops, "2026-11-08"); assert.equal(legs[0].legMiles, null); assert.equal(legs[0].hours, "9 AM–12:30 PM"); assert.ok(legs[1].legMiles! > 15 && legs[1].legMiles! < 25);
  assert.equal(legs[1].totalMiles, legs[1].legMiles); const fromHome = routeLegs(stops, "2026-11-08", { lat: 29.2, lng: -81.0 }); assert.ok(fromHome[0].legMiles! > 0); assert.ok(fromHome[1].totalMiles > legs[1].totalMiles);
  const txt = routeText(legs, "2026-11-08", "https://x.test", "https://maps.example/dir"); const lines = txt.split("\n");
  assert.match(lines[0], /^ThriftRadarFL route · Sunday, Nov 8 · 2 stops · ~\d+ mi$/); assert.match(txt, /1\. A Sale \(Port Orange\) 9 AM–12:30 PM\n   https:\/\/x\.test\/sales\/a/);
  assert.match(txt, /Directions: https:\/\/maps\.example\/dir$/); assert.equal(dayLabel(""), "Any day"); assert.match(routeText([], "", "s"), /0 stops$/);
});
