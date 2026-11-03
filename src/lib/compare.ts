// "Compare stores" side-by-side: up to 4 stores, each with today's status, best day, and a Mon–Sun deal grid. Pure (tested).
import type { DealRule } from "./deal-rules";
import { storeToday, hoursOn, type StoreToday } from "./store-today";
import { bestDay, ruleValue, type BestDay } from "./best-day";
import { milesBetween } from "./geo";

export const MAX_COMPARE = 4;
type V = { slug: string; name: string; city: string; type: string; lat: number; lng: number; hoursJson: Record<string, string> | null };
/** ?s=a,b,c (or repeated ?s=a&s=b) → known, deduped slugs, capped at MAX_COMPARE. Unknown slugs are reported, not thrown. */
export function parseCompare(raw: string | string[] | undefined, known: Set<string>): { slugs: string[]; unknown: string[] } {
  const parts = (Array.isArray(raw) ? raw : [raw ?? ""]).flatMap((x) => x.split(",")).map((x) => x.trim().toLowerCase()).filter((x) => /^[a-z0-9-]{1,80}$/.test(x));
  const uniq = [...new Set(parts)]; const slugs = uniq.filter((s) => known.has(s)).slice(0, MAX_COMPARE);
  return { slugs, unknown: uniq.filter((s) => !known.has(s)) };
}
export type CompareCol = { v: V; today: StoreToday; best: BestDay | null; week: { day: number; hours: string | null; rules: DealRule[]; top: number }[]; weeklyValue: number; verified: number; total: number };
export function compareStores<T extends V>(slugs: string[], venues: T[], rules: DealRule[], todayIso: string) {
  const cols: (CompareCol & { v: T })[] = slugs.map((s) => venues.find((v) => v.slug === s)).filter((v): v is T => !!v).map((v) => {
    const mine = rules.filter((r) => r.venue === v.slug);
    const week = [1, 2, 3, 4, 5, 6, 0].map((day) => { const rs = mine.filter((r) => r.day === day).sort((a, b) => ruleValue(b) - ruleValue(a)); return { day, hours: hoursOn(v.hoursJson, day), rules: rs, top: rs[0] ? ruleValue(rs[0]) : 0 }; });
    return { v, today: storeToday(v.slug, rules, todayIso, v.hoursJson), best: bestDay(v.slug, rules, v.hoursJson), week, weeklyValue: week.reduce((n, d) => n + (d.hours === "Closed" ? 0 : d.top), 0), verified: mine.filter((r) => r.verified).length, total: mine.length };
  });
  // Winner per weekday = store with the most valuable open deal that day (ties → none, so we don't fake a pick).
  const winners = [1, 2, 3, 4, 5, 6, 0].map((_, i) => { const scored = cols.map((c, ci) => ({ ci, s: c.week[i].hours === "Closed" ? 0 : c.week[i].top })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s);
    return scored.length && (scored.length === 1 || scored[0].s > scored[1].s) ? scored[0].ci : -1; });
  const miles = cols.length === 2 ? milesBetween(cols[0].v, cols[1].v) : null;
  return { cols, winners, miles };
}
