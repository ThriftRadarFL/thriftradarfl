// /api/health with DATABASE_URL pointing at an unreachable DB → "json-fallback".
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
const dir = mkdtempSync(path.join(tmpdir(), "tr-hf-"));
process.env.THRIFTRADAR_DATA_DIR = dir; process.env.DATABASE_URL = "postgres://u:secretpw@127.0.0.1:1/none"; process.env.DB_TIMEOUT_MS = "500";
after(() => rmSync(dir, { recursive: true, force: true }));
test("health: DB configured but down → json-fallback, still 200, no credentials leaked", async () => {
  const { GET } = await import("../src/app/api/health/route"); const r = await GET(); assert.equal(r.status, 200);
  const h = await r.json(); assert.equal(h.mode, "json-fallback"); assert.equal(h.db.configured, true); assert.equal(h.db.up, false);
  assert.ok(h.venues > 0); assert.ok(!JSON.stringify(h).includes("secretpw"));
});
