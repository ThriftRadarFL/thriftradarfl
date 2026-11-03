// Data-quality checks over sales, stores and deal rules (duplicates, missing/far-off coords, bad URLs, orphans).
// Pure → used by `npm run data:check`, the admin "Data quality" panel and tests.
import type { Sale, Venue } from "./data";
import type { DealRule } from "./deal-rules";
import { zipPoint } from "./zips";
import { milesBetween } from "./geo";
export type Level = "error" | "warn";
export type Issue = { level: Level; code: string; target: string; msg: string };
// Generous Central/Northeast Florida box: anything outside is almost certainly a typo or swapped lat/lng.
export const BOX = { latMin: 27.0, latMax: 30.6, lngMin: -82.9, lngMax: -80.0 };
const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
const normAddr = (s: string) => norm(s).replace(/\b(boulevard|blvd)\b/g, "blvd").replace(/\b(drive|dr)\b/g, "dr").replace(/\b(avenue|ave)\b/g, "ave").replace(/\b(road|rd)\b/g, "rd").replace(/\b(street|st)\b/g, "st").replace(/\b(east|e)\b/g, "e").replace(/\b(west|w)\b/g, "w").replace(/\b(north|n)\b/g, "n").replace(/\b(south|s)\b/g, "s");
export function urlProblem(u: string | undefined | null): string | null {
  if (!u) return null; let p: URL; try { p = new URL(u); } catch { return "not a valid URL"; }
  if (p.protocol !== "https:" && p.protocol !== "http:") return `unsupported scheme ${p.protocol}`;
  if (/^(localhost|127\.|10\.|192\.168\.|0\.)/.test(p.hostname) || !p.hostname.includes(".")) return "points at a local/private host";
  if (p.protocol === "http:") return "uses http (prefer https)";
  return null;
}
/** Looks like one specific listing (numeric id segment or id= param), not a city/directory page. */
export const isListingUrl = (u: string | undefined | null) => !!u && (/\/\d{4,}(?:[/?#]|$)/.test(u) || /[?&](id|listing|lot)=/i.test(u));
/** US phone: 10 digits (or 1 + 10), vanity letters allowed, "ext 117" ignored. */
export function phoneOk(p: string) { const d = p.replace(/\s*(ext|x)\.?\s*\d+$/i, "").toUpperCase().replace(/[A-Z]/g, (c) => String("22233344455566677778889999"[c.charCodeAt(0) - 65])).replace(/\D/g, ""); return d.length === 10 || (d.length === 11 && d[0] === "1"); }
const hasCoords = (x: { lat?: number | null; lng?: number | null }) => !!x.lat && !!x.lng;
const inBox = (lat: number, lng: number) => lat >= BOX.latMin && lat <= BOX.latMax && lng >= BOX.lngMin && lng <= BOX.lngMax;
function dupes<T>(items: T[], key: (t: T) => string) { const m = new Map<string, T[]>(); for (const i of items) { const k = key(i); if (!k) continue; m.set(k, [...(m.get(k) ?? []), i]); } return [...m.values()].filter((g) => g.length > 1); }
function coordIssues(kind: string, slug: string, x: { lat?: number | null; lng?: number | null; zip?: string | null }, out: Issue[], farMiles = 20) {
  if (!hasCoords(x)) { out.push({ level: "warn", code: `${kind}.no-coords`, target: slug, msg: `no coordinates — not on the map${zipPoint(x.zip) ? " (near-you falls back to its ZIP centroid)" : ""}` }); return; }
  if (!inBox(x.lat!, x.lng!)) { out.push({ level: "error", code: `${kind}.coords-outside`, target: slug, msg: `coordinates ${x.lat}, ${x.lng} are outside Central Florida${inBox(x.lng!, x.lat!) ? " (lat/lng swapped?)" : ""}` }); return; }
  const z = zipPoint(x.zip); if (z) { const mi = milesBetween(z, { lat: x.lat!, lng: x.lng! }); if (mi > farMiles) out.push({ level: "warn", code: `${kind}.coords-far-from-zip`, target: slug, msg: `pin is ${Math.round(mi)} mi from ZIP ${x.zip}'s center` }); }
}
export function checkData(sales: Sale[], venues: Venue[], rules: DealRule[]): Issue[] {
  const out: Issue[] = [];
  // Stores
  for (const g of dupes(venues, (v) => v.slug)) out.push({ level: "error", code: "store.dup-slug", target: g[0].slug, msg: `${g.length} stores share this slug` });
  for (const g of dupes(venues, (v) => norm(v.name))) out.push({ level: "warn", code: "store.dup-name", target: g.map((v) => v.slug).join(", "), msg: `same name “${g[0].name}”` });
  for (const g of dupes(venues, (v) => (v.address ? `${normAddr(v.address)}|${v.zip}` : ""))) out.push({ level: "warn", code: "store.dup-address", target: g.map((v) => v.slug).join(", "), msg: `same address ${g[0].address}, ${g[0].zip}` });
  for (const v of venues) {
    coordIssues("store", v.slug, v, out);
    if (!/^\d{5}$/.test(v.zip ?? "")) out.push({ level: "error", code: "store.bad-zip", target: v.slug, msg: `ZIP “${v.zip}” is not 5 digits` });
    else if (!zipPoint(v.zip)) out.push({ level: "warn", code: "store.zip-unknown", target: v.slug, msg: `ZIP ${v.zip} isn't in the Central FL ZIP table` });
    const u = urlProblem(v.sourceUrl); if (u) out.push({ level: u.startsWith("uses http") ? "warn" : "error", code: "store.bad-url", target: v.slug, msg: `source URL ${u}` });
    if (!v.sourceUrl) out.push({ level: "warn", code: "store.no-source", target: v.slug, msg: "no source URL for hours/address" });
    if (!v.hoursJson || !Object.keys(v.hoursJson).length) out.push({ level: "warn", code: "store.no-hours", target: v.slug, msg: "no opening hours" });
    if (v.phone && !phoneOk(v.phone)) out.push({ level: "warn", code: "store.bad-phone", target: v.slug, msg: `phone “${v.phone}” isn't 10 digits` });
  }
  // Sales
  for (const g of dupes(sales, (s) => s.slug)) out.push({ level: "error", code: "sale.dup-slug", target: g[0].slug, msg: `${g.length} sales share this slug` });
  for (const g of dupes(sales, (s) => `${norm(s.title)}|${s.days[0]?.date ?? ""}`)) out.push({ level: "warn", code: "sale.dup-title", target: g.map((s) => s.slug).join(", "), msg: `same title and first day “${g[0].title}”` });
  for (const g of dupes(sales, (s) => (isListingUrl(s.sourceUrl) ? s.sourceUrl.replace(/[?#].*$/, "").replace(/\/$/, "") : ""))) out.push({ level: "warn", code: "sale.dup-source", target: g.map((s) => s.slug).join(", "), msg: "same source listing URL (imported twice?)" });
  for (const s of sales) {
    coordIssues("sale", s.slug, s, out);
    if (!s.days.length) out.push({ level: "error", code: "sale.no-days", target: s.slug, msg: "no sale days" });
    for (const d of s.days) if (d.end && d.start && d.end <= d.start) out.push({ level: "error", code: "sale.bad-hours", target: s.slug, msg: `${d.date}: ends (${d.end}) before it starts (${d.start})` });
    const sorted = s.days.map((d) => d.date); if (sorted.some((d, i) => i && d <= sorted[i - 1])) out.push({ level: "warn", code: "sale.days-order", target: s.slug, msg: "days are out of order or repeated" });
    const u = urlProblem(s.sourceUrl); if (u) out.push({ level: u.startsWith("uses http") ? "warn" : "error", code: "sale.bad-url", target: s.slug, msg: `source URL ${u}` });
    if (s.sourceUrl && !u && !isListingUrl(s.sourceUrl)) out.push({ level: "warn", code: "sale.generic-source", target: s.slug, msg: "source URL is a directory/city page, not the specific listing" });
    if (!/^\d{5}$/.test(s.zip ?? "")) out.push({ level: "error", code: "sale.bad-zip", target: s.slug, msg: `ZIP “${s.zip}” is not 5 digits` });
  }
  // Deal rules
  const vs = new Set(venues.map((v) => v.slug));
  for (const r of rules) {
    if (!vs.has(r.venue)) out.push({ level: "error", code: "rule.orphan", target: r.id ?? r.label, msg: `deal rule points at missing store “${r.venue}”` });
    if (!(r.day >= 0 && r.day <= 6)) out.push({ level: "error", code: "rule.bad-day", target: r.id ?? r.label, msg: `day ${r.day} is not 0–6` });
    if (r.discountPct != null && (r.discountPct < 0 || r.discountPct > 100)) out.push({ level: "error", code: "rule.bad-pct", target: r.id ?? r.label, msg: `discount ${r.discountPct}% out of range` });
  }
  for (const g of dupes(rules, (r) => `${r.venue}|${r.day}|${norm(r.label)}`)) out.push({ level: "warn", code: "rule.dup", target: g.map((r) => r.id).join(", "), msg: `duplicate “${g[0].label}” on the same day` });
  return out.sort((a, b) => (a.level === b.level ? a.code.localeCompare(b.code) || a.target.localeCompare(b.target) : a.level === "error" ? -1 : 1));
}
export const summarize = (issues: Issue[]) => ({ errors: issues.filter((i) => i.level === "error").length, warnings: issues.filter((i) => i.level === "warn").length });
