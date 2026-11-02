import Link from "next/link";
import { PageHead } from "@/components/ui";
import { getSales, getVenues, getDealRules } from "@/lib/data";
import { DAYS } from "@/lib/deal-rules";
export const metadata = { title: "Today — Central Florida estate sales & thrift deal days", description: "Estate sales open today plus today's Goodwill color-tag, half-off and bin restock days in Central Florida.", alternates: { canonical: "/today" } };
export const dynamic = "force-dynamic";
export default async function Today() {
  const [sales, venues, dealRules] = await Promise.all([getSales(), getVenues(), getDealRules()]);
  const name = (s: string) => venues.find((v) => v.slug === s)?.name ?? s;
  const iso = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const dow = new Date(iso + "T12:00:00").getDay();
  const todaySales = sales.filter((s) => s.days.some((d) => d.date === iso));
  const deals = dealRules.filter((r) => r.day === dow);
  return (<div><PageHead title={`Today · ${DAYS[dow]} ${iso.slice(5).replace("-", "/")}`} sub="What's worth driving to today: open estate sales and store deal days" />
    <div className="grid gap-4 md:grid-cols-2">
      <div className="panel"><div className="panel-head">Estate sales open today ({todaySales.length})</div><div className="space-y-2 p-3">
        {todaySales.map((s) => { const x = s.days.find((d) => d.date === iso)!; return <Link key={s.slug} href={`/sales/${s.slug}`} className="block rounded border border-line p-2 text-sm hover:border-royal">
          <b className="text-royal">{s.title}</b><div className="text-xs text-gray-600">{s.city} · {x.start}–{x.end}{x.discountPct ? ` · ${x.discountPct}% off` : ""}</div></Link>; })}
        {!todaySales.length && <div className="text-sm text-gray-600">No estate sales listed for today. <Link className="text-royal underline" href="/sales">See upcoming</Link></div>}
      </div></div>
      <div className="panel"><div className="panel-head">Deal days today ({deals.length})</div><div className="space-y-2 p-3">
        {deals.map((r) => <Link key={r.id} href={`/stores/${r.venue}`} className={`pill ${r.color} block whitespace-normal`}>{r.label}<div className="text-[11px] font-normal">{name(r.venue)}{r.time ? ` · ${r.time}` : ""}{!r.verified && " · unverified"}</div></Link>)}
        {!deals.length && <div className="text-sm text-gray-600">No deal days today. <Link className="text-royal hover:underline" href="/deals">See the weekly schedule</Link></div>}
      </div></div>
    </div>
    <p className="mt-4 text-sm"><Link className="font-bold text-royal hover:underline" href="/weekend">Plan the weekend</Link> · <Link className="font-bold text-royal hover:underline" href="/calendar">Next 14 days</Link></p></div>);
}
