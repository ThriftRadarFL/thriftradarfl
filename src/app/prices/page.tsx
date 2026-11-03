import Link from "next/link";
import { PageHead } from "@/components/ui";
import { getPrices, type PricePoint } from "@/lib/prices";
export const metadata = { title: "Resale Price Tracker", description: "Sold-price medians for common thrift flips, with sample sizes, date ranges and sources. Blank rows mean no verified data yet.", alternates: { canonical: "/prices" } };
function Spark({ h }: { h: PricePoint[] }) {
  if (h.length < 2) return null;
  const ps = h.map((p) => p.price), lo = Math.min(...ps), hi = Math.max(...ps), W = 90, H = 24;
  const pts = ps.map((p, i) => `${(i / (ps.length - 1)) * W},${H - (hi === lo ? H / 2 : ((p - lo) / (hi - lo)) * H)}`).join(" ");
  return <svg width={W} height={H} role="img" aria-label={`Price history ${h[0].date} to ${h[h.length - 1].date}`}><polyline points={pts} fill="none" stroke="#0a3d91" strokeWidth="2" /></svg>;
}
export default function Prices() {
  const items = getPrices(); const n = items.filter((i) => i.median !== null).length;
  return (<div><PageHead title="Resale Price Tracker" sub={`${n} of ${items.length} items have verified sold data. We never estimate missing prices.`} />
    <div className="panel overflow-x-auto"><div className="panel-head">Sold prices (median of completed sales)</div>
      <table className="w-full text-sm"><thead className="bg-paper text-left"><tr>{["Item", "Sold median", "Samples", "Date range", "History", "Source", ""].map((h) => <th key={h} className="border-b border-line px-3 py-2">{h}</th>)}</tr></thead>
        <tbody>{items.map((i) => <tr key={i.slug} className="border-b border-line align-top last:border-0">
          <td className="px-3 py-2"><b>{i.item}</b><div className="text-xs text-gray-600">{i.category}{i.thriftCost && ` · thrift cost seen: $${i.thriftCost}`}</div></td>
          {i.median === null ? <td colSpan={5} className="px-3 py-2 italic text-gray-600" title={i.notes}>No verified data yet</td> : <>
            <td className="px-3 py-2 font-bold text-royal">${i.median.toFixed(2)}{i.min !== null && i.max !== null && <div className="text-xs font-normal text-gray-600">range ${i.min.toFixed(2)}–${i.max.toFixed(2)}</div>}</td><td className="px-3 py-2">{i.samples ?? "—"}{i.samples !== null && i.samples < 100 && <div className="text-xs text-gray-600">small sample</div>}</td><td className="px-3 py-2">{i.dateRange || "—"}</td>
            <td className="px-3 py-2"><Spark h={i.history} /></td>
            <td className="px-3 py-2"><a href={i.sourceUrl} rel="nofollow noopener" target="_blank" className="text-royal underline">{new URL(i.sourceUrl).hostname.replace(/^www\./, "")}</a></td></>}
          <td className="px-3 py-2">{i.median !== null && <Link href={`/calculator?item=${i.slug}`} className="text-xs font-bold text-cta underline">Calculate</Link>}</td></tr>)}</tbody></table></div>
    <p className="mt-3 text-xs text-gray-600">Data retrieved {items[0]?.retrieved || "—"}. Medians are for one representative listing type and can move quickly. Try the <Link href="/calculator" className="text-royal underline">profit calculator</Link>.</p></div>);
}
