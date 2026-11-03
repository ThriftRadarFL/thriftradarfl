import { test } from "node:test";
import assert from "node:assert/strict";
import companies from "../data/estate-sale-companies.json";
import sales from "../data/sales.json";
import venues from "../data/venues.json";
import { STATIC_PAGES } from "../src/lib/seo";
import { checkData } from "../src/lib/data-quality";
/* eslint-disable @typescript-eslint/no-explicit-any */
test("companies directory: no defunct entry, Hidden Treasure uses its site phone, unverified flagged", () => {
  assert.ok(!companies.some((c) => c.name === "This Old Stuff"));
  assert.equal(companies.find((c) => c.name.startsWith("Hidden Treasure"))!.phone, "(321) 663-6509");
  assert.ok(companies.some((c) => !c.verified) && companies.some((c) => c.verified));
  assert.ok(STATIC_PAGES.includes("/estate-sale-companies"));
});
test("real sales only: 18 estatesales.net listings, no demo/NSB rows, Berner's are auctions", () => {
  assert.equal(sales.length, 18);
  for (const s of sales as any[]) assert.match(s.sourceUrl, /estatesales\.net\/FL\/.+\/\d{6,}$/);
  assert.ok(!(sales as any[]).some((s) => /new smyrna/i.test(s.city)));
  for (const s of (sales as any[]).filter((s) => /berner/i.test(s.title))) assert.equal(s.type, "auction");
  assert.ok((sales as any[]).filter((s) => !/berner/i.test(s.title)).every((s) => /address posted closer to sale/i.test(s.description)));
});
test("removed/unverified venues gone; no un-flagged 0,0 coords", () => {
  const slugs = (venues as any[]).map((v) => v.slug);
  for (const s of ["st-vincent-de-paul-thrift-store-longwood", "habitat-seminole-apopka-restore-casselberry"]) assert.ok(!slugs.includes(s));
  assert.ok(!(venues as any[]).some((v) => /hospice of volusia/i.test(v.name)), "Port Orange hospice duplicate skipped");
  const errs = checkData(sales as any, venues as any, []).filter((i) => i.level === "error");
  assert.deepEqual(errs, []);
});
test("coords check rejects 0,0, swapped and outside-box", () => {
  const base = { slug: "x", name: "X", type: "thrift", address: "1 A St", city: "Orlando", zip: "32801", phone: null, hoursJson: null, notes: "", sourceUrl: "https://a.com", org: "o" };
  const codes = (lat: number, lng: number, notes = "") => checkData([], [{ ...base, lat, lng, notes } as any], []).map((i) => i.code);
  assert.ok(codes(0, 0).includes("store.coords-zero"));
  assert.ok(!codes(0, 0, "Not on the map yet").includes("store.coords-zero"));
  assert.ok(codes(-81.38, 28.54).includes("store.coords-swapped"));
  assert.ok(codes(40.7, -74).includes("store.coords-outside"));
  assert.ok(codes(28.54, 0).includes("store.coords-half"));
});
