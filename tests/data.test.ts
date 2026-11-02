// Data layer (JSON mode) against a throwaway data dir. Also checks DB-unreachable fallback.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
const dir = mkdtempSync(path.join(tmpdir(), "tr-data-"));
process.env.THRIFTRADAR_DATA_DIR = dir;
// Unroutable DB URL → every query fails fast; data layer must fall back to JSON.
process.env.DATABASE_URL = "postgres://u:p@127.0.0.1:1/none";
type D = typeof import("../src/lib/data");
let D: D;
const sale = { slug: "t-sale", title: "Test sale", type: "estate", city: "DeLand", zip: "32720", lat: 29, lng: -81.3, sourceUrl: "", paymentMethods: ["cash"], days: [{ date: "2099-01-02", start: "08:00", end: "14:00", discountPct: 0 }] };
before(async () => { D = await import("../src/lib/data"); });
after(() => rmSync(dir, { recursive: true, force: true }));

test("falls back to JSON seed when DB is unreachable", async () => {
  const v = await D.getVenues(); assert.ok(v.length > 0);
  assert.equal(D.dataMode(), "json"); const st = D.dbStatus(); assert.equal(st.configured, true); assert.equal(st.up, false); assert.ok(st.lastError);
});
test("sale CRUD + publish flag hides drafts from public reads", async () => {
  await D.upsertSale(sale); assert.ok(await D.getSale("t-sale"));
  await D.setSalePublished("t-sale", false);
  assert.equal(await D.getSale("t-sale"), null); assert.ok((await D.getAllSales()).some((s) => s.slug === "t-sale"));
  await D.setSalePublished("t-sale", true); assert.ok(await D.getSale("t-sale"));
  await D.deleteSale("t-sale"); assert.equal((await D.getAllSales()).some((s) => s.slug === "t-sale"), false);
});
test("sales are sorted soonest first", async () => {
  const s = await D.getSales(); const firsts = s.map((x) => x.days[0].date); assert.deepEqual(firsts, [...firsts].sort());
});
test("deleting a venue removes its deal rules", async () => {
  const rules = await D.getDealRules(); assert.ok(rules.every((r) => r.id)); const slug = rules[0].venue;
  await D.deleteVenue(slug);
  assert.equal(await D.getVenue(slug), null); assert.equal((await D.getDealRules()).some((r) => r.venue === slug), false);
});
test("deal rule upsert/delete", async () => {
  const r = { id: "x-1-test", venue: "x", day: 1, kind: "half_off" as const, label: "Test", color: "bg-coral", verified: true };
  await D.upsertDealRule(r); assert.ok((await D.getDealRules()).some((x) => x.id === "x-1-test"));
  assert.equal(await D.deleteDealRule("x-1-test"), true); assert.equal(await D.deleteDealRule("x-1-test"), false);
});
test("subscribers: dedupe case-insensitively, remove", async () => {
  assert.equal(await D.addDigestSubscriber("A@b.co", "All"), true); assert.equal(await D.addDigestSubscriber("a@B.co", "All"), false);
  assert.equal((await D.listSubscribers()).length, 1); assert.equal(await D.removeSubscriber("a@b.co"), true); assert.equal((await D.listSubscribers()).length, 0);
});
test("submissions: queued unpublished, approve publishes, reject discards", async () => {
  const id = await D.addSubmission({ ...sale, slug: "sub-1" }, "s@e.co");
  assert.equal((await D.listSubmissions())[0].sale.published, false); assert.equal(await D.getSale("sub-1"), null);
  assert.equal(await D.resolveSubmission(id, true), "sub-1"); assert.ok(await D.getSale("sub-1")); assert.equal((await D.listSubmissions()).length, 0);
  const id2 = await D.addSubmission({ ...sale, slug: "sub-2" }, "s@e.co"); await D.resolveSubmission(id2, false);
  assert.equal((await D.getAllSales()).some((s) => s.slug === "sub-2"), false); assert.equal(await D.resolveSubmission("nope", true), null);
});
test("contact messages store + delete", async () => {
  await D.addContact({ name: "N", email: "n@e.co", message: "hello there" }); const [m] = await D.listContacts(); assert.equal(m.name, "N");
  await D.deleteContact(m.id); assert.equal((await D.listContacts()).length, 0);
});
test("concurrent writes don't corrupt JSON", async () => {
  await Promise.all(Array.from({ length: 10 }, (_, i) => D.upsertSale({ ...sale, slug: `c-${i}` })));
  assert.equal((await D.getAllSales()).filter((s) => s.slug.startsWith("c-")).length, 10);
});
test("corrupt JSON file falls back to seed instead of throwing", async () => {
  writeFileSync(path.join(dir, "venues.json"), "{not json"); assert.ok((await D.getVenues()).length > 0);
});
