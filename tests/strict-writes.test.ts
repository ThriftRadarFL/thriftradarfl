// Strict writes: with a DB configured (prod or DB_STRICT_WRITES=1) a down DB must 503 on writes — never silently write JSON.
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
const dir = mkdtempSync(path.join(tmpdir(), "tr-strict-"));
process.env.THRIFTRADAR_DATA_DIR = dir; process.env.DATABASE_URL = "postgres://u:p@127.0.0.1:1/none"; process.env.DB_TIMEOUT_MS = "400"; process.env.DB_STRICT_WRITES = "1";
after(() => rmSync(dir, { recursive: true, force: true }));
test("DB down + strict: reads fall back to JSON, every write kind is a 503 and nothing lands in JSON", async () => {
  const data = await import("../src/lib/data");
  assert.equal(data.strictWrites(), true); assert.ok((await data.getVenues()).length > 0, "reads still served from JSON");
  const sale = { slug: "x", title: "X", type: "estate", city: "Port Orange", zip: "32127", lat: 0, lng: 0, sourceUrl: "", paymentMethods: [], days: [{ date: "2026-12-01", start: "09:00", end: "12:00", discountPct: 0 }] };
  const writes: [string, () => Promise<unknown>][] = [["sale", () => data.upsertSale(sale)], ["deleteSale", () => data.deleteSale("x")], ["subscriber", () => data.addDigestSubscriber("a@b.co", "")],
    ["unsubscribe", () => data.removeSubscriber("a@b.co")], ["contact", () => data.addContact({ name: "n", email: "a@b.co", message: "m" })], ["submission", () => data.addSubmission(sale, "a@b.co")],
    ["resolve", () => data.resolveSubmission("nope", true)], ["rule", () => data.deleteDealRule("nope")]];
  for (const [name, w] of writes) await assert.rejects(w, (e: { status?: number }) => e.status === 503, name);
  for (const f of ["sales.json", "digest-subscribers.json", "contact.json", "submissions.json", "deal-rules.json"]) assert.ok(!existsSync(path.join(dir, f)), `${f} must not be written`);
  await data.audit("test"); // audit never throws
  process.env.DB_STRICT_WRITES = "0"; assert.equal(data.strictWrites(), false);
});
