// Run: npm test  (node:test via tsx, no extra deps)
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSale, parseVenue, isEmail, slugify } from "../src/lib/validate";
import { buildIcs } from "../src/lib/ics";
import { buildDigest } from "../src/lib/digest";
import { mockSales } from "../src/lib/seed-data";
import type { Sale } from "../src/lib/data";

test("parseSale accepts textarea days and derives slug", () => {
  const r = parseSale({ title: "Big Estate!", type: "estate", city: "DeLand", days: "2026-12-05 09:00 14:00 25\n2026-12-06 09:00 12:00" });
  assert.ok(r.ok); if (!r.ok) return;
  assert.equal(r.value.slug, "big-estate-2026-12"); assert.equal(r.value.days[0].discountPct, 25); assert.equal(r.value.days[1].discountPct, 0);
});
test("parseSale rejects bad input", () => {
  const r = parseSale({ title: "", type: "nope", city: "", days: "2026-12-05 14:00 09:00 150", lat: 40 });
  assert.equal(r.ok, false); if (r.ok) return;
  for (const m of ["title required", "invalid type", "city required", "end must be after start", "discount 0-100", "lat outside Florida"]) assert.ok(r.errors.some((e) => e.includes(m)), m);
});
test("parseVenue + helpers", () => {
  assert.ok(parseVenue({ name: "Test Thrift", city: "Ormond Beach", type: "thrift" }).ok);
  assert.equal(parseVenue({ name: "", city: "" }).ok, false);
  assert.ok(isEmail("a@b.co")); assert.ok(!isEmail("a@b")); assert.equal(slugify("  Hello, World! "), "hello-world");
});
test("ics: one VEVENT per day, CRLF, folded lines, escaping", () => {
  const s = { ...(mockSales.find((m) => m.slug.startsWith("precious-finds"))! as Sale), title: "Commas, semis; and a very long title that will definitely need folding past seventy-five octets" };
  const ics = buildIcs([s]);
  assert.equal((ics.match(/BEGIN:VEVENT/g) ?? []).length, s.days.length);
  assert.ok(ics.includes("\r\n")); assert.ok(ics.split("\r\n").every((l) => Buffer.byteLength(l) <= 75));
  assert.ok(ics.includes("Commas\\, semis\\; and"));
  assert.ok(ics.includes("DTSTART;TZID=America/New_York:20261112T090000"));
});
test("digest picks sales in window, escapes html", () => {
  const d = buildDigest([{ ...(mockSales.find((m) => m.slug.startsWith("precious-finds"))! as Sale), title: "<script>x</script>" }], "2026-11-10");
  assert.equal(d.count, 1); assert.ok(!d.html.includes("<script>x")); assert.ok(d.html.includes("&lt;script&gt;"));
  assert.equal(buildDigest(mockSales as Sale[], "2030-01-01").count, 0);
});
import { readFileSync } from "node:fs";
import { saleFromHtml, isAllowedImportHost } from "../src/lib/importer";
test("importer parses EstateSales.net JSON-LD fixture into ET days", () => {
  const s = saleFromHtml(readFileSync("tests/fixtures-estatesale-ldjson.html", "utf8"), "https://www.estatesales.net/FL/Port-Orange/32127/5139969");
  assert.ok(s); assert.equal(s!.city, "Port Orange"); assert.equal(s!.days!.length, 3);
  assert.deepEqual(s!.days![0], { date: "2026-11-12", start: "09:00", end: "15:00", discountPct: 0 });
  assert.ok(isAllowedImportHost("https://www.estatesales.net/x")); assert.ok(!isAllowedImportHost("https://evil.com/x"));
});
import { parseDealRule, parseContact } from "../src/lib/validate";
import { searchAll, matches } from "../src/lib/search";
import { saleJsonLd, venueJsonLd } from "../src/lib/jsonld";
import { seedVenues } from "../src/lib/seed-data";
import type { Venue } from "../src/lib/data";
test("parseDealRule / parseContact", () => {
  const r = parseDealRule({ venue: "goodwill-port-orange", day: "3", kind: "half_off", label: "Half off", discountPct: "50", verified: "on" });
  assert.ok(r.ok); if (r.ok) { assert.equal(r.value.day, 3); assert.equal(r.value.verified, true); assert.equal(r.value.color, "bg-coral"); assert.ok(r.value.id); }
  const bad = parseDealRule({ venue: "", day: 9, kind: "x", label: "", time: "9am", discountPct: 200 }); assert.equal(bad.ok, false);
  if (!bad.ok) assert.equal(bad.errors.length, 6);
  assert.ok(parseContact({ name: "A", email: "a@b.co", message: "long enough message" }).ok); assert.equal(parseContact({ name: "", email: "x", message: "hi" }).ok, false);
});
test("search matches all terms across fields, accent/case-insensitive", () => {
  assert.ok(matches(["Café Estate", "DeLand"], "cafe deland")); assert.ok(!matches(["Café"], "")); assert.ok(!matches(["a"], "a b"));
  const r = searchAll("port orange", mockSales as Sale[], seedVenues as Venue[]); assert.ok(r.sales.length > 0); assert.ok(r.venues.some((v) => v.slug === "goodwill-port-orange"));
  assert.ok(searchAll("bins", [], seedVenues as Venue[]).venues.length >= 2);
});
test("JSON-LD: Event has ET offsets, absolute URLs; Store has address", () => {
  const ld = saleJsonLd(mockSales.find((m) => m.slug.startsWith("precious-finds"))! as Sale);
  assert.equal(ld["@type"], "Event"); assert.match(ld.startDate, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00-05:00$/); assert.match(ld.url, /^https?:\/\//);
  assert.equal(ld.location.address.addressRegion, "FL");
  const v = venueJsonLd(seedVenues[0] as Venue); assert.equal(v["@type"], "Store"); assert.equal(v.address.postalCode, seedVenues[0].zip);
});
test("digest email uses PNG logo (SVG is blocked by many mail clients)", () => {
  const d = buildDigest(mockSales as Sale[], "2026-11-10"); assert.ok(d.html.includes("/logo-email.png")); assert.ok(!d.html.includes("logo.svg"));
});
import { cleanTags, tagsFromTitle, FLIP_TIPS, TAGS, ebaySoldUrl } from "../src/lib/flip-tips";
test("tags: whitelist, dedupe, title-derived; every tag has a tip", () => {
  assert.deepEqual(cleanTags("Tools, tools, nonsense, JEWELRY"), ["tools", "jewelry"]);
  assert.deepEqual(tagsFromTitle("Mid-Century Estate — Teak & Barware"), ["mid-century", "barware"]);
  for (const t of TAGS) assert.ok(FLIP_TIPS[t].length > 40, t);
  assert.ok(ebaySoldUrl("vinyl records").includes("LH_Sold=1"));
  const r = parseSale({ title: "x", city: "DeLand", days: "2099-01-01 08:00 12:00", tags: "art,bogus" }); assert.ok(r.ok && r.value.tags?.join() === "art");
});
import { parseCsv, csvToRecords, SALE_CSV_TEMPLATE } from "../src/lib/csv";
test("csv: quotes, escaped quotes, CRLF, embedded newlines", () => {
  assert.deepEqual(parseCsv('a,b\r\n"x, y","he said ""hi"""\n"multi\nline",z\n'), [["a", "b"], ["x, y", 'he said "hi"'], ["multi\nline", "z"]]);
  const { records, errors } = csvToRecords(SALE_CSV_TEMPLATE); assert.equal(errors.length, 0); assert.equal(records.length, 1);
  const r = parseSale(records[0]); assert.ok(r.ok); if (r.ok) { assert.equal(r.value.days.length, 2); assert.equal(r.value.days[1].discountPct, 50); assert.deepEqual(r.value.tags, ["furniture", "tools"]); }
  assert.ok(csvToRecords("foo,bar\n1,2").errors.some((e) => e.includes('missing column "title"')));
});
test("seed venues: unique slugs, every new store has a source URL, coords in Florida or 0", () => {
  const slugs = seedVenues.map((v) => v.slug); assert.equal(new Set(slugs).size, slugs.length);
  for (const v of seedVenues) { assert.match(v.sourceUrl, /^https:\/\//, v.slug);
    if (v.lat) { assert.ok(v.lat > 24 && v.lat < 31.5 && v.lng < -79.5 && v.lng > -88, v.slug); } }
});
import { siteUrl, isLocalUrl } from "../src/lib/site";
import { dayLabel } from "../src/lib/digest";
test("siteUrl: NEXT_PUBLIC_SITE_URL → Vercel domain → localhost; always absolute, no trailing slash", () => {
  assert.equal(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://thriftradarfl.com/" }), "https://thriftradarfl.com");
  assert.equal(siteUrl({ NEXT_PUBLIC_SITE_URL: "  ", VERCEL_PROJECT_PRODUCTION_URL: "trfl.vercel.app" }), "https://trfl.vercel.app");
  assert.equal(siteUrl({ NEXT_PUBLIC_SITE_URL: "thriftradarfl.com" }), "https://thriftradarfl.com");
  assert.equal(siteUrl({}), "http://localhost:3000"); assert.ok(isLocalUrl(siteUrl({}))); assert.ok(!isLocalUrl("https://thriftradarfl.com"));
});
test("digest: absolute PNG logo + links on the given site URL, 12-hour day labels, store names on deal days", () => {
  const d = buildDigest(mockSales as Sale[], "2026-11-10", "https://x.test/digest", undefined, { "goodwill-port-orange": "Goodwill Port Orange" }, "https://x.test");
  assert.ok(d.html.includes('<img src="https://x.test/logo-email.png"')); assert.ok(!/(src|href)="\/(?!\/)/.test(d.html), "no relative URLs in email");
  assert.ok(d.html.includes("— Goodwill Port Orange")); assert.ok(!/\b\d{2}:\d{2}\b/.test(d.html), "no 24h times");
  assert.equal(dayLabel("2026-11-12", "09:00"), "Thu 11/12 9 AM");
});
test("email logo PNG exists and matches the 215×40 slot (2.4× retina)", async () => {
  const b = (await import("node:fs")).readFileSync("public/logo-email.png"); assert.equal(b.subarray(1, 4).toString(), "PNG");
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20); assert.ok(Math.abs(w / h - 215 / 40) < 0.05, `aspect ${w}x${h}`);
});
import { isHttpUrl, isRealDate } from "../src/lib/validate";
test("validation gaps: real dates, parseable http(s) URLs, venue caps/zip/coords/slug", () => {
  assert.ok(isRealDate("2028-02-29")); assert.ok(!isRealDate("2026-02-31")); assert.ok(!isRealDate("2026-13-01"));
  assert.ok(isHttpUrl("https://www.goodwillcfl.org/locations/")); for (const bad of ["https://", "javascript:alert(1)", "https://exa mple.com", "ftp://x.org", "https://localhost"]) assert.ok(!isHttpUrl(bad), bad);
  const base = { title: "T", city: "DeLand", days: [{ date: "2026-02-31", start: "08:00", end: "12:00", discountPct: 0 }] };
  assert.equal(parseSale(base).ok, false); assert.equal(parseSale({ ...base, days: [{ ...base.days[0], date: "2099-03-01" }], sourceUrl: "https://" }).ok, false);
  const v = { name: "V", city: "DeLand", type: "thrift" };
  assert.ok(parseVenue({ ...v, zip: " 32720 ", sourceUrl: "https://example.org/x" }).ok);
  for (const bad of [{ zip: "abc" }, { lat: 40 }, { slug: "Bad Slug" }, { sourceUrl: "https://" }, { name: "x".repeat(200) }, { notes: "x".repeat(3000) }]) assert.equal(parseVenue({ ...v, ...bad }).ok, false, JSON.stringify(bad).slice(0, 40));
});

test("store research merge: seed rules parse, removed Daytona ISB, new stores present, structured hours accepted", async () => {
  const { parseDealRule, parseVenue: pv } = await import("../src/lib/validate");
  const { dealRules: rules } = await import("../src/lib/deal-rules");
  for (const r of rules) assert.ok(parseDealRule({ ...r }).ok, r.label);
  const slugs = seedVenues.map((v) => v.slug);
  assert.ok(!slugs.includes("goodwill-daytona-isb")); assert.ok(!rules.some((r) => r.venue === "goodwill-daytona-isb"));
  for (const s of ["salvation-army-w-colonial-orlando", "goodwill-holly-hill", "halifax-humane-society-thrift-store"]) assert.ok(slugs.includes(s), s);
  assert.ok(!slugs.some((s) => s.includes("bunnell") || s === "savers-orlando"));
  assert.ok(rules.filter((r) => r.venue === "salvation-army-w-colonial-orlando").every((r) => !r.verified));
  for (const r of rules.filter((r) => /outlet/.test(r.venue))) assert.equal(r.verified, false, r.label);
  const v = pv({ name: "X", city: "Orlando", hoursJson: { "mon-sat": "9:00-18:00" } }); assert.ok(v.ok && v.value.hoursJson?.["mon-sat"] === "9:00-18:00");
});
