import { test } from "node:test";
import assert from "node:assert/strict";
import { matchedKeywords, keywordMatches, newKeywordMatches, buildKeywordAlert, digestKeywordBlock } from "../src/lib/keyword-alerts";
import { parseKeywords, parseSubscriber } from "../src/lib/validate";
import type { Sale } from "../src/lib/data";
const sale = (slug: string, title: string, date: string, extra: Partial<Sale> = {}): Sale => ({ slug, title, type: "estate", city: "DeLand", zip: "32720", lat: 29, lng: -81, sourceUrl: "https://example.com", paymentMethods: [], days: [{ date, start: "08:00", end: "14:00", discountPct: 0 }], ...extra });
test("parseKeywords normalizes, dedupes, caps at 5", () => {
  assert.deepEqual(parseKeywords("Pyrex, pyrex, Mid-Century, tools"), ["pyrex", "mid-century", "tools"]);
  assert.equal(parseKeywords("a,b,c,d,e,f,g,h".split("").map((c) => c + c).join(",")).length, 5);
  assert.deepEqual(parseKeywords(""), []);
  const r = parseSubscriber({ email: "a@b.co", keywords: "Lionel trains" }); assert.ok(r.ok); if (r.ok) assert.deepEqual(r.value.keywords, ["lionel trains"]);
});
test("matchedKeywords uses whole words and simple plurals", () => {
  const s = sale("a", "Mid-Century Estate: Pyrex bowls, power tools, lamps", "2026-11-07", { description: "Lionel trains in basement" });
  assert.deepEqual(matchedKeywords(s, ["pyrex", "tool", "lamp", "lionel trains", "mid-century", "ex"]), ["pyrex", "tool", "lamp", "lionel trains", "mid-century"]);
  assert.deepEqual(matchedKeywords(sale("b", "Toolbox sale", "2026-11-07"), ["tool"]), []);
});
test("keywordMatches skips ended/unpublished; newKeywordMatches only fresh listings", () => {
  const now = new Date("2026-11-03T12:00:00Z");
  const fresh = sale("f", "Pyrex galore", "2026-11-07", { addedAt: "2026-11-03T02:00:00Z" });
  const old = sale("o", "Pyrex old", "2026-11-08", { addedAt: "2026-10-20T02:00:00Z" });
  const ended = sale("e", "Pyrex ended", "2026-10-01", { addedAt: "2026-11-03T02:00:00Z" });
  const hidden = sale("h", "Pyrex hidden", "2026-11-07", { published: false, addedAt: "2026-11-03T02:00:00Z" });
  assert.deepEqual(keywordMatches([fresh, old, ended, hidden], ["pyrex"], "2026-11-03").map((m) => m.sale.slug), ["f", "o"]);
  assert.deepEqual(newKeywordMatches([fresh, old, ended, hidden], ["pyrex"], now).map((m) => m.sale.slug), ["f"]);
  const a = buildKeywordAlert(newKeywordMatches([fresh], ["pyrex"], now), "https://x.test/u", "https://x.test", "2026-11-03");
  assert.match(a.subject, /1 new sale mention “pyrex”/); assert.match(a.html, /https:\/\/x\.test\/u">Unsubscribe/); assert.match(a.text, /x\.test\/sales\/f/);
  assert.equal(digestKeywordBlock([], "2026-11-03").html, "");
  assert.match(digestKeywordBlock(keywordMatches([fresh], ["pyrex"], "2026-11-03"), "2026-11-03", "https://x.test").html, /Your keyword matches/);
});
