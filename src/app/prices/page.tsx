import Link from "next/link";
import { PageHead } from "@/components/ui";
import { getPrices, thriftRange, recency, filterByWindow, type PricePoint, type Recency } from "@/lib/prices";
import { todayET } from "@/lib/cities";
export const dynamic = "force-dynamic";
const REC_CLS: Record<Recency["level"], string> = { high: "bg-teal", mixed: "bg-royal", stale: "bg-gray-700", unknown: "bg-gray-500" };
const WINS = [["all", "All dates"], ["90any", "Any sales in last 90 days"], ["90", "Only last 90 days"]];
export const metadata = { title: "Resale Price Tracker", description: "Sold-price medians for common thrift flips, with sample sizes, date ranges and sources. Blank rows mean no verified data yet.", alternates: { canonical: "/prices" } };
function Spark({ h }: { h: PricePoint[] }) {
  if (h.length < 2) return null;
  const ps = h.map((p) => p.price), lo = Math.min(...ps), hi = Math.max(...ps), W = 90, H = 24;
  const pts = ps.map((p, i) => `${(i / (ps.length - 1)) * W},${H - (hi === lo ? H / 2 : ((p - lo) / (hi - lo)) * H)}`).join(" ");
  return <svg width={W} height={H} role="img" aria-label={`Price history ${h[0].date} to ${h[h.length - 1].date}`}><polyline points={pts} fill="none" stroke="#0a3d91" strokeWidth="2" /></svg>;
}
export default async function Prices({ searchParams }: { searchParams: Promise<{ window?: string }> }) {
  const w = (await searchParams).window ?? "all"; const win = WINS.some(([k]) => k === w) ? w : "all"; const today = todayET();
  const all = getPrices(); const n = all.filter((i) => i.median !== null).length; const items = filterByWindow(all, today, win);
  return (<div><PageHead title="Resale Price Tracker" sub={`${n} of ${all.length} items have verified sold data. We never estimate missing prices.`} />
    <nav aria-label="Date window" className="mb-3 flex flex-wrap items-center gap-2 text-sm"><b>Sold-date window:</b>{WINS.map(([k, l]) => <Link key={k} href={k === "all" ? "/prices" : `/prices?window=${k}`} aria-current={win === k ? "page" : undefined} className={`rounded border px-3 py-1.5 font-bold ${win === k ? "border-royal bg-royal text-white" : "border-line bg-white text-royal hover:bg-paper"}`}>{l}</Link>)}<span className="text-xs text-gray-600">Showing {items.length} of {all.length}. Filters by each item&apos;s sold date range; medians are not recomputed.</span></nav>
    <div className="panel overflow-x-auto"><div className="panel-head">Sold prices (median of completed sales)</div>
      <table className="w-full min-w-[760px] text-sm"><thead className="bg-paper text-left"><tr>{["Item", "Sold median", "Samples", "Date range / recency", "History", "Source", ""].map((h) => <th key={h} className="border-b border-line px-3 py-2">{h}</th>)}</tr></thead>
        <tbody>{!items.length && <tr><td colSpan={7} className="px-3 py-4 italic text-gray-600">No items have sold data entirely in this window. <Link href="/prices" className="text-royal underline">Show all dates</Link>.</td></tr>}{items.map((i) => <tr key={i.slug} className="border-b border-line align-top last:border-0">
          <td className="px-3 py-2"><b>{i.item}</b><div className="text-xs text-gray-600">{i.category}{i.estThrift && <> · <span title={i.estThrift.notes}>est. thrift cost {thriftRange(i.estThrift)} (low confidence{i.estThrift.sourceUrl && <>, <a href={i.estThrift.sourceUrl} rel="nofollow noopener" target="_blank" className="underline">source</a></>})</span></>}</div></td>
          {i.median === null ? <td colSpan={5} className="px-3 py-2 italic text-gray-600" title={i.notes}>No verified data yet</td> : <>
            <td className="px-3 py-2 font-bold text-royal">${i.median.toFixed(2)}{i.min !== null && i.max !== null && <div className="text-xs font-normal text-gray-600">range ${i.min.toFixed(2)}–${i.max.toFixed(2)}</div>}</td><td className="px-3 py-2">{i.samples ?? "—"}{i.samples !== null && i.samples < 100 && <div className="text-xs text-gray-600">small sample</div>}</td><td className="px-3 py-2">{i.dateRange || "—"}{(() => { const r = recency(i, today); return <div className="mt-1"><span className={`pill ${REC_CLS[r.level]}`} title="Recency confidence: share of the sold date range inside the last 90 days">{r.level === "high" ? "Recent" : r.level === "mixed" ? "Mixed" : r.level === "stale" ? "Stale" : "?"}</span><div className="text-xs text-gray-600">{r.label}</div></div>; })()}</td>
            <td className="px-3 py-2"><Spark h={i.history} /></td>
            <td className="px-3 py-2"><a href={i.sourceUrl} rel="nofollow noopener" target="_blank" className="text-royal underline">{new URL(i.sourceUrl).hostname.replace(/^www\./, "")}</a></td></>}
          <td className="px-3 py-2">{i.median !== null && <Link href={`/calculator?item=${i.slug}`} className="text-xs font-bold text-cta underline">Calculate</Link>}</td></tr>)}</tbody></table></div>
    <p className="mt-3 text-xs text-gray-600">Data retrieved {items[0]?.retrieved || "—"}. Medians are for one representative listing type and can move quickly. See this week&apos;s <Link href="/flip-of-the-week" className="text-royal underline">Flip of the Week</Link>. Try the <Link href="/calculator" className="text-royal underline">profit calculator</Link>.</p></div>);
}
