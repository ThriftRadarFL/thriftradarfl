// "Best day to go" per store, from its weekly deal rules + hours (pure, tested).
import { DAYS, type DealRule } from "./deal-rules";
import { hoursOn } from "./store-today";

/** How much a deal is worth to a typical flipper. Senior/military days count for less (not everyone qualifies); unverified rules are discounted. */
export function ruleValue(r: DealRule): number {
  const base = r.discountPct ?? ({ color_tag: 50, half_off: 50, dollar_day: 40, restock: 25, bins_rotation: 20, senior_day: 10 } as const)[r.kind];
  const who = r.kind === "senior_day" ? 0.4 : 1;
  return Math.round(base * who * (r.verified ? 1 : 0.8));
}
export type DayScore = { day: number; name: string; score: number; rules: DealRule[]; closed: boolean };
export type BestDay = { best: DayScore; runnerUp: DayScore | null; week: DayScore[]; reason: string };
/** Score Sun..Sat for one store. Returns null if the store has no deal rules. Closed days score 0. */
export function bestDay(venue: string, rules: DealRule[], hours?: Record<string, string> | null): BestDay | null {
  const mine = rules.filter((r) => r.venue === venue); if (!mine.length) return null;
  const week: DayScore[] = DAYS.map((name, day) => {
    const closed = hoursOn(hours, day) === "Closed"; const rs = mine.filter((r) => r.day === day).sort((a, b) => ruleValue(b) - ruleValue(a));
    // Best rule counts fully, extras add a little (discounts usually don't stack, but a restock + sale day is still better).
    const score = closed ? 0 : rs.reduce((s, r, i) => s + (i ? ruleValue(r) * 0.25 : ruleValue(r)), 0);
    return { day, name, score: Math.round(score), rules: closed ? [] : rs, closed };
  });
  const ranked = week.filter((d) => d.score > 0).sort((a, b) => b.score - a.score || a.day - b.day); if (!ranked.length) return null;
  const best = ranked[0]; const runnerUp = ranked[1] ?? null; const top = best.rules[0];
  const reason = `${top.label}${top.verified ? "" : " (unverified)"}`;
  return { best, runnerUp, week, reason };
}
/** 0–4 heat level for a day cell (relative to the store's best day). */
export const heat = (score: number, max: number) => (score <= 0 || max <= 0 ? 0 : Math.max(1, Math.round((score / max) * 4)));
