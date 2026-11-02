import type { Sale, SaleDay, Venue } from "./data";
export const SALE_TYPES = ["estate", "auction", "thrift", "outlet_bins", "yard"] as const;
export const VENUE_TYPES = ["thrift", "outlet_bins", "auction_house", "estate_company"] as const;
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
type R<T> = { ok: true; value: T } | { ok: false; errors: string[] };
const num = (v: unknown, d = 0) => (v === "" || v == null || isNaN(Number(v)) ? d : Number(v));
export function parseSale(o: Record<string, unknown>): R<Sale> {
  const e: string[] = []; const title = String(o.title ?? "").trim(); if (!title) e.push("title required");
  const type = String(o.type ?? "estate"); if (!SALE_TYPES.includes(type as never)) e.push("invalid type");
  const city = String(o.city ?? "").trim(); if (!city) e.push("city required");
  let days: SaleDay[] = [];
  if (Array.isArray(o.days)) days = o.days as SaleDay[];
  else if (typeof o.days === "string") days = o.days.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const [date, start, end, pct] = l.split(/[\s,]+/); return { date, start, end, discountPct: num(pct) }; });
  days.forEach((d, i) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(d.date) || !/^\d{2}:\d{2}$/.test(d.start) || !/^\d{2}:\d{2}$/.test(d.end)) e.push(`day ${i + 1} must be "YYYY-MM-DD HH:MM HH:MM [pct]"`); });
  if (!days.length) e.push("at least one day required");
  const sourceUrl = String(o.sourceUrl ?? ""); if (sourceUrl && !/^https?:\/\//.test(sourceUrl)) e.push("sourceUrl must be http(s)");
  if (e.length) return { ok: false, errors: e };
  const pm = Array.isArray(o.paymentMethods) ? (o.paymentMethods as string[]) : String(o.paymentMethods ?? "cash").split(",").map((x) => x.trim()).filter(Boolean);
  return { ok: true, value: { slug: String(o.slug || "") || slugify(`${title}-${days[0].date.slice(0, 7)}`), title, type, city, zip: String(o.zip ?? ""), lat: num(o.lat), lng: num(o.lng), sourceUrl, paymentMethods: pm, days } };
}
export function parseVenue(o: Record<string, unknown>): R<Venue> {
  const e: string[] = []; const name = String(o.name ?? "").trim(); if (!name) e.push("name required");
  const city = String(o.city ?? "").trim(); if (!city) e.push("city required");
  const type = String(o.type ?? "thrift"); if (!VENUE_TYPES.includes(type as never)) e.push("invalid type");
  if (e.length) return { ok: false, errors: e };
  return { ok: true, value: { slug: String(o.slug || "") || slugify(name), org: String(o.org ?? ""), name, type, address: String(o.address ?? ""), city, zip: String(o.zip ?? ""), lat: num(o.lat), lng: num(o.lng), phone: o.phone ? String(o.phone) : null, hoursJson: o.hours ? { daily: String(o.hours) } : null, notes: String(o.notes ?? "") } };
}
