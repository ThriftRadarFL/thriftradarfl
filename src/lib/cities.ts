// City index + per-city page data, derived from whatever sales/venues exist (no hardcoded city list needed).
import type { Sale, Venue } from "./data";
import type { DealRule } from "./deal-rules";
import { CITIES, citySlug } from "./data";
import { milesBetween } from "./geo";
export type CityInfo = { slug: string; name: string; sales: number; venues: number; lat: number; lng: number };
export const todayET = (d = new Date()) => d.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
const lastDay = (s: Sale) => s.days.at(-1)?.date ?? "";
export const upcomingSales = (sales: Sale[], today: string) => sales.filter((s) => lastDay(s) >= today).sort((a, b) => (a.days[0]?.date ?? "").localeCompare(b.days[0]?.date ?? ""));
export function cityList(sales: Sale[], venues: Venue[], today: string): CityInfo[] {
  const m = new Map<string, CityInfo & { pts: { lat: number; lng: number }[] }>();
  const get = (name: string) => { const slug = citySlug(name); let c = m.get(slug); if (!c) m.set(slug, (c = { slug, name, sales: 0, venues: 0, lat: 0, lng: 0, pts: [] })); return c; };
  Object.values(CITIES).forEach(get);
  for (const s of upcomingSales(sales, today)) { const c = get(s.city); c.sales++; if (s.lat && s.lng) c.pts.push(s); }
  for (const v of venues) { const c = get(v.city); c.venues++; if (v.lat && v.lng) c.pts.push(v); }
  return [...m.values()].map(({ pts, ...c }) => ({ ...c, lat: pts.length ? pts.reduce((a, p) => a + p.lat, 0) / pts.length : 0, lng: pts.length ? pts.reduce((a, p) => a + p.lng, 0) / pts.length : 0 }))
    .sort((a, b) => b.sales + b.venues - (a.sales + a.venues) || a.name.localeCompare(b.name));
}
export function nearbyCities(list: CityInfo[], slug: string, n = 4) {
  const me = list.find((c) => c.slug === slug); if (!me?.lat) return list.filter((c) => c.slug !== slug).slice(0, n).map((c) => ({ ...c, miles: null as number | null }));
  return list.filter((c) => c.slug !== slug && c.lat).map((c) => ({ ...c, miles: Math.round(milesBetween(me, c)) as number | null })).sort((a, b) => a.miles! - b.miles!).slice(0, n);
}
/** Fri–Sun of the current weekend (or the upcoming one), never in the past. Matches /weekend. */
export function weekendDates(today: string) {
  const t = new Date(today + "T12:00:00Z"); const dow = t.getUTCDay(); const offset = dow === 0 ? -2 : 5 - dow;
  return [0, 1, 2].map((i) => { const d = new Date(t); d.setUTCDate(d.getUTCDate() + offset + i); return d.toISOString().slice(0, 10); }).filter((d) => d >= today);
}
export const dowOf = (iso: string) => new Date(iso + "T12:00:00Z").getUTCDay();
export function cityData(name: string, sales: Sale[], venues: Venue[], rules: DealRule[], today: string) {
  const upcoming = upcomingSales(sales, today).filter((s) => s.city === name);
  const stores = venues.filter((v) => v.city === name).map((v) => ({ ...v, rules: rules.filter((r) => r.venue === v.slug).sort((a, b) => a.day - b.day) }));
  const storeName = new Map(stores.map((v) => [v.slug, v.name]));
  const weekend = weekendDates(today).map((date) => ({ date,
    sales: upcoming.filter((s) => s.days.some((d) => d.date === date)).map((s) => ({ sale: s, day: s.days.find((d) => d.date === date)! })),
    deals: rules.filter((r) => r.day === dowOf(date) && storeName.has(r.venue)).map((r) => ({ ...r, store: storeName.get(r.venue)! })) }));
  const bestPct = Math.max(0, ...upcoming.flatMap((s) => s.days.map((d) => d.discountPct)));
  return { upcoming, stores, weekend, bestPct };
}
