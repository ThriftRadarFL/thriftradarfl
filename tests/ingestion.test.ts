import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "path";
import { analyzeListing, extractListingUrls, proseClockTimes } from "../src/lib/ingestion/parse";
import { saleFromHtml } from "../src/lib/importer";
import { parseSale } from "../src/lib/validate";
import { activeSales, saleIsActive } from "../src/lib/upcoming";
import { groupChainDeals } from "../src/lib/deal-rules";

const dir = mkdtempSync(path.join(tmpdir(), "tr-ing-"));
process.env.THRIFTRADAR_DATA_DIR = dir;
delete process.env.DATABASE_URL;

const event = (over: Record<string, unknown> = {}) => {
  const ev = {
    "@type": "SaleEvent",
    name: "Saturday Sale",
    startDate: "2026-11-15T14:00:00.000Z",
    endDate: "2026-11-15T20:00:00.000Z",
    description: "Estate sale 9am-3pm",
    location: { "@type": "Place", address: { "@type": "PostalAddress", streetAddress: "100 Main St", addressLocality: "Orlando", addressRegion: "FL", postalCode: "32801" }, geo: { latitude: 28.54, longitude: -81.37 } },
    ...over,
  };
  return `<html><script type="application/ld+json">${JSON.stringify(ev)}</script></html>`;
};

test("importer no longer invents 17:00 ends or cash payments", () => {
  const html = event({ endDate: undefined, description: "Estate sale" });
  const s = saleFromHtml(html, "https://www.estatesales.net/FL/Orlando/32801/traditional/5990001");
  assert.ok(s);
  assert.deepEqual(s!.paymentMethods, []);
  assert.ok(!(s!.days ?? []).some((d) => d.end === "17:00"));
  const parsed = analyzeListing(html, "https://www.estatesales.net/FL/Orlando/32801/traditional/5990001");
  assert.equal(parsed.publishable, false);
  assert.ok(parsed.issues.includes("missing-or-invalid-end"));
});

test("single-day structured event with matching prose is publishable", () => {
  const parsed = analyzeListing(event(), "https://www.estatesales.net/FL/Orlando/32801/traditional/5990002?utm=x");
  assert.equal(parsed.publishable, true);
  assert.equal(parsed.externalId, "5990002");
  assert.equal(parsed.sale?.days?.length, 1);
  assert.equal(parsed.sale?.days?.[0].start, "09:00");
  assert.equal(parsed.sale?.days?.[0].end, "15:00");
  assert.deepEqual(parsed.sale?.paymentMethods, []);
});

test("conflicting prose time and missing fields quarantine; holds never publish", () => {
  const conflict = analyzeListing(event({ description: "AUCTION ON SATURDAY AT 4PM!!" }), "https://www.estatesales.net/FL/Orlando/32804/traditional/5147001");
  assert.equal(conflict.publishable, false);
  assert.ok(conflict.issues.includes("structured-vs-prose-time-conflict"));
  assert.ok(conflict.issues.includes("manual-hold"));
  const mountain = analyzeListing(event({ description: "Hours listed in US/Mountain 8:30am-1:00AM", endDate: "2026-11-15T06:00:00.000Z" }), "https://www.estatesales.org/estate-sales/fl/winter-park/32789/2472421");
  assert.equal(mountain.publishable, false);
  assert.ok(mountain.issues.includes("manual-hold"));
});

test("multi-day listings stay preview-only (no guessed daily hours for publish)", () => {
  const fixture = readFileSync("tests/fixtures-estatesale-ldjson.html", "utf8");
  const parsed = analyzeListing(fixture, "https://www.estatesales.net/FL/Port-Orange/32127/5139969");
  assert.equal(parsed.sale?.days?.length, 3);
  assert.ok(parsed.issues.includes("multi-day-hours-not-itemized"));
  assert.equal(parsed.publishable, false);
  assert.deepEqual(parsed.sale?.paymentMethods, []);
});

test("index pages yield only allowlisted listing URLs", () => {
  const html = `<a href="/FL/Orlando/32801/traditional/5990003">ok</a><a href="https://evil.com/FL/Orlando/32801/traditional/1">no</a>`;
  const urls = extractListingUrls(html, "https://www.estatesales.net/FL/Orlando");
  assert.deepEqual(urls, ["https://www.estatesales.net/FL/Orlando/32801/traditional/5990003"]);
  assert.deepEqual(proseClockTimes("3pm-8pm and 4PM"), ["15:00", "20:00", "16:00"]);
});

test("ingest run is idempotent, retries transient errors, and does not publish when dry", async () => {
  const pages: Record<string, string> = {
    "https://www.estatesales.net/FL/Orlando": `<a href="/FL/Orlando/32801/traditional/5990004">x</a>`,
    "https://www.estatesales.net/FL/Daytona-Beach": "",
    "https://www.estatesales.org/estate-sales/fl/orlando": "",
    "https://www.estatesales.net/FL/Orlando/32801/traditional/5990004": event({ name: "Idem Sale" }),
  };
  let detailHits = 0;
  const fetchImpl = async (url: string | URL) => {
    const href = String(url);
    if (href.includes("5990004")) {
      detailHits += 1;
      if (detailHits < 2) return new Response("", { status: 500 });
    }
    return new Response(pages[href] ?? "", { status: 200, headers: { "content-type": "text/html" } });
  };
  const { runIngestion } = await import("../src/lib/ingestion/run");
  const a = await runIngestion({ dryRun: true, publish: true, fetchImpl: fetchImpl as typeof fetch, extraUrls: [] });
  const b = await runIngestion({ dryRun: true, publish: true, fetchImpl: fetchImpl as typeof fetch });
  assert.equal(a.summary && (a.summary as { published?: number }).published, 0);
  assert.ok(((b.summary as { unchanged?: number }).unchanged ?? 0) >= 1);
  const { listCandidates } = await import("../src/lib/ingestion/store");
  const cands = await listCandidates(10);
  assert.ok(cands.some((c) => c.externalId === "5990004"));
  assert.ok(cands.every((c) => c.status !== "published"));
});

test("concurrent lease: second runner is skipped", async () => {
  const { acquireLease, releaseLease } = await import("../src/lib/ingestion/store");
  const first = await acquireLease("ingest-test", 30_000);
  assert.ok(first);
  const second = await acquireLease("ingest-test", 30_000);
  assert.equal(second, null);
  await releaseLease("ingest-test", first!.token);
  const third = await acquireLease("ingest-test", 30_000);
  assert.ok(third);
  await releaseLease("ingest-test", third!.token);
});

test("expired sales drop from public lists; detail helper still sees the date", () => {
  const ended = { days: [{ date: "2026-11-04", start: "09:00", end: "14:00", discountPct: 0 }] };
  const live = { days: [{ date: "2099-01-01", start: "09:00", end: "14:00", discountPct: 0 }] };
  assert.equal(saleIsActive(ended, "2026-11-07"), false);
  assert.equal(saleIsActive(live, "2026-11-07"), true);
  assert.equal(activeSales([ended, live], "2026-11-07").length, 1);
});

test("calendar chain-rule grouping collapses identical Goodwill labels", () => {
  const rules = [
    { venue: "goodwill-deland", day: 0, kind: "color_tag" as const, label: "Color of the Week 50% off", color: "bg-teal", verified: true },
    { venue: "goodwill-sanford", day: 0, kind: "color_tag" as const, label: "Color of the Week 50% off", color: "bg-teal", verified: true },
  ];
  const g = groupChainDeals(rules, [{ slug: "goodwill-deland", name: "DeLand" }, { slug: "goodwill-sanford", name: "Sanford" }]);
  assert.equal(g.length, 1);
  assert.equal(g[0].count, 2);
});

test("parseSale does not invent cash and rejects impossible HH:MM", () => {
  const r = parseSale({ title: "X", city: "DeLand", days: "2026-12-05 09:00 14:00" });
  assert.ok(r.ok && r.value.paymentMethods.length === 0);
  const bad = parseSale({ title: "X", city: "DeLand", days: "2026-12-05 24:99 25:00" });
  assert.equal(bad.ok, false);
});

test.after(() => rmSync(dir, { recursive: true, force: true }));
