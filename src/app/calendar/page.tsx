import { range12 } from "@/lib/time";
import Link from "next/link";
import { PageHead } from "@/components/ui";
import { getSales, getVenues, getDealRules } from "@/lib/data";
import { DAYS } from "@/lib/deal-rules";
export const metadata = { title: "Calendar — estate sales & deal days, next 14 days", description: "14-day calendar of Central Florida estate sales and thrift deal days, with a subscribable iCal feed.", alternates: { canonical: "/calendar" } };
export const dynamic = "force-dynamic";
const fmt = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
export default async function Calendar() {
  const [sales, venues, dealRules] = await Promise.all([getSales(), getVenues(), getDealRules()]);
  const name = (s: string) => venues.find((v) => v.slug === s)?.name ?? s;
  const start = new Date(fmt(new Date()) + "T12:00:00");
  const days = Array.from({ length: 14 }, (_, i) => { const d = new Date(start); d.setDate(d.getDate() + i); return d; });
  return (<div><PageHead title="Calendar" sub="Estate sales and store deal days for the next two weeks" />
    <p className="mb-3 text-sm">Subscribe in your calendar app: <a className="font-bold text-royal hover:underline" href="/api/calendar">estate sales</a> · <a className="font-bold text-royal hover:underline" href="/api/calendar/deals">store deal days</a> · <a className="font-bold text-royal hover:underline" href="/api/calendar?deals=1">both</a> (iCal feeds)</p>
    <div className="panel"><div className="panel-head">Next 14 days</div>
      <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-7">{days.map((d, i) => {
        const iso = fmt(d); const daySales = sales.filter((s) => s.days.some((x) => x.date === iso));
        const deals = dealRules.filter((r) => r.day === d.getDay());
        return <div key={iso} className={`bg-white sm:min-h-40 ${i === 0 ? "ring-2 ring-cta ring-inset" : ""}`}>
          <div className="bg-paper border-b border-line px-2 py-1 text-xs font-bold text-royal">{DAYS[d.getDay()]} {d.getMonth() + 1}/{d.getDate()}{i === 0 && " · today"}</div>
          <div className="p-1.5 space-y-1">
            {daySales.map((s) => { const x = s.days.find((y) => y.date === iso)!; return <Link key={s.slug} href={`/sales/${s.slug}`} className="block rounded border border-line bg-white p-1 text-[11px] hover:border-royal">
              <b className="text-royal">{s.title}</b><div className="text-gray-600">{s.city} · {range12(x.start, x.end)}{x.discountPct ? ` · ${x.discountPct}% off` : ""}</div></Link>; })}
            {deals.map((r) => <div key={r.venue + r.label} className={`pill ${r.color} block whitespace-normal`}>{r.label}<div className="text-[11px] font-normal">{name(r.venue)}{!r.verified && " · unverified"}</div></div>)}
            {!daySales.length && !deals.length && <div className="text-[11px] text-gray-600">Nothing listed</div>}
          </div></div>; })}</div></div></div>);
}
