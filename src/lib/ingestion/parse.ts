import { createHash } from "crypto";
import type { Sale, SaleDay } from "../data";
import { slugify } from "../validate";
import { isAllowedImportHost } from "../importer-hosts";
import { HOLD_EXTERNAL_IDS, PARSER_VERSION } from "./sources";

type LD = Record<string, unknown>;

export const isClock = (t: string) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(t);

export function extractJsonLd(html: string): LD[] {
  const out: LD[] = [];
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { const v = JSON.parse(m[1]); for (const x of Array.isArray(v) ? v : v["@graph"] ?? [v]) out.push(x as LD); } catch { /* skip */ }
  }
  return out;
}

export function canonicalUrl(raw: string): string {
  const u = new URL(raw);
  u.hash = ""; u.search = "";
  u.hostname = u.hostname.toLowerCase();
  const path = u.pathname.replace(/\/+$/, "") || "/";
  return `${u.protocol}//${u.hostname}${path}`;
}

export function listingIdFromUrl(url: string): string | null {
  try {
    const path = new URL(url).pathname;
    const m = path.match(/\/(?:traditional\/)?(\d{5,})\/?$/i);
    return m?.[1] ?? null;
  } catch { return null; }
}

export function sourceKey(url: string): string {
  try {
    const h = new URL(url).hostname.toLowerCase();
    if (h.endsWith("estatesales.net")) return "estatesales_net";
    if (h.endsWith("estatesales.org")) return "estatesales_org";
    if (h.endsWith("auctionzip.com")) return "auctionzip";
    if (h.endsWith("hibid.com")) return "hibid";
    return h.replace(/^www\./, "");
  } catch { return "unknown"; }
}

export function extractListingUrls(html: string, pageUrl: string): string[] {
  const found = new Set<string>();
  const consider = (raw: string) => {
    try {
      const abs = new URL(raw, pageUrl).href;
      if (!isAllowedImportHost(abs)) return;
      if (!listingIdFromUrl(abs)) return;
      found.add(canonicalUrl(abs));
    } catch { /* skip */ }
  };
  for (const m of html.matchAll(/href=["']([^"'#]+)["']/gi)) consider(m[1]);
  for (const ev of extractJsonLd(html)) {
    if (typeof ev.url === "string") consider(ev.url);
    if (typeof ev["@id"] === "string") consider(String(ev["@id"]));
  }
  return [...found];
}

const etParts = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(d).map((x) => [x.type, x.value]));
  const date = `${p.year}-${p.month}-${p.day}`;
  const time = `${p.hour}:${p.minute}`;
  return isClock(time) ? { date, time } : null;
};

const minutes = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

export function proseClockTimes(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(/\b(\d{1,2})(?::(\d{2}))?\s*(a\.?m\.?|p\.?m\.?)\b/gi)) {
    let h = Number(m[1]); const min = m[2] ? Number(m[2]) : 0;
    const ap = m[3].toLowerCase();
    if (h < 1 || h > 12 || min > 59) continue;
    if (ap.startsWith("p") && h < 12) h += 12;
    if (ap.startsWith("a") && h === 12) h = 0;
    const t = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
    if (isClock(t)) out.push(t);
  }
  return out;
}

const datesBetween = (start: string, end: string, cap = 14): string[] => {
  const out: string[] = [];
  const cur = new Date(start + "T12:00:00Z");
  const last = new Date(end + "T12:00:00Z");
  for (let i = 0; cur <= last && i < cap; i++, cur.setUTCDate(cur.getUTCDate() + 1)) out.push(cur.toISOString().slice(0, 10));
  return out;
};

const BLOCKING = new Set([
  "no-schema-event", "invalid-start-date", "invalid-end-date", "missing-dates", "missing-or-invalid-end",
  "multi-day-hours-not-itemized", "missing-city", "outside-florida-region", "lat-outside-florida",
  "lng-outside-florida", "missing-coordinates", "non-et-timezone-label", "implausible-end-hour",
  "implausible-duration", "structured-vs-prose-time-conflict", "manual-hold", "host-not-allowed",
  "invalid-source-url",
]);

export type ListingParse = {
  sale: Partial<Sale> | null;
  issues: string[];
  publishable: boolean;
  externalId: string | null;
  source: string;
  canonicalUrl: string;
  digest: string;
  parserVersion: string;
};

export function analyzeListing(html: string, sourceUrl: string): ListingParse {
  const issues: string[] = [];
  let canonical = sourceUrl;
  try { canonical = canonicalUrl(sourceUrl); } catch { issues.push("invalid-source-url"); }
  const source = sourceKey(canonical);
  const externalId = listingIdFromUrl(canonical);
  const empty = (extra: string[] = []): ListingParse => ({
    sale: null, issues: [...issues, ...extra], publishable: false, externalId, source,
    canonicalUrl: canonical, digest: "", parserVersion: PARSER_VERSION,
  });

  if (!isAllowedImportHost(canonical)) return empty(["host-not-allowed"]);
  const ev = extractJsonLd(html).find((x) => /Event$/i.test(String(x["@type"] ?? "")));
  if (!ev || !ev.startDate) return empty(["no-schema-event"]);

  const loc = (ev.location ?? {}) as LD;
  const addr = (loc.address ?? {}) as LD;
  const geo = (loc.geo ?? {}) as LD;
  const start = etParts(String(ev.startDate));
  if (!start) return empty(["invalid-start-date"]);
  const hasEnd = ev.endDate != null && String(ev.endDate) !== "";
  const end = hasEnd ? etParts(String(ev.endDate)) : null;
  if (hasEnd && !end) issues.push("invalid-end-date");

  const dateList = datesBetween(start.date, end?.date ?? start.date);
  if (!dateList.length) return empty(["missing-dates"]);
  if (dateList.length > 1) issues.push("multi-day-hours-not-itemized");

  const days: SaleDay[] = [];
  if (dateList.length === 1 && end && isClock(start.time) && isClock(end.time) && end.time > start.time) {
    days.push({ date: dateList[0], start: start.time, end: end.time, discountPct: 0 });
  } else if (dateList.length === 1) {
    issues.push("missing-or-invalid-end");
  } else if (dateList.length > 1 && end && isClock(start.time) && isClock(end.time)) {
    // Admin preview only: repeat structured window endpoints. Never treated as publishable.
    for (const date of dateList) days.push({ date, start: start.time, end: end.time > start.time ? end.time : start.time, discountPct: 0 });
    if (end.time <= start.time) issues.push("missing-or-invalid-end");
  }

  const title = String(ev.name ?? "").trim() || "Imported sale";
  const city = String(addr.addressLocality ?? "").trim();
  const region = String(addr.addressRegion ?? "").trim();
  const street = String(addr.streetAddress ?? "").trim();
  const zip = String(addr.postalCode ?? "").trim();
  const desc = String(ev.description ?? "");
  const lat = Number(geo.latitude);
  const lng = Number(geo.longitude);
  const type = /auction/i.test(desc) || /auction/i.test(title) ? "auction" : /moving|yard/i.test(desc) ? "yard" : "estate";

  if (!city) issues.push("missing-city");
  if (region && !/^fl/i.test(region)) issues.push("outside-florida-region");
  if (Number.isFinite(lat) && lat !== 0 && (lat < 24 || lat > 31.5)) issues.push("lat-outside-florida");
  if (Number.isFinite(lng) && lng !== 0 && (lng < -88 || lng > -79.5)) issues.push("lng-outside-florida");
  if (!Number.isFinite(lat) || !lat || !Number.isFinite(lng) || !lng) issues.push("missing-coordinates");
  if (!street) issues.push("address-withheld-or-missing");

  const descLc = desc.toLowerCase();
  if (/mountain|mst\b|mdt\b|us\/mountain/.test(descLc)) issues.push("non-et-timezone-label");
  if (end && minutes(end.time) < 5 * 60 && minutes(start.time) >= 6 * 60) issues.push("implausible-end-hour");
  if (end && dateList.length === 1 && minutes(end.time) - minutes(start.time) > 14 * 60) issues.push("implausible-duration");

  const structuredTimes = end ? [start.time, end.time] : [start.time];
  const prose = proseClockTimes(desc);
  const unmatched = prose.filter((t) => !structuredTimes.some((s) => Math.abs(minutes(s) - minutes(t)) <= 20));
  if (unmatched.length) issues.push("structured-vs-prose-time-conflict");

  if (externalId && HOLD_EXTERNAL_IDS.has(externalId)) issues.push("manual-hold");

  const sale: Partial<Sale> = {
    slug: slugify(`${title}-${city}-${start.date.slice(0, 7)}${externalId ? `-${externalId}` : ""}`),
    title, type, city, zip,
    lat: Number.isFinite(lat) ? lat : 0,
    lng: Number.isFinite(lng) ? lng : 0,
    sourceUrl: canonical,
    paymentMethods: [],
    days,
    ...(desc.trim() ? { description: desc.trim().slice(0, 2000) } : {}),
    published: false,
  };

  const digest = createHash("sha256").update(JSON.stringify({
    v: PARSER_VERSION, title, type, city, zip, street, lat: sale.lat, lng: sale.lng,
    days, desc: desc.trim().slice(0, 400), url: canonical, externalId,
  })).digest("hex");

  const publishable = !!sale.title && !!city && days.length === 1
    && days.every((d) => isClock(d.start) && isClock(d.end) && d.end > d.start)
    && issues.every((i) => !BLOCKING.has(i));

  return { sale, issues, publishable, externalId, source, canonicalUrl: canonical, digest, parserVersion: PARSER_VERSION };
}
