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
export function hoursOn(hours: Record<string, string> | null | undefined, dow: number): string | null { const r = rawHoursOn(hours, dow); return r && r !== "Closed" ? hours12(r) : r; }
/** Like hoursOn but unformatted ("9:00-21:00" | "Closed" | null). */
export function rawHoursOn(hours: Record<string, string> | null | undefined, dow: number): string | null {
  if (!hours) return null;
  const hits = Object.entries(hours).filter(([k, h]) => h && keyCovers(k, dow));
  if (!hits.length) return Object.values(hours).some(Boolean) ? "Closed" : null; // hours listed but none cover today
  const rank = (k: string) => (/^[a-z]{3}$/i.test(k.trim()) ? 0 : /daily|everyday|all/i.test(k) ? 2 : 1);
  hits.sort((x, y) => rank(x[0]) - rank(y[0])); const h = hits[0][1]; return /^closed$/i.test(h.trim()) ? "Closed" : h;
}

export type StoreToday = { date: string; dow: number; dayName: string; hours: string | null; /** "open" | "closed" right now in America/New_York; null when hours are unknown/unparseable. */ openNow: "open" | "closed" | null; today: DealRule[]; next: { rule: DealRule; date: string; inDays: number } | null };
/** "What's on today" for one store: deal rules that apply today (ET date passed in), today's hours, and the next upcoming deal. */
/** Current minutes past midnight in America/New_York. */
export function nowMinutesET(now = new Date()): number {
  const [h, m] = new Intl.DateTimeFormat("en-GB", { timeZone: "America/New_York", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(now).split(":").map(Number); return h * 60 + m;
}
/** Open/closed now from today's raw hours ("9:00-21:00"); null if unknown. */
export function openState(raw: string | null, nowMin: number): "open" | "closed" | null {
  if (raw === "Closed") return "closed"; const m = raw && /^\s*(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})\s*$/.exec(raw); if (!m) return null;
  const a = +m[1] * 60 + +m[2], b = +m[3] * 60 + +m[4]; return nowMin >= a && nowMin < b ? "open" : "closed";
}
export function storeToday(venue: string, rules: DealRule[], todayIso: string, hours?: Record<string, string> | null, nowMin: number = nowMinutesET()): StoreToday {
  const dow = dowOf(todayIso); const mine = rules.filter((r) => r.venue === venue);
  const today = mine.filter((r) => r.day === dow).sort((a, b) => (b.discountPct ?? 0) - (a.discountPct ?? 0));
  let next: StoreToday["next"] = null;
  for (let i = 1; i <= 7 && !next; i++) { const r = mine.filter((x) => x.day === (dow + i) % 7).sort((a, b) => (b.discountPct ?? 0) - (a.discountPct ?? 0))[0]; if (r) next = { rule: r, date: addDaysIso(todayIso, i), inDays: i }; }
  return { date: todayIso, dow, dayName: DAYS[dow], hours: hoursOn(hours, dow), openNow: openState(rawHoursOn(hours, dow), nowMin), today, next };
}
export const whenLabel = (inDays: number, dow: number) => (inDays === 1 ? "Tomorrow" : DAYS[dow]);
