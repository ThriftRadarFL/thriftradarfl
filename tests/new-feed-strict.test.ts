// 6 PM pass: 404 regression guard, strict DB writes, "new this week" + Atom feed, addedAt persistence (JSON).
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readdirSync, statSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
const dir = mkdtempSync(path.join(tmpdir(), "tr-new-"));
process.env.THRIFTRADAR_DATA_DIR = dir;
after(() => rmSync(dir, { recursive: true, force: true }));
const load = () => import("../src/lib/new-sales"); // lazy: env must be set before data.ts loads
type Sale = import("../src/lib/data").Sale;
const mk = (slug: string, addedAt: string | undefined, date: string, extra: Partial<Sale> = {}): Sale => ({ slug, title: `Sale ${slug} & <co>`, type: "estate", city: "Port Orange", zip: "32127", lat: 29.1, lng: -81, sourceUrl: "", paymentMethods: [], days: [{ date, start: "09:00", end: "15:00", discountPct: 50 }], ...(addedAt ? { addedAt } : {}), ...extra });
const now = new Date("2026-11-02T23:00:00Z");

test("404 guard: no loading.tsx above any route that calls notFound() (streaming would force HTTP 200)", () => {
  const app = path.join(process.cwd(), "src/app"); assert.ok(!existsSync(path.join(app, "loading.tsx")), "root loading.tsx breaks 404 status codes");
  const walk = (d: string): string[] => readdirSync(d).flatMap((f) => { const p = path.join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
  for (const f of walk(app).filter((p) => /page\.tsx$/.test(p) && /notFound\(\)/.test(readFileSync(p, "utf8")))) {
    for (let d = path.dirname(f); d.length >= app.length; d = path.dirname(d)) assert.ok(!existsSync(path.join(d, "loading.tsx")), `${path.relative(app, d)}/loading.tsx sits above ${path.relative(app, f)}`);
  }
});

test("recentlyAdded: 7-day window, upcoming only, newest first, skips undated + future-dated", async () => {
  const { recentlyAdded } = await load();
  const list = [mk("old", "2026-10-20T00:00:00Z", "2026-11-10"), mk("a", "2026-10-30T12:00:00Z", "2026-11-10"), mk("b", "2026-11-02T20:00:00Z", "2026-11-12"),
    mk("ended", "2026-11-01T00:00:00Z", "2026-11-01"), mk("nodate", undefined, "2026-11-10"), mk("future", "2026-11-09T00:00:00Z", "2026-11-12")];
  assert.deepEqual(recentlyAdded(list, now).map((s) => s.slug), ["b", "a"]);
});

test("atomFeed: valid-shaped Atom, escaped, absolute links, stable tag ids, updated = newest", async () => {
  const { atomFeed } = await load();
  const xml = atomFeed([mk("a", "2026-10-30T12:00:00Z", "2026-11-10"), mk("b", "2026-11-02T20:00:00Z", "2026-11-12")], "https://thriftradarfl.com/", now);
  assert.match(xml, /^<\?xml version="1.0" encoding="utf-8"\?>\n<feed xmlns="http:\/\/www.w3.org\/2005\/Atom">/);
  assert.equal((xml.match(/<entry>/g) ?? []).length, 2); assert.ok(xml.indexOf("sale/b") < xml.indexOf("sale/a"));
  assert.ok(xml.includes('href="https://thriftradarfl.com/sales/a"')); assert.ok(xml.includes("<id>tag:thriftradarfl.com,2026:sale/a</id>"));
  assert.ok(xml.includes("<updated>2026-11-02T20:00:00.000Z</updated>")); assert.ok(xml.includes("&amp; &lt;co&gt;")); assert.ok(!xml.includes("<co>"));
  assert.ok(xml.includes("up to 50% off")); assert.ok(atomFeed([], "https://x.test", now).includes("</feed>"));
});

test("JSON driver: addedAt is set on first save and sticky across edits", async () => {
  const data = await import("../src/lib/data"); assert.ok(!(await data.getAllSales()).some((x) => x.slug === "fresh-sale"));
  const s = mk("fresh-sale", undefined, "2026-12-01"); await data.upsertSale(s);
  const first = (await data.getAllSales()).find((x) => x.slug === "fresh-sale")!; assert.ok(first.addedAt && Date.now() - Date.parse(first.addedAt) < 10_000);
  await data.upsertSale({ ...s, title: "Edited", addedAt: "2020-01-01T00:00:00Z" });
  const again = (await data.getAllSales()).find((x) => x.slug === "fresh-sale")!; assert.equal(again.title, "Edited"); assert.equal(again.addedAt, first.addedAt);
});

test("feed.xml route + /new are wired (sitemap, layout alternate)", async () => {
  const { GET } = await import("../src/app/feed.xml/route"); const r = await GET(new Request("http://l/feed.xml")); assert.equal(r.status, 200);
  assert.match(r.headers.get("content-type") ?? "", /application\/atom\+xml/); assert.ok((await r.text()).includes("<feed"));
  const { STATIC_PAGES } = await import("../src/lib/seo"); assert.ok(STATIC_PAGES.includes("/new"));
});
