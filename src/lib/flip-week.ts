// "Flip of the week": rotates weekly (Sun–Sat, Eastern) through resale-price items that have BOTH a sourced eBay sold
// median and an estimated thrift-cost range on file. Every profit number is an ESTIMATE from that data — nothing invented.
import { profit, type PriceItem } from "./prices";
import { weekBounds } from "./color-tags";
export const FEE_PCT = 13.25, FEE_FIXED = 0.4; // same defaults as /calculator (eBay final value fee + per-order fee)
export type FlipEst = { item: PriceItem; buyLow: number; buyHigh: number; netAtLow: number; netAtHigh: number; netAtMid: number; marginAtMid: number | null };
export function flipEstimate(i: PriceItem): FlipEst | null {
  if (i.median === null || !i.estThrift || i.estThrift.low === null || i.estThrift.high === null || !i.sourceUrl) return null;
  const net = (buy: number) => profit({ buy, sale: i.median!, shipping: 0, packaging: 0, feePct: FEE_PCT, feeFixed: FEE_FIXED });
  const { low, high } = i.estThrift; const mid = net((low + high) / 2);
  const r2 = (n: number) => Math.round(n * 100) / 100;
  return { item: i, buyLow: low, buyHigh: high, netAtLow: r2(net(low).net), netAtHigh: r2(net(high).net), netAtMid: r2(mid.net), marginAtMid: mid.margin === null ? null : Math.round(mid.margin) };
}
/** Eligible flips: sourced median + est. thrift range, and still profitable (est.) even if you pay the top of the thrift range. Sorted by slug for a stable rotation. */
export const eligibleFlips = (items: PriceItem[]) => items.map(flipEstimate).filter((f): f is FlipEst => !!f && f.netAtHigh > 0).sort((a, b) => a.item.slug.localeCompare(b.item.slug));
/** Week number since 2026-01-04 (a Sunday), Eastern weeks. */
export const weekIndex = (today: string) => Math.floor((Date.parse(weekBounds(today).weekOf + "T12:00:00Z") - Date.parse("2026-01-04T12:00:00Z")) / (7 * 864e5));
export function flipOfWeek(items: PriceItem[], today: string) {
  const list = eligibleFlips(items); const wb = weekBounds(today); if (!list.length) return { ...wb, pick: null, others: [] as FlipEst[] };
  const n = ((weekIndex(today) % list.length) + list.length) % list.length; const pick = list[n];
  const others = list.filter((f) => f !== pick).sort((a, b) => b.netAtMid - a.netAtMid).slice(0, 5);
  return { ...wb, pick, others };
}
