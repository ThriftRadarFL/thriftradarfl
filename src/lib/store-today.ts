import { DAYS, type DealRule } from "./deal-rules";
import { hours12 } from "./time";

/** Weekday (0=Sun) of a YYYY-MM-DD date, independent of the server's timezone. */
export const dowOf = (iso: string) => new Date(iso + "T12:00:00Z").getUTCDay();
export const addDaysIso = (iso: string, n: number) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

const KEY: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
/** True if an hours key ("daily", "mon", "tue-sat", "fri-mon", "mon,wed") covers weekday `dow`. */
export function keyCovers(key: string, dow: number): boolean {
  const k = key.trim().toLowerCase(); if (k === "daily" || k === "everyday" || k === "all") return true;
  return k.split(/[,/]/).some((part) => {
    const [a, b] = part.split(/[-–]/).map((x) => KEY[x.trim().slice(0, 3)]);
    if (a === undefined) return false; if (b === undefined) return a === dow;
    return a <= b ? dow >= a && dow <= b : dow >= a || dow <= b; // wraps (fri-mon)
  });
}
/** Today's hours from a store's hoursJson, most specific key wins (single day > range > daily). "Closed" if listed hours skip today; null = unknown. */
export function hoursOn(hours: Record<string, string> | null | undefined, dow: number): string | null {
  if (!hours) return null;
  const hits = Object.entries(hours).filter(([k, h]) => h && keyCovers(k, dow));
  if (!hits.length) return Object.values(hours).some(Boolean) ? "Closed" : null; // hours listed but none cover today
  const rank = (k: string) => (/^[a-z]{3}$/i.test(k.trim()) ? 0 : /daily|everyday|all/i.test(k) ? 2 : 1);
  hits.sort((x, y) => rank(x[0]) - rank(y[0])); return hours12(hits[0][1]);
}

export type StoreToday = { date: string; dow: number; dayName: string; hours: string | null; today: DealRule[]; next: { rule: DealRule; date: string; inDays: number } | null };
/** "What's on today" for one store: deal rules that apply today (ET date passed in), today's hours, and the next upcoming deal. */
export function storeToday(venue: string, rules: DealRule[], todayIso: string, hours?: Record<string, string> | null): StoreToday {
  const dow = dowOf(todayIso); const mine = rules.filter((r) => r.venue === venue);
  const today = mine.filter((r) => r.day === dow).sort((a, b) => (b.discountPct ?? 0) - (a.discountPct ?? 0));
  let next: StoreToday["next"] = null;
  for (let i = 1; i <= 7 && !next; i++) { const r = mine.filter((x) => x.day === (dow + i) % 7).sort((a, b) => (b.discountPct ?? 0) - (a.discountPct ?? 0))[0]; if (r) next = { rule: r, date: addDaysIso(todayIso, i), inDays: i }; }
  return { date: todayIso, dow, dayName: DAYS[dow], hours: hoursOn(hours, dow), today, next };
}
export const whenLabel = (inDays: number, dow: number) => (inDays === 1 ? "Tomorrow" : DAYS[dow]);
