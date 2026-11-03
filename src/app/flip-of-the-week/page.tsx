import Link from "next/link";
import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { getPrices, thriftRange } from "@/lib/prices";
import { flipOfWeek, FEE_PCT, FEE_FIXED, type FlipEst } from "@/lib/flip-week";
import { weekLabel } from "@/lib/color-tag-board";
import { todayET } from "@/lib/cities";
import { ebaySoldUrl } from "@/lib/flip-tips";
export const dynamic = "force-dynamic"; // rotates each Sunday (Eastern)
const title = "Flip of the week — a thrift item worth hunting (estimates)";
const description = "One thrift-store item to hunt this week in Central Florida, with its sourced eBay sold median, an estimated thrift cost and an estimated profit after fees. All profit figures are estimates.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/flip-of-the-week" } };
const $ = (n: number) => `$${n.toFixed(2)}`;
function Est({ f }: { f: FlipEst }) {
  return <span>est. <b>{$(f.netAtHigh)}–{$(f.netAtLow)}</b> profit</span>;
}
export default function FlipOfTheWeek() {
  const { weekOf, expiresOn, pick, others } = flipOfWeek(getPrices(), todayET());
  return (<div><PageHead title="Flip of the Week" sub={`Week of ${weekLabel(weekOf, expiresOn)} · rotates every Sunday`} />
    <p className="panel mb-4 border-l-4 border-l-cta p-3 text-sm"><b>Estimates, not promises.</b> Sold medians come from eBay sold listings (linked). Thrift costs are rough estimates from shopper reports. Profit = sold median − est. thrift cost − ~{FEE_PCT}% + {$(FEE_FIXED)} eBay fees, assuming the buyer pays shipping. Your item&apos;s condition, size and brand change everything.</p>
    {!pick ? <p className="panel p-4 text-sm">No item has both a sourced sold price and a thrift-cost estimate yet. See the <Link href="/prices" className="link">price tracker</Link>.</p> : <>
    <section className="panel mb-4 min-w-0 overflow-hidden" aria-labelledby="flip-pick"><div className="panel-head">This week&apos;s pick</div>
      <div className="grid min-w-0 gap-4 p-4 md:grid-cols-3">
        <div className="min-w-0 md:col-span-2"><h2 id="flip-pick" className="text-2xl font-black text-royal [overflow-wrap:anywhere]">{pick.item.item}</h2><p className="text-sm text-gray-600">{pick.item.category}</p>
          <dl className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
            <div className="rounded-sm border border-line bg-paper p-2"><dt className="text-xs uppercase text-gray-600">eBay sold median</dt><dd className="text-xl font-bold">{$(pick.item.median!)}</dd><dd className="text-xs text-gray-600">{pick.item.samples ?? "?"} sold · {pick.item.dateRange}</dd></div>
            <div className="rounded-sm border border-line bg-paper p-2"><dt className="text-xs uppercase text-gray-600">Est. thrift cost</dt><dd className="text-xl font-bold">{thriftRange(pick.item.estThrift)}</dd><dd className="text-xs text-gray-600">{pick.item.estThrift?.confidence || "low"} confidence · estimate</dd></div>
            <div className="rounded-sm border border-cta-dark bg-[#fff1f2] p-2"><dt className="text-xs uppercase text-cta">Est. profit after fees</dt><dd className="text-xl font-bold text-cta">{$(pick.netAtHigh)}–{$(pick.netAtLow)}</dd><dd className="text-xs text-gray-600">≈{$(pick.netAtMid)} at mid cost{pick.marginAtMid != null && ` · ~${pick.marginAtMid}% margin`} · estimate</dd></div></dl>
          {pick.item.estThrift?.notes && <p className="mt-3 text-xs text-gray-700">Thrift-cost note: {pick.item.estThrift.notes}{pick.item.estThrift.sourceUrl && <> (<a href={pick.item.estThrift.sourceUrl} rel="nofollow noopener noreferrer" target="_blank" className="underline">source</a>{pick.item.estThrift.date && `, ${pick.item.estThrift.date}`})</>}</p>}
          {pick.item.notes && <p className="mt-1 text-xs text-gray-600">Sold-data note: {pick.item.notes}</p>}</div>
        <div className="min-w-0 space-y-2 text-sm"><a href={pick.item.sourceUrl} target="_blank" rel="nofollow noopener noreferrer" className="btn-red w-full justify-center">See the sold listings ↗</a>
          {pick.item.query && <a href={ebaySoldUrl(pick.item.query)} target="_blank" rel="nofollow noopener noreferrer" className="btn-gray w-full justify-center">Check today&apos;s sold prices ↗</a>}
          <Link href={`/calculator?item=${pick.item.slug}`} className="btn-gray w-full justify-center">Run your own numbers</Link>
          <Link href="/deals" className="link block">Find a half-off / color-tag day to buy it cheaper →</Link>
          <p className="text-xs text-gray-600">Sold data retrieved {pick.item.retrieved || "—"}.</p></div></div></section>
    {others.length > 0 && <section className="panel min-w-0" aria-labelledby="flip-more"><div id="flip-more" className="panel-head">Also worth a look (highest est. profit at mid cost)</div><ul className="text-sm">
      {others.map((f) => <li key={f.item.slug} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-line px-4 py-2 last:border-0"><span className="min-w-0"><b>{f.item.item}</b> <span className="text-xs text-gray-600">sold median {$(f.item.median!)} · est. thrift {thriftRange(f.item.estThrift)}</span></span>
        <span className="flex items-baseline gap-3"><Est f={f} /><Link href={`/calculator?item=${f.item.slug}`} className="text-xs font-bold text-cta underline" aria-label={`Calculate profit for ${f.item.item}`}>Calculate</Link></span></li>)}</ul></section>}</>}
    <p className="mt-3 text-xs text-gray-600">Only items with a linked sold-price source and a thrift-cost estimate are eligible, and only if they still clear a profit at the top of the thrift-cost range. Full list: <Link href="/prices" className="link">Resale Price Tracker</Link>.</p>
  </div>);
}
