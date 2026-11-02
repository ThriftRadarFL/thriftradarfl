// Postgres round-trip for every store that used to be JSON-only. Runs only when PG_TEST_URL points at a throwaway DB
// (e.g. `npx pglite-server -p 54329 -m 10` → PG_TEST_URL=postgres://postgres@127.0.0.1:54329/postgres npm test).
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, mkdtempSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

test("schema: every JSON-backed field has a Postgres column (migration + paste file)", () => {
  const all = readdirSync("drizzle").filter((f) => f.endsWith(".sql")).map((f) => readFileSync(`drizzle/${f}`, "utf8")).join("\n");
  const paste = readFileSync("scripts/supabase-0002.sql", "utf8");
  for (const col of ['"published"', '"rule_key"', '"verified"', '"submissions"', '"contact_messages"', '"audit_log"', '"tags"', '"source_url"', '"org_key"']) assert.ok(all.includes(col), `drizzle migrations missing ${col}`);
  for (const s of ["venues ADD COLUMN IF NOT EXISTS source_url", "venues ADD COLUMN IF NOT EXISTS org_key", "sales ADD COLUMN IF NOT EXISTS published", "CREATE TABLE IF NOT EXISTS submissions", "CREATE TABLE IF NOT EXISTS contact_messages", "0005_venue_source_org"]) assert.ok(paste.includes(s), `paste file missing ${s}`);
});

const url = process.env.PG_TEST_URL;
const dir = mkdtempSync(path.join(tmpdir(), "tr-pg-"));
let D: typeof import("../src/lib/data");
before(async () => {
  if (!url) return;
  process.env.DATABASE_URL = url; process.env.THRIFTRADAR_DATA_DIR = dir; process.env.DB_TIMEOUT_MS = "8000";
  const { drizzle } = await import("drizzle-orm/postgres-js"); const { migrate } = await import("drizzle-orm/postgres-js/migrator"); const postgres = (await import("postgres")).default;
  const c = postgres(url, { prepare: false, max: 1 }); await migrate(drizzle(c), { migrationsFolder: "drizzle" }); await c.end();
  D = await import("../src/lib/data");
});
after(() => rmSync(dir, { recursive: true, force: true }));
const opt = { skip: url ? false : "set PG_TEST_URL to run" };
const pgOnly = () => { assert.equal(D.dataMode(), "postgres", `fell back to JSON: ${D.dbStatus().lastError}`); assert.deepEqual(readdirSync(dir), [], "nothing may be written to JSON"); };

test("pg: venue keeps sourceUrl + org key", opt, async () => {
  const v = { slug: "pg-v", org: "gwcfl", name: "PG Venue", type: "thrift", address: "1 Main", city: "DeLand", zip: "32720", lat: 29, lng: -81.3, phone: null, hoursJson: { daily: "9-5" }, notes: "n", sourceUrl: "https://example.org/x" };
  await D.upsertVenue(v); const got = await D.getVenue("pg-v");
  assert.equal(got?.sourceUrl, "https://example.org/x"); assert.equal(got?.org, "gwcfl"); assert.deepEqual(got?.hoursJson, { daily: "9-5" }); pgOnly();
});
test("pg: publish flag, tags, description", opt, async () => {
  const s = { slug: "pg-s", title: "PG sale", type: "estate", city: "DeLand", zip: "32720", lat: 29, lng: -81.3, sourceUrl: "", paymentMethods: ["cash"], tags: ["pyrex"], description: "d", published: false, days: [{ date: "2099-01-02", start: "08:00", end: "14:00", discountPct: 0 }] };
  await D.upsertSale(s); assert.equal(await D.getSale("pg-s"), null);
  const draft = (await D.getAllSales()).find((x) => x.slug === "pg-s"); assert.equal(draft?.published, false); assert.deepEqual(draft?.tags, ["pyrex"]); assert.equal(draft?.description, "d");
  assert.equal(await D.setSalePublished("pg-s", true), true); assert.equal((await D.getSale("pg-s"))?.days[0].start, "08:00"); pgOnly();
});
test("pg: deal rules CRUD + cascade on venue delete", opt, async () => {
  await D.upsertDealRule({ id: "pg-r1", venue: "pg-v", day: 2, kind: "half_off", label: "Half off", color: "bg-coral", discountPct: 50, time: "09:00", verified: true });
  const r = (await D.getDealRules()).find((x) => x.id === "pg-r1"); assert.equal(r?.verified, true); assert.equal(r?.time, "09:00"); assert.equal(r?.discountPct, 50);
  assert.equal(await D.deleteDealRule("pg-r1"), true); assert.equal(await D.deleteDealRule("pg-r1"), false);
  await D.upsertDealRule({ id: "pg-r2", venue: "pg-v", day: 3, kind: "restock", label: "Restock", color: "bg-royal", verified: false });
  await D.deleteVenue("pg-v"); assert.equal((await D.getDealRules()).some((x) => x.id === "pg-r2"), false); pgOnly();
});
test("pg: submissions queue + contact messages + subscribers + audit", opt, async () => {
  const sale = { slug: "pg-sub", title: "Sub", type: "yard", city: "DeLand", zip: "32720", lat: 29, lng: -81.3, sourceUrl: "", paymentMethods: [], days: [{ date: "2099-02-01", start: "08:00", end: "12:00", discountPct: 0 }] };
  const id = await D.addSubmission(sale, "a@b.co"); assert.equal((await D.listSubmissions()).length, 1);
  assert.equal(await D.resolveSubmission(id, true), "pg-sub"); assert.equal((await D.listSubmissions()).length, 0); assert.ok(await D.getSale("pg-sub"));
  await D.addContact({ name: "N", email: "n@x.co", message: "hi" }); const [m] = await D.listContacts(); assert.equal(m.message, "hi");
  await D.deleteContact(m.id); assert.equal((await D.listContacts()).length, 0);
  assert.equal(await D.addDigestSubscriber("X@Y.co", "volusia"), true); assert.equal(await D.addDigestSubscriber("x@y.co", "volusia"), false); assert.equal(await D.removeSubscriber("x@Y.CO"), true);
  await D.audit("test", "t", "d"); assert.equal((await D.listAudit(1))[0].action, "test"); pgOnly();
});
