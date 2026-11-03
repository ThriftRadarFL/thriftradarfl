import type { Sale, Venue } from "./data";
import { range12, hours12, dayKey } from "./time";
const fmtDay = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
/** Short "when" line for a map popup: sale dates + first-day hours, or a store's hours. */
export function pinInfo(x: { kind: "sale"; s: Sale } | { kind: "store"; v: Venue }): string {
  if (x.kind === "sale") { const d = x.s.days; if (!d.length) return ""; const span = d.length > 1 ? `${fmtDay(d[0].date)} – ${fmtDay(d[d.length - 1].date)}` : fmtDay(d[0].date);
    return `${span} · ${range12(d[0].start, d[0].end)}`; }
  const h = x.v.hoursJson ? Object.entries(x.v.hoursJson).filter(([, v]) => v) : [];
  return h.length ? h.slice(0, 2).map(([k, v]) => `${dayKey(k)} ${hours12(v)}`).join(" · ") : `${x.v.city} · hours not verified`;
}
export type MapPin = { key: string; href: string; name: string; type: string; city: string; lat: number; lng: number; dates: string[]; kind: "store" | "sale"; info: string };
/** Pins link by slug (the routes look up by slug), built from the live data at request time. */
export function buildPins(venues: Venue[], sales: Sale[]): MapPin[] {
  return [...venues.map((v) => ({ key: `store:${v.slug}`, href: `/stores/${encodeURIComponent(v.slug)}`, name: v.name, type: v.type, city: v.city, lat: v.lat, lng: v.lng, dates: [], kind: "store" as const, info: pinInfo({ kind: "store", v }) })),
    ...sales.map((s) => ({ key: `sale:${s.slug}`, href: `/sales/${encodeURIComponent(s.slug)}`, name: s.title, type: s.type, city: s.city, lat: s.lat, lng: s.lng, dates: s.days.map((d) => d.date), kind: "sale" as const, info: pinInfo({ kind: "sale", s }) }))].filter((p) => p.lat && p.lng);
}
