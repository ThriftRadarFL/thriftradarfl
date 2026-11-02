import { DEAL_KINDS, KIND_COLOR, ruleId, type DealKind, type DealRule } from "./deal-rules";
import type { Sale, SaleDay, Venue } from "./data";
export const SALE_TYPES = ["estate", "auction", "thrift", "outlet_bins", "yard"] as const;
export const VENUE_TYPES = ["thrift", "outlet_bins", "auction_house", "estate_company"] as const;
export const isEmail = (e: string) => e.length <= 254 && /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(e);
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
  days.forEach((d, i) => { if (d.end <= d.start) e.push(`day ${i + 1}: end must be after start`); if (d.discountPct < 0 || d.discountPct > 100) e.push(`day ${i + 1}: discount 0-100`); });
  if (!days.length) e.push("at least one day required");
  if (title.length > 160) e.push("title too long");
  const lat = num(o.lat), lng = num(o.lng); if (lat && (lat < 24 || lat > 31.5)) e.push("lat outside Florida"); if (lng && (lng < -88 || lng > -79.5)) e.push("lng outside Florida");
  if (o.slug && !/^[a-z0-9-]+$/.test(String(o.slug))) e.push("slug must be lowercase letters, digits, dashes");
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
export function parseDealRule(o: Record<string, unknown>): R<DealRule> {
  const e: string[] = []; const venue = String(o.venue ?? "").trim(); if (!/^[a-z0-9-]+$/.test(venue)) e.push("venue required");
  const day = Number(o.day); if (!Number.isInteger(day) || day < 0 || day > 6) e.push("day must be 0-6");
  const kind = String(o.kind ?? "") as DealKind; if (!DEAL_KINDS.includes(kind)) e.push("invalid kind");
  const label = String(o.label ?? "").trim(); if (!label) e.push("label required"); if (label.length > 80) e.push("label too long");
  const time = String(o.time ?? "").trim(); if (time && !/^\d{2}:\d{2}$/.test(time)) e.push("time must be HH:MM");
  const pct = o.discountPct === "" || o.discountPct == null ? undefined : Number(o.discountPct);
  if (pct !== undefined && (isNaN(pct) || pct < 0 || pct > 100)) e.push("discount 0-100");
  if (e.length) return { ok: false, errors: e };
  const r: DealRule = { venue, day, kind, label, color: KIND_COLOR[kind], verified: o.verified === true || o.verified === "on" || o.verified === "true", ...(time ? { time } : {}), ...(pct ? { discountPct: pct } : {}) };
  return { ok: true, value: { ...r, id: String(o.id || "") || ruleId(r) } };
}
export function parseContact(o: Record<string, unknown>): R<{ name: string; email: string; message: string }> {
  const name = String(o.name ?? "").trim().slice(0, 100), email = String(o.email ?? "").trim(), message = String(o.message ?? "").trim();
  const e: string[] = []; if (!name) e.push("name required"); if (!isEmail(email)) e.push("valid email required");
  if (message.length < 10) e.push("message must be at least 10 characters"); if (message.length > 4000) e.push("message too long");
  return e.length ? { ok: false, errors: e } : { ok: true, value: { name, email, message } };
}
