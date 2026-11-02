// "This weekend near me": Fri–Sun sales + store deal days filtered to a radius around a ZIP or a lat/lng.
import type { Sale, SaleDay, Venue } from "./data";
import type { DealRule } from "./deal-rules";
import { weekendDates, dowOf, upcomingSales } from "./cities";
import { milesBetween, type LatLng } from "./geo";
import { zipPoint, DEFAULT_ZIP } from "./zips";
export const RADII = [10, 25, 50] as const; // plus 0 = any distance
export const DEFAULT_RADIUS = 25;
export type Origin = LatLng & { label: string; zip?: string };
type Q = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
/** Parse ?zip=&r=&lat=&lng= (lat/lng from "use my location" win over zip). Unknown ZIP → error + Port Orange default. */
export function parseNearQuery(q: Q): { origin: Origin; radius: number; zip: string; error?: string } {
  const rs = one(q.r), r = Number(rs); const radius = rs === "any" || (rs !== "" && r === 0) ? 0 : (RADII as readonly number[]).includes(r) ? r : DEFAULT_RADIUS;
  const lat = Number(one(q.lat)), lng = Number(one(q.lng));
  if (one(q.lat) && one(q.lng) && lat > 24 && lat < 31.5 && lng > -88 && lng < -79.5) return { origin: { lat, lng, label: "your location" }, radius, zip: "" };
  const raw = one(q.zip) || DEFAULT_ZIP; const p = zipPoint(raw);
  if (p) { const zip = raw.slice(0, 5); return { origin: { ...p, label: `ZIP ${zip}`, zip }, radius, zip }; }
  return { origin: { ...zipPoint(DEFAULT_ZIP)!, label: `ZIP ${DEFAULT_ZIP}`, zip: DEFAULT_ZIP }, radius, zip: DEFAULT_ZIP,
    error: `We don't have “${raw.slice(0, 10)}” on file — Central Florida ZIPs only. Showing ${DEFAULT_ZIP} (Port Orange).` };
}
/** Best-known point: exact coords, else ZIP centroid, else null. */
export const pointOf = (x: { lat?: number | null; lng?: number | null; zip?: string | null }): LatLng | null => (x.lat && x.lng ? { lat: x.lat, lng: x.lng } : zipPoint(x.zip));
const round = (m: number) => Math.round(m * 10) / 10;
export type NearSale = { sale: Sale; day: SaleDay; miles: number | null };
export type NearDeal = DealRule & { store: string; storeCity: string; miles: number | null };
export function weekendNear(sales: Sale[], venues: Venue[], rules: DealRule[], today: string, origin: LatLng, radius: number) {
  const dist = (p: LatLng | null) => (p ? round(milesBetween(origin, p)) : null);
  const inside = (m: number | null) => !radius || (m !== null && m <= radius);
  const byMiles = (a: { miles: number | null }, b: { miles: number | null }) => (a.miles ?? 1e9) - (b.miles ?? 1e9);
  const vm = new Map(venues.map((v) => [v.slug, { v, miles: dist(pointOf(v)) }]));
  const upcoming = upcomingSales(sales, today); let hiddenSales = 0, hiddenDeals = 0; let nearestOutside: number | null = null;
  const note = (m: number | null) => { if (m !== null && (nearestOutside === null || m < nearestOutside)) nearestOutside = m; };
  const days = weekendDates(today).map((date) => {
    const all = upcoming.flatMap((s) => { const day = s.days.find((d) => d.date === date); return day ? [{ sale: s, day, miles: dist(pointOf(s)) }] : []; });
    const deals = rules.filter((r) => r.day === dowOf(date) && vm.has(r.venue)).map((r) => { const { v, miles } = vm.get(r.venue)!; return { ...r, store: v.name, storeCity: v.city, miles }; });
    const s = all.filter((x) => inside(x.miles)).sort(byMiles); const d = deals.filter((x) => inside(x.miles)).sort(byMiles);
    hiddenSales += all.length - s.length; hiddenDeals += deals.length - d.length;
    all.filter((x) => !inside(x.miles)).forEach((x) => note(x.miles)); deals.filter((x) => !inside(x.miles)).forEach((x) => note(x.miles));
    return { date, sales: s as NearSale[], deals: d as NearDeal[] };
  });
  /** Smallest offered radius that would include the nearest hidden item (0 = any). */
  const widenTo = nearestOutside === null ? null : (RADII.find((r) => r > radius && r >= nearestOutside!) ?? 0);
  return { days, hiddenSales, hiddenDeals, nearestOutside: nearestOutside as number | null, widenTo, total: days.reduce((n, d) => n + d.sales.length + d.deals.length, 0) };
}
