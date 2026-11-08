import { range12 } from "@/lib/time";
import Link from "next/link";
import { PageHead } from "@/components/ui";
import { getSales, getVenues, getDealRules } from "@/lib/data";
import { DAYS, groupChainDeals } from "@/lib/deal-rules";
export const metadata = { title: "Calendar — estate sales & deal days, next 14 days", description: "14-day calendar of Central Florida estate sales and thrift deal days, with a subscribable iCal feed.", alternates: { canonical: "/calendar" } };
export const dynamic = "force-dynamic";
const fmt = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
const citySlug = (c: string) => c.toLowerCase().replace(/\s+/g, "-");
export default async function Calendar({ searchParams }: { searchParams: Promise<{ show?: string; city?: string }> }) {
  const sp = await searchParams;
  const show = sp.show === "sales" || sp.show === "deals" ? sp.show : "all";
  const city = (sp.city ?? "").trim().toLowerCase();
  const [salesAll, venues, dealRules] = await Promise.all([getSales(), getVenues(), getDealRules()]);
  const sales = city ? salesAll.filter((s) => citySlug(s.city) === city || s.city.toLowerCase() === city) : salesAll;
  const venueMatch = (slug: string) => {
    if (!city) return true;
    const v = venues.find((x) => x.slug === slug);
    return !!v && (citySlug(v.city) === city || v.city.toLowerCase() === city);
  };
  const rules = dealRules.filter((r) => venueMatch(r.venue));
  const start = new Date(fmt(new Date()) + "T12:00:00");
  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });
  const href = (next: { show?: string; city?: string }) => {
    const q = new URLSearchParams();
    const s = next.show ?? (show === "all" ? "" : show);
    const c = next.city ?? city;
    if (s) q.set("show", s);
    if (c) q.set("city", c);
    const qs = q.toString();
    return qs ? `/calendar?${qs}` : "/calendar";
  };
  return (<div><PageHead title="Calendar" sub="Estate sales and store deal days for the next two weeks" />
    <p className="mb-3 text-sm">Subscribe in your calendar app: <a className="font-bold text-royal hover:underline" href="/api/calendar">estate sales</a> · <a className="font-bold text-royal hover:underline" href="/api/calendar/deals">store deal days</a> · <a className="font-bold text-royal hover:underline" href="/api/calendar?deals=1">both</a> (iCal feeds)</p>
    <nav aria-label="Calendar filters" className="mb-3 flex flex-wrap gap-2 text-sm">
      <Link className={`btn-gray text-xs ${show === "all" ? "ring-2 ring-cta" : ""}`} href={href({ show: "" })}>All</Link>
      <Link className={`btn-gray text-xs ${show === "sales" ? "ring-2 ring-cta" : ""}`} href={href({ show: "sales" })}>Sales</Link>
      <Link className={`btn-gray text-xs ${show === "deals" ? "ring-2 ring-cta" : ""}`} href={href({ show: "deals" })}>Deal days</Link>
    </nav>
    <div className="panel"><div className="panel-head">Next 14 days</div>
      <div className="calendar-frame grid grid-cols-1 gap-px bg-line sm:grid-cols-7">{days.map((d, i) => {
        const iso = fmt(d); const daySales = show === "deals" ? [] : sales.filter((s) => s.days.some((x) => x.date === iso));
        const grouped = show === "sales" ? [] : groupChainDeals(rules.filter((r) => r.day === d.getDay()), venues);
        return <div key={iso} className={`bg-white sm:min-h-40 ${i === 0 ? "ring-2 ring-cta ring-inset" : ""}`}>
          <div className="bg-paper border-b border-line px-2 py-1 text-xs font-bold text-royal">{DAYS[d.getDay()]} {d.getMonth() + 1}/{d.getDate()}{i === 0 && " · today"}</div>
          <div className="p-1.5 space-y-1">
            {daySales.map((s) => { const x = s.days.find((y) => y.date === iso)!; return <Link key={s.slug} href={`/sales/${s.slug}`} className="block rounded border border-line bg-white p-1 text-[11px] hover:border-royal">
              <b className="text-royal">{s.title}</b><div className="text-gray-600">{s.city} · {range12(x.start, x.end)}{x.discountPct ? ` · ${x.discountPct}% off` : ""}</div></Link>; })}
            {grouped.map((g) => <div key={g.key} className={`pill ${g.color} block whitespace-normal`}>{g.label}{g.count > 1 ? ` · ${g.count} stores` : ""}<div className="text-[11px] font-normal">{g.count > 1 ? (g.names.length <= 3 ? g.names.join(" · ") : `${g.names[0]} and ${g.count - 1} more`) : g.names[0]}{!g.verified && " · unverified"}</div></div>)}
            {!daySales.length && !grouped.length && <div className="text-[11px] text-gray-600">Nothing listed</div>}
          </div></div>; })}</div></div></div>);
}
