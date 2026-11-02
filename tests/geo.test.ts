import { test } from "node:test";
import assert from "node:assert/strict";
import { milesBetween, orderStops, googleMapsRoute, routeMiles } from "../src/lib/geo";
const daytona = { lat: 29.2108, lng: -81.0228 }, orlando = { lat: 28.5383, lng: -81.3792 }, deland = { lat: 29.0283, lng: -81.3031 }, ormond = { lat: 29.2858, lng: -81.0559 };
test("haversine ~ known distance", () => { const d = milesBetween(daytona, orlando); assert.ok(d > 48 && d < 54, String(d)); assert.equal(milesBetween(daytona, daytona), 0); });
test("orderStops never longer than input order and visits each once", () => {
  const stops = [orlando, ormond, deland, daytona]; const o = orderStops(stops, daytona);
  assert.equal(o.length, 4); assert.equal(new Set(o).size, 4); assert.ok(routeMiles(o, daytona) <= routeMiles(stops, daytona) + 1e-9);
  assert.deepEqual(orderStops([orlando, ormond, deland]).at(0), ormond); // no start → begins at northernmost
});
test("google maps link: origin, waypoints, destination, ≤9 waypoints", () => {
  const u = new URL(googleMapsRoute([ormond, deland, orlando], daytona));
  assert.equal(u.searchParams.get("origin"), "29.21080,-81.02280"); assert.equal(u.searchParams.get("destination"), "28.53830,-81.37920");
  assert.equal(u.searchParams.get("waypoints"), "29.28580,-81.05590|29.02830,-81.30310");
  const many = Array.from({ length: 15 }, (_, i) => ({ lat: 28 + i / 10, lng: -81 })); assert.equal(new URL(googleMapsRoute(many)).searchParams.get("waypoints")!.split("|").length, 9);
  assert.equal(googleMapsRoute([]), "");
});
