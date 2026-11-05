import type { DealRule, DealKind } from "./deal-rules";
import type { Venue } from "./data";
/** Kinds that signal fresh stock / bins activity or a markdown shoppers time trips around. */
export const RESTOCK_KINDS: DealKind[] = ["restock", "bins_rotation", "dollar_day", "color_tag"];
export const KIND_LABEL: Record<string, string> = { restock: "Restock", bins_rotation: "Bin rotation", dollar_day: "Bins / $ day", color_tag: "Color rotates" };
export type HeatCell = { day: number; rules: DealRule[]; score: number };
export type HeatRow = { venue: Venue; cells: HeatCell[]; total: number; anyVerified: boolean };
/** verified rule = 2, unverified (crowdsourced/aggregator) = 1. Never invents rules: empty cells stay 0. */
export const ruleWeight = (r: DealRule) => (r.verified ? 2 : 1);
export function buildHeatmap(venues: Venue[], rules: DealRule[], opts: { kinds?: DealKind[] } = {}) {
  const kinds = opts.kinds ?? RESTOCK_KINDS; const byVenue = new Map<string, DealRule[]>();
  for (const r of rules) if (kinds.includes(r.kind)) byVenue.set(r.venue, [...(byVenue.get(r.venue) ?? []), r]);
  const shown = venues.filter((v) => v.type === "outlet_bins" || (byVenue.has(v.slug) && v.type !== "auction_house"));
  const rows: HeatRow[] = shown.map((venue) => { const rs = byVenue.get(venue.slug) ?? [];
    const cells = Array.from({ length: 7 }, (_, day) => { const d = rs.filter((r) => r.day === day); return { day, rules: d, score: d.reduce((a, r) => a + ruleWeight(r), 0) }; });
    return { venue, cells, total: cells.reduce((a, c) => a + c.score, 0), anyVerified: rs.some((r) => r.verified) }; })
    .sort((a, b) => (b.venue.type === "outlet_bins" ? 1 : 0) - (a.venue.type === "outlet_bins" ? 1 : 0) || b.total - a.total || a.venue.name.localeCompare(b.venue.name));
  const dayTotals = Array.from({ length: 7 }, (_, d) => rows.reduce((a, r) => a + r.cells[d].score, 0));
  return { rows, dayTotals, max: Math.max(1, ...rows.flatMap((r) => r.cells.map((c) => c.score))), maxDay: Math.max(1, ...dayTotals), empty: rows.filter((r) => r.total === 0).length };
}
/** 0..4 heat level for a score relative to the max. */
export const heatLevel = (score: number, max: number) => (score <= 0 ? 0 : Math.min(4, Math.max(1, Math.ceil((score / max) * 4))));
export const HEAT_BG = ["bg-white", "bg-[#dbe6f7]", "bg-[#9fbbe8]", "bg-[#4f7fd0]", "bg-royal"];
export const HEAT_FG = ["text-gray-400", "text-ink", "text-ink", "text-white", "text-white"];
