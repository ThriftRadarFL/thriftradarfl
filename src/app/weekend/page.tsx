import Link from "next/link";
import { PageHead } from "@/components/ui";
import { getSales, getVenues, getDealRules } from "@/lib/data";
import { DAYS } from "@/lib/deal-rules";
export const metadata = { title: "This weekend — Central Florida estate sales & thrift deals", description: "Friday–Sunday estate sales, auctions and thrift deal days across Volusia and Orange counties.", alternates: { canonical: "/weekend" } };
export const dynamic = "force-dynamic";
const fmt = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
export default async function Weekend() {
  const [sales, venues, dealRules] = await Promise.all([getSales(), getVenues(), getDealRules()]);
  const name = (s: string) => venues.find((v) => v.slug === s)?.name ?? s;
  const today = new Date(fmt(new Date()) + "T12:00:00");
  const dow = today.getDay();
  // Upcoming Fri–Sun (if today is Fri/Sat/Sun, use the current weekend)
  const offset = dow === 0 ? -2 : dow >= 5 ? 5 - dow : 5 - dow;
  const days = [0, 1, 2].map((i) => { const d = new Date(today); d.setDate(d.getDate() + offset + i); return d; }).filter((d) => fmt(d) >= fmt(today));
  return (<div><PageHead title="This weekend" sub="Friday through Sunday: estate sales plus store deal days in one place" />
    <div className="grid gap-4 md:grid-cols-3">{days.map((d) => {
      const iso = fmt(d); const daySales = sales.filter((s) => s.days.some((x) => x.date === iso));
      const deals = dealRules.filter((r) => r.day === d.getDay());
      return <div key={iso} className="panel"><div className="panel-head">{DAYS[d.getDay()]} {d.getMonth() + 1}/{d.getDate()}</div>
        <div className="space-y-2 p-3">
          <div className="text-xs font-bold uppercase text-gray-600">Estate sales ({daySales.length})</div>
          {daySales.map((s) => { const x = s.days.find((y) => y.date === iso)!; return <Link key={s.slug} href={`/sales/${s.slug}`} className="block rounded border border-line p-2 text-sm hover:border-royal">
            <b className="text-royal">{s.title}</b><div className="text-xs text-gray-600">{s.city} · {x.start}–{x.end}{x.discountPct ? ` · ${x.discountPct}% off` : ""}</div></Link>; })}
          {!daySales.length && <div className="text-xs text-gray-600">No sales listed yet</div>}
          <div className="pt-2 text-xs font-bold uppercase text-gray-600">Deal days ({deals.length})</div>
          {deals.map((r) => <div key={r.venue + r.label} className={`pill ${r.color} block whitespace-normal`}>{r.label}<div className="text-[11px] font-normal">{name(r.venue)}{!r.verified && " · unverified"}</div></div>)}
          {!deals.length && <div className="text-xs text-gray-600">No deal days</div>}
        </div></div>; })}</div>
    <p className="mt-4 text-sm">Want this in your inbox? <Link className="font-bold text-royal hover:underline" href="/digest">Get the weekly digest</Link>.</p></div>);
}
