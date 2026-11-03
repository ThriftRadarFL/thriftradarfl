import raw from "../../data/resale-prices.json";
export type RawPrice = Record<string, string | undefined> & { item: string; history?: unknown };
export type PricePoint = { date: string; price: number };
export type PriceItem = { slug: string; item: string; category: string; query: string; median: number | null; samples: number | null; dateRange: string; sourceUrl: string; retrieved: string; thriftCost: string; min: number | null; max: number | null; estThrift: { low: number | null; high: number | null; sourceUrl: string; date: string; confidence: string; notes: string } | null; thriftCostSource: string; notes: string; history: PricePoint[] };
const num = (v: unknown) => { const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/[$,]/g, "")); return Number.isFinite(n) && n > 0 ? n : null; };
export const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
export function normalize(r: RawPrice): PriceItem {
  const median = num(r.sold_median_usd); const src = String(r.source_url ?? "").trim();
  // A price only counts as verified when it has a source link.
  const ok = median !== null && /^https?:\/\//.test(src);
  const hist = Array.isArray(r.history) ? (r.history as { date?: string; price?: unknown }[]).map((p) => ({ date: String(p.date ?? ""), price: num(p.price) })).filter((p): p is PricePoint => !!p.date && p.price !== null) : [];
  return { slug: slugify(r.item), item: r.item, category: r.category ?? "", query: r.search_query ?? "", median: ok ? median : null, samples: ok ? (num(r.sample_size) ?? null) : null,
    dateRange: ok ? r.date_range ?? "" : "", sourceUrl: ok ? src : "", retrieved: r.retrieved_date ?? "", estThrift: (num(r.est_thrift_low_usd) ?? num(r.est_thrift_high_usd)) !== null ? { low: num(r.est_thrift_low_usd), high: num(r.est_thrift_high_usd), sourceUrl: String(r.est_thrift_source_url ?? ""), date: String(r.est_thrift_source_date ?? ""), confidence: String(r.est_thrift_confidence ?? "low"), notes: String(r.est_thrift_notes ?? "") } : null, min: ok ? num(r.sold_min_usd) : null, max: ok ? num(r.sold_max_usd) : null, thriftCost: r.typical_thrift_cost_usd ?? "", thriftCostSource: r.thrift_cost_source_or_estimate ?? "", notes: r.notes ?? "", history: ok ? hist : [] };
}
export const getPrices = (): PriceItem[] => (raw as RawPrice[]).map(normalize);
export type FeeInput = { buy: number; sale: number; shipping: number; packaging: number; feePct: number; feeFixed: number };
export function profit(i: FeeInput) {
  const fees = i.sale > 0 ? i.sale * (i.feePct / 100) + i.feeFixed : 0;
  const cost = i.buy + i.shipping + i.packaging;
  const net = i.sale - fees - cost;
  return { fees, net, margin: i.sale > 0 ? (net / i.sale) * 100 : null, roi: i.buy + i.packaging > 0 ? (net / (i.buy + i.packaging)) * 100 : null };
}
/** "$3.99–$13.99" / "up to $7.99" for an est. thrift-cost range; midpoint used to prefill buy cost. */
export const thriftRange = (e: PriceItem["estThrift"]) => !e ? "" : e.low !== null && e.high !== null ? `$${e.low.toFixed(2)}–$${e.high.toFixed(2)}` : e.high !== null ? `up to $${e.high.toFixed(2)}` : `from $${e.low!.toFixed(2)}`;
export const thriftMid = (e: PriceItem["estThrift"]) => !e ? null : e.low !== null && e.high !== null ? (e.low + e.high) / 2 : (e.high ?? e.low);
