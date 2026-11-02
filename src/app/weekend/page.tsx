import { range12, t12 } from "@/lib/time";
import Link from "next/link";
import { PageHead } from "@/components/ui";
import { getSales, getVenues, getDealRules } from "@/lib/data";
import { DAYS } from "@/lib/deal-rules";
import { todayET } from "@/lib/cities";
import { parseNearQuery, weekendNear, RADII } from "@/lib/near";
import LocateButton from "./LocateButton";
export const metadata = { title: "This weekend near you — Central Florida estate sales & thrift deals", description: "Friday–Sunday estate sales, auctions and thrift deal days near your ZIP across Volusia, Seminole and Orange counties.", alternates: { canonical: "/weekend" } };
export const dynamic = "force-dynamic";
type SP = Record<string, string | string[] | undefined>;
const mi = (m: number | null) => (m === null ? "distance unknown" : `${m < 10 ? m.toFixed(1) : Math.round(m)} mi`);
const label = (iso: string) => { const d = new Date(iso + "T12:00:00Z"); return `${DAYS[d.getUTCDay()]} ${d.getUTCMonth() + 1}/${d.getUTCDate()}`; };
export default async function Weekend({ searchParams }: { searchParams: Promise<SP> }) {
  const q = parseNearQuery(await searchParams); const today = todayET();
  const [sales, venues, dealRules] = await Promise.all([getSales(), getVenues(), getDealRules()]);
  const near = weekendNear(sales, venues, dealRules, today, q.origin, q.radius);
  const where = q.radius ? `within ${q.radius} mi of ${q.origin.label}` : `from ${q.origin.label}, any distance`;
  const qs = (r: number) => (q.zip ? `?zip=${q.zip}&r=${r || "any"}` : `?lat=${q.origin.lat}&lng=${q.origin.lng}&r=${r || "any"}`);
  return (<div><PageHead title="This weekend near you" sub="Friday through Sunday: estate sales plus store deal days, closest first" />
    <form action="/weekend" method="get" className="panel mb-4 flex flex-wrap items-end gap-3 p-3 text-sm" aria-label="Filter by distance">
      <label className="text-xs font-bold">ZIP code<input name="zip" defaultValue={q.zip} inputMode="numeric" pattern="\d{5}" maxLength={5} placeholder="32127" className="mt-1 block w-28 border border-line bg-white px-2 py-2 text-sm font-normal" /></label>
      <label className="text-xs font-bold">Distance<select name="r" defaultValue={q.radius ? String(q.radius) : "any"} className="mt-1 block border border-line bg-white px-2 py-2 text-sm font-normal">
        {RADII.map((r) => <option key={r} value={r}>Within {r} mi</option>)}<option value="any">Any distance</option></select></label>
      <button className="btn-red">Show sales</button><LocateButton radius={q.radius} />
      <p className="w-full text-xs text-gray-600" role="status">Showing {near.total} {near.total === 1 ? "listing" : "listings"} {where}.{" "}
        {near.hiddenSales + near.hiddenDeals > 0 && <>{near.hiddenSales + near.hiddenDeals} more farther away.</>}</p>
      {q.error && <p className="w-full border-l-4 border-cta bg-paper p-2 text-sm" role="alert">{q.error}</p>}
    </form>
    {near.total === 0 && <div className="panel mb-4 p-4 text-sm"><b className="text-royal">Nothing this weekend {where}.</b>{" "}
      {near.widenTo !== null ? <>The closest listing is {mi(near.nearestOutside)} away — <Link className="link" href={`/weekend${qs(near.widenTo)}`}>{near.widenTo ? `widen to ${near.widenTo} mi` : "show any distance"}</Link>.</>
        : <>No sales or deal days are listed for Friday–Sunday yet. Try <Link className="link" href="/sales">all upcoming sales</Link> or <Link className="link" href="/deals">the weekly deal-day schedule</Link>.</>}</div>}
    <div className="grid gap-4 md:grid-cols-3">{near.days.map((d) => <div key={d.date} className="panel"><h2 className="panel-head">{label(d.date)}{d.date === today && " · today"}</h2>
      <div className="space-y-2 p-3">
        <h3 className="text-xs font-bold uppercase text-gray-600">Estate sales ({d.sales.length})</h3>
        {d.sales.map(({ sale: s, day: x, miles }) => <Link key={s.slug} href={`/sales/${s.slug}`} className="block rounded border border-line p-2 text-sm hover:border-royal">
          <b className="text-royal">{s.title}</b><div className="text-xs text-gray-600">{s.city} · {mi(miles)} · {range12(x.start, x.end)}{x.discountPct ? ` · ${x.discountPct}% off` : ""}</div></Link>)}
        {!d.sales.length && <p className="text-xs text-gray-600">No estate sales {q.radius ? `within ${q.radius} mi` : "listed"} — <Link className="link" href="/submit">know of one? Add it</Link></p>}
        <h3 className="pt-2 text-xs font-bold uppercase text-gray-600">Deal days ({d.deals.length})</h3>
        {d.deals.map((r) => <Link key={r.venue + r.label} href={`/stores/${r.venue}`} className={`pill ${r.color} block whitespace-normal`}>{r.label}{r.time && ` · ${t12(r.time)}`}
          <span className="block text-[11px] font-normal">{r.store} · {mi(r.miles)}{!r.verified && " · unverified"}</span></Link>)}
        {!d.deals.length && <p className="text-xs text-gray-600">No store deal days {q.radius ? "nearby" : ""} — <Link className="link" href="/deals">see the full schedule</Link></p>}
      </div></div>)}</div>
    <p className="mt-4 text-sm">Distances are straight-line from the ZIP&apos;s center (US Census). Want this in your inbox? <Link className="font-bold text-royal hover:underline" href="/digest">Get the weekly digest</Link> · <a className="link" href="/api/calendar/deals">Add deal days to your calendar</a>.</p></div>);
}
