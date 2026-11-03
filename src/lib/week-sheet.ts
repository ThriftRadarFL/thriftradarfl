// "Deal-day sheet": the next 7 days (ET) of store deal days + open estate sales, grouped by date (pure, tested).
import type { DealRule } from "./deal-rules";
import type { Sale, Venue } from "./data";
import { addDaysIso, dowOf } from "./store-today";
import { range12, t12 } from "./time";
import { ruleValue } from "./best-day";

export type SheetDeal = { rule: DealRule; venue: Pick<Venue, "slug" | "name" | "city"> };
export type SheetSale = { sale: Sale; hours: string; discountPct: number };
export type SheetDay = { date: string; dow: number; deals: SheetDeal[]; sales: SheetSale[] };
export type SheetOpts = { city?: string; verifiedOnly?: boolean; days?: number };
const norm = (s: string) => s.toLowerCase().trim().replace(/\s+/g, "-");
export function weekSheet(today: string, rules: DealRule[], venues: Venue[], sales: Sale[], o: SheetOpts = {}): SheetDay[] {
  const n = Math.min(Math.max(o.days ?? 7, 1), 14); const city = o.city ? norm(o.city) : "";
  const vs = new Map(venues.filter((v) => !city || norm(v.city) === city).map((v) => [v.slug, v]));
  const live = sales.filter((s) => s.published !== false && (!city || norm(s.city) === city));
  return Array.from({ length: n }, (_, i) => {
    const date = addDaysIso(today, i); const dow = dowOf(date);
    const deals = rules.filter((r) => r.day === dow && vs.has(r.venue) && (!o.verifiedOnly || r.verified))
      .map((rule) => ({ rule, venue: vs.get(rule.venue)! })).sort((a, b) => ruleValue(b.rule) - ruleValue(a.rule) || a.venue.name.localeCompare(b.venue.name));
    const ss = live.flatMap((sale) => { const d = sale.days.find((x) => x.date === date); return d ? [{ sale, hours: range12(d.start, d.end), discountPct: d.discountPct ?? 0 }] : []; })
      .sort((a, b) => b.discountPct - a.discountPct || a.sale.title.localeCompare(b.sale.title));
    return { date, dow, deals, sales: ss };
  });
}
export const sheetDayLabel = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" });
/** Plain text for texting a buddy. */
export function sheetText(days: SheetDay[], site: string, cityName?: string): string {
  const head = `ThriftRadarFL deal-day sheet${cityName ? ` · ${cityName}` : ""} · ${days.length ? `${sheetDayLabel(days[0].date)} – ${sheetDayLabel(days.at(-1)!.date)}` : ""}`;
  const body = days.filter((d) => d.deals.length || d.sales.length).map((d) => [
    `\n${sheetDayLabel(d.date).toUpperCase()}`,
    ...d.deals.map((x) => `• ${x.venue.name} (${x.venue.city}): ${x.rule.label}${x.rule.time ? ` · ${t12(x.rule.time)}` : ""}${x.rule.verified ? "" : " [unverified]"}`),
    ...d.sales.map((x) => `• SALE ${x.sale.title} (${x.sale.city}) ${x.hours}${x.discountPct ? ` · ${x.discountPct}% off` : ""} ${site}/sales/${x.sale.slug}`),
  ].join("\n"));
  return [head, ...(body.length ? body : ["\nNothing listed this week."]), `\nFull schedule: ${site}/deals`].join("\n");
}
