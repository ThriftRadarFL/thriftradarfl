import { cleanTags } from "./flip-tips";
import { DEAL_KINDS, KIND_COLOR, ruleId, type DealKind, type DealRule } from "./deal-rules";
import type { Sale, SaleDay, Venue } from "./data";
export const SALE_TYPES = ["estate", "auction", "thrift", "outlet_bins", "yard"] as const;
export const VENUE_TYPES = ["thrift", "outlet_bins", "auction_house", "estate_company"] as const;
/** Length caps for all user-supplied text (public forms + admin). */
export const CAPS = { title: 160, city: 60, zip: 10, slug: 120, url: 500, description: 2000, days: 14, payment: 8, paymentItem: 30, name: 100, email: 254, message: 4000, area: 60 } as const;
export const isEmail = (e: string) => e.length <= 254 && /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(e);
/** True only for absolute http(s) URLs that actually parse (rejects "https://", "javascript:", spaces). */
export const isHttpUrl = (u: string) => { if (u.length > CAPS.url || !/^https?:\/\//i.test(u)) return false; try { const x = new URL(u); return !!x.hostname && x.hostname.includes(".") && !/\s/.test(u); } catch { return false; } };
/** Real calendar date (rejects 2026-02-31). */
export const isRealDate = (d: string) => { if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return false; const t = new Date(d + "T12:00:00Z"); return !isNaN(t.getTime()) && t.toISOString().slice(0, 10) === d; };
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
  days.forEach((d, i) => { if (!isRealDate(String(d.date)) || !/^\d{2}:\d{2}$/.test(d.start) || !/^\d{2}:\d{2}$/.test(d.end)) e.push(`day ${i + 1} must be "YYYY-MM-DD HH:MM HH:MM [pct]"`); });
  days.forEach((d, i) => { if (d.end <= d.start) e.push(`day ${i + 1}: end must be after start`); if (d.discountPct < 0 || d.discountPct > 100) e.push(`day ${i + 1}: discount 0-100`); });
  if (!days.length) e.push("at least one day required");
  if (title.length > CAPS.title) e.push("title too long");
  if (city.length > CAPS.city) e.push("city too long");
  if (days.length > CAPS.days) e.push(`at most ${CAPS.days} days`);
  const zip = String(o.zip ?? "").trim(); if (zip && !/^\d{5}(-\d{4})?$/.test(zip)) e.push("zip must be 5 digits");
  if (String(o.slug ?? "").length > CAPS.slug) e.push("slug too long");
  if (String(o.sourceUrl ?? "").length > CAPS.url) e.push("sourceUrl too long");
  const lat = num(o.lat), lng = num(o.lng); if (lat && (lat < 24 || lat > 31.5)) e.push("lat outside Florida"); if (lng && (lng < -88 || lng > -79.5)) e.push("lng outside Florida");
  if (o.slug && !/^[a-z0-9-]+$/.test(String(o.slug))) e.push("slug must be lowercase letters, digits, dashes");
  const sourceUrl = String(o.sourceUrl ?? ""); if (sourceUrl && !isHttpUrl(sourceUrl)) e.push("sourceUrl must be a valid http(s) URL");
  if (e.length) return { ok: false, errors: e };
  const pm = Array.isArray(o.paymentMethods) ? (o.paymentMethods as string[]) : String(o.paymentMethods ?? "cash").split(",").map((x) => x.trim()).filter(Boolean);
  const pmClean = pm.map((x) => String(x).slice(0, CAPS.paymentItem)).slice(0, CAPS.payment);
  return { ok: true, value: { slug: String(o.slug || "") || slugify(`${title}-${days[0].date.slice(0, 7)}`), title, type, city, zip, lat: num(o.lat), lng: num(o.lng), sourceUrl, paymentMethods: pmClean, days, ...(typeof o.description === "string" && o.description.trim() ? { description: o.description.trim().slice(0, CAPS.description) } : {}), ...(o.tags != null && cleanTags(o.tags).length ? { tags: cleanTags(o.tags) } : {}) } };
}
// Structured hours ({"mon-sat":"9:00-18:00"}) from API/JSON callers; ignored unless small string→string map.
const hoursObj = (h: unknown): Record<string, string> | null => {
  if (!h || typeof h !== "object" || Array.isArray(h)) return null; const ent = Object.entries(h as Record<string, unknown>);
  if (!ent.length || ent.length > 10 || ent.some(([k, v]) => typeof v !== "string" || k.length > 20 || v.length > 60)) return null;
  return Object.fromEntries(ent) as Record<string, string>;
};
export function parseVenue(o: Record<string, unknown>): R<Venue> {
  const e: string[] = []; const name = String(o.name ?? "").trim(); if (!name) e.push("name required");
  const city = String(o.city ?? "").trim(); if (!city) e.push("city required");
  const type = String(o.type ?? "thrift"); if (!VENUE_TYPES.includes(type as never)) e.push("invalid type");
  if (name.length > CAPS.title) e.push("name too long"); if (city.length > CAPS.city) e.push("city too long");
  if (String(o.address ?? "").length > 200) e.push("address too long"); if (String(o.notes ?? "").length > CAPS.description) e.push("notes too long");
  if (String(o.phone ?? "").length > 30 || String(o.hours ?? "").length > 60 || String(o.org ?? "").length > 40) e.push("phone/hours/org too long");
  const zip = String(o.zip ?? "").trim(); if (zip && !/^\d{5}(-\d{4})?$/.test(zip)) e.push("zip must be 5 digits");
  if (o.slug && (!/^[a-z0-9-]+$/.test(String(o.slug)) || String(o.slug).length > CAPS.slug)) e.push("slug must be lowercase letters, digits, dashes");
  const lat = num(o.lat), lng = num(o.lng); if (lat && (lat < 24 || lat > 31.5)) e.push("lat outside Florida"); if (lng && (lng < -88 || lng > -79.5)) e.push("lng outside Florida");
  if (o.sourceUrl && !isHttpUrl(String(o.sourceUrl))) e.push("sourceUrl must be a valid http(s) URL");
  if (e.length) return { ok: false, errors: e };
  return { ok: true, value: { slug: String(o.slug || "") || slugify(name), org: String(o.org ?? ""), name, type, address: String(o.address ?? ""), city, zip: String(o.zip ?? "").trim(), lat: num(o.lat), lng: num(o.lng), phone: o.phone ? String(o.phone) : null, hoursJson: o.hours ? { daily: String(o.hours) } : hoursObj(o.hoursJson), notes: String(o.notes ?? ""), ...(o.sourceUrl && isHttpUrl(String(o.sourceUrl)) ? { sourceUrl: String(o.sourceUrl) } : {}) } };
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
  const name = String(o.name ?? "").trim().slice(0, CAPS.name), email = String(o.email ?? "").trim(), message = String(o.message ?? "").trim();
  const e: string[] = []; if (!name) e.push("name required"); if (!isEmail(email)) e.push("valid email required");
  if (message.length < 10) e.push("message must be at least 10 characters"); if (message.length > CAPS.message) e.push("message too long");
  return e.length ? { ok: false, errors: e } : { ok: true, value: { name, email, message } };
}
export function parseSubscriber(o: Record<string, unknown>): R<{ email: string; area: string }> {
  const email = String(o.email ?? "").trim(); const area = String(o.area ?? "").trim().replace(/[\u0000-\u001f]/g, "").slice(0, CAPS.area) || "All";
  return isEmail(email) ? { ok: true, value: { email, area } } : { ok: false, errors: ["invalid email"] };
}
