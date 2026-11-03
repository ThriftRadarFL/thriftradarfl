// Homepage summary: hero stats, today's top store deals and the weekend count. Pure → unit-tested.
import type { Sale, Venue } from "./data";
import type { DealRule } from "./deal-rules";
import { upcomingSales, weekendDates, dowOf } from "./cities";
export type HomeDeal = DealRule & { storeName: string; storeCity: string };
export type HomeSummary = { upcoming: number; cities: number; stores: number; openToday: number; weekendSales: number; todayDeals: HomeDeal[]; todayDealCount: number; halfOffToday: number };
export function homeSummary(sales: Sale[], venues: Venue[], rules: DealRule[], today: string, maxDeals = 4): HomeSummary {
  const up = upcomingSales(sales, today); const wk = new Set(weekendDates(today)); const dow = dowOf(today);
  const vmap = new Map(venues.map((v) => [v.slug, v]));
  const deals = rules.filter((r) => r.day === dow && vmap.has(r.venue)).map((r) => ({ ...r, storeName: vmap.get(r.venue)!.name, storeCity: vmap.get(r.venue)!.city }))
    .sort((a, b) => (b.discountPct ?? 0) - (a.discountPct ?? 0) || Number(b.verified) - Number(a.verified) || a.storeName.localeCompare(b.storeName));
  return {
    upcoming: up.length, cities: new Set(up.map((s) => s.city)).size, stores: venues.length,
    openToday: up.filter((s) => s.days.some((d) => d.date === today)).length,
    weekendSales: up.filter((s) => s.days.some((d) => wk.has(d.date))).length,
    todayDeals: deals.slice(0, maxDeals), todayDealCount: deals.length, halfOffToday: deals.filter((d) => (d.discountPct ?? 0) >= 50).length,
  };
}
/** Sanitize a hero ZIP box value: 5 digits or empty. */
export const cleanZip = (z: string | undefined | null) => (z ?? "").replace(/\D/g, "").slice(0, 5);
