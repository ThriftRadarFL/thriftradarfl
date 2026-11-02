import { test } from "node:test";
import assert from "node:assert/strict";
import { storageError } from "../src/lib/data";
import { HttpError } from "../src/lib/api";
test("storageError maps read-only FS errors to 503", () => { const e = storageError(Object.assign(new Error("x"), { code: "EROFS" })); assert.ok(e instanceof HttpError); assert.equal((e as HttpError).status, 503); });
test("storageError passes other errors through", () => { const o = new Error("boom"); assert.equal(storageError(o), o); });
test("no root loading.tsx (it forces HTTP 200 on notFound)", async () => { const fs = await import("fs"); assert.equal(fs.existsSync("src/app/loading.tsx"), false); });
import { t12, range12 } from "../src/lib/time";
test("t12 formats 24h times for US readers", () => { assert.equal(t12("18:30"), "6:30 PM"); assert.equal(t12("08:00"), "8 AM"); assert.equal(t12("00:15"), "12:15 AM"); assert.equal(t12("12:00"), "12 PM"); assert.equal(t12("x"), "x"); assert.equal(range12("09:00", "14:00"), "9 AM–2 PM"); });
