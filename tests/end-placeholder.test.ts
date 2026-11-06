// n8: schema-required end times that are placeholders must be clearly marked (Knot Way pattern).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const MARK = /placeholder|not from the listing|end time not posted|closing time and end date not shown|estimate based on/i;

test("sales with end 17:00 include a clear placeholder/estimate disclaimer when used as fill-in", () => {
  const sales = JSON.parse(readFileSync("data/sales.json", "utf8")) as { slug: string; description?: string; days: { end: string }[] }[];
  const hits = sales.filter((s) => s.days.some((d) => d.end === "17:00"));
  assert.ok(hits.length >= 1, "expected at least Knot Way-style 17:00 placeholder");
  for (const s of hits) {
    assert.match(s.description ?? "", MARK, `${s.slug} end=17:00 needs a listing disclaimer (Knot Way pattern)`);
  }
});

test("Knot Way sale documents the 17:00 placeholder explicitly", () => {
  const sales = JSON.parse(readFileSync("data/sales.json", "utf8")) as { slug: string; description?: string }[];
  const k = sales.find((s) => s.slug.includes("knot-way"));
  assert.ok(k, "knot-way sale present");
  assert.match(k!.description ?? "", /placeholder|not from the listing/i);
});
