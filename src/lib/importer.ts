// Manual, admin-triggered import of ONE public listing URL via its schema.org JSON-LD (Event/SaleEvent).
// Policy: no crawling, no image rehosting, always keep sourceUrl + link back. See BACKEND.md.
import type { Sale } from "./data";
import { slugify } from "./validate";
type LD = Record<string, unknown>;
const ALLOWED = [/(^|\.)estatesales\.net$/, /(^|\.)estatesales\.org$/, /(^|\.)auctionzip\.com$/, /(^|\.)hibid\.com$/];
export const isAllowedImportHost = (u: string) => { try { const h = new URL(u).hostname; return ALLOWED.some((r) => r.test(h)); } catch { return false; } };
const et = (iso: string) => {
  const d = new Date(iso); const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(d).map((x) => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, time: `${p.hour}:${p.minute}` };
};
export function extractJsonLd(html: string): LD[] {
  const out: LD[] = [];
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { const v = JSON.parse(m[1]); for (const x of Array.isArray(v) ? v : v["@graph"] ?? [v]) out.push(x); } catch { /* skip bad block */ }
  }
  return out;
}
export function saleFromHtml(html: string, sourceUrl: string): Partial<Sale> | null {
  const ev = extractJsonLd(html).find((x) => /Event$/.test(String(x["@type"] ?? "")));
  if (!ev || !ev.startDate) return null;
  const loc = (ev.location ?? {}) as LD; const addr = (loc.address ?? {}) as LD; const geo = (loc.geo ?? {}) as LD;
  const s = et(String(ev.startDate)); const e = et(String(ev.endDate ?? ev.startDate));
  const days: Sale["days"] = []; const cur = new Date(s.date + "T12:00:00Z"); const last = new Date(e.date + "T12:00:00Z");
  for (let i = 0; cur <= last && i < 14; i++, cur.setUTCDate(cur.getUTCDate() + 1)) days.push({ date: cur.toISOString().slice(0, 10), start: s.time, end: e.time > s.time ? e.time : "17:00", discountPct: 0 });
  const title = String(ev.name ?? "Imported sale").trim(); const city = String(addr.addressLocality ?? "").trim();
  const desc = String(ev.description ?? "").toLowerCase();
  return { slug: slugify(`${title}-${city}-${s.date.slice(0, 7)}`), title, type: desc.includes("auction") ? "auction" : desc.includes("moving") || desc.includes("yard") ? "yard" : "estate",
    city, zip: String(addr.postalCode ?? ""), lat: Number(geo.latitude) || 0, lng: Number(geo.longitude) || 0, sourceUrl, paymentMethods: ["cash"], days };
}
export async function importFromUrl(url: string) {
  if (!isAllowedImportHost(url)) throw new Error("host not on import allowlist");
  const r = await fetch(url, { headers: { "User-Agent": "ThriftRadarFL/0.1 (manual admin import; contact via site)" }, signal: AbortSignal.timeout(10_000) });
  if (!r.ok) throw new Error(`fetch failed: ${r.status}`);
  const sale = saleFromHtml(await r.text(), url); if (!sale) throw new Error("no schema.org Event found on page"); return sale;
}
