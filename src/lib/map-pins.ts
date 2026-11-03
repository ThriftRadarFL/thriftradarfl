import type { Sale, Venue } from "./data";
export type MapPin = { key: string; href: string; name: string; type: string; city: string; lat: number; lng: number; dates: string[]; kind: "store" | "sale" };
/** Pins link by slug (the routes look up by slug), built from the live data at request time. */
export function buildPins(venues: Venue[], sales: Sale[]): MapPin[] {
  return [...venues.map((v) => ({ key: `store:${v.slug}`, href: `/stores/${encodeURIComponent(v.slug)}`, name: v.name, type: v.type, city: v.city, lat: v.lat, lng: v.lng, dates: [], kind: "store" as const })),
    ...sales.map((s) => ({ key: `sale:${s.slug}`, href: `/sales/${encodeURIComponent(s.slug)}`, name: s.title, type: s.type, city: s.city, lat: s.lat, lng: s.lng, dates: s.days.map((d) => d.date), kind: "sale" as const }))].filter((p) => p.lat && p.lng);
}
