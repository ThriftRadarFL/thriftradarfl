import { test } from "node:test";
import assert from "node:assert/strict";
import { storageError } from "../src/lib/data";
import { HttpError } from "../src/lib/api";
test("storageError maps read-only FS errors to 503", () => { const e = storageError(Object.assign(new Error("x"), { code: "EROFS" })); assert.ok(e instanceof HttpError); assert.equal((e as HttpError).status, 503); });
test("storageError passes other errors through", () => { const o = new Error("boom"); assert.equal(storageError(o), o); });
test("no root loading.tsx (it forces HTTP 200 on notFound)", async () => { const fs = await import("fs"); assert.equal(fs.existsSync("src/app/loading.tsx"), false); });
