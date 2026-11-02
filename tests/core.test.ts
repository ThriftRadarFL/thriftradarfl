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
  const s = { ...(mockSales[0] as Sale), title: "Commas, semis; and a very long title that will definitely need folding past seventy-five octets" };
  const ics = buildIcs([s]);
  assert.equal((ics.match(/BEGIN:VEVENT/g) ?? []).length, s.days.length);
  assert.ok(ics.includes("\r\n")); assert.ok(ics.split("\r\n").every((l) => Buffer.byteLength(l) <= 75));
  assert.ok(ics.includes("Commas\\, semis\\; and"));
  assert.ok(ics.includes("DTSTART;TZID=America/New_York:20261112T090000"));
});
test("digest picks sales in window, escapes html", () => {
  const d = buildDigest([{ ...(mockSales[0] as Sale), title: "<script>x</script>" }], "2026-11-10");
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
