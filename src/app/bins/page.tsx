import Link from "next/link";
import { PageHead } from "@/components/ui";
import { getVenues, getDealRules } from "@/lib/data";
import { DAYS } from "@/lib/deal-rules";
import { buildHeatmap, heatLevel, HEAT_BG, HEAT_FG, KIND_LABEL } from "@/lib/restock-heatmap";
import { todayET } from "@/lib/cities";
export const revalidate = 300;
export const metadata = { title: "Bins & Restock Heatmap — when Goodwill outlets and thrift stores restock", description: "Which days Central Florida Goodwill outlet bins and thrift stores restock, rotate bins or run bin discount days. Mostly unverified — every cell shows its source status.", alternates: { canonical: "/bins" } };
export default async function Bins() {
  const [venues, rules] = await Promise.all([getVenues(), getDealRules()]);
  const h = buildHeatmap(venues, rules); const today = new Date(todayET() + "T12:00:00Z").getUTCDay();
  return (<div><PageHead title="Bins & Restock Heatmap" sub="When bins rotate and shelves restock, by weekday · darker = more reported activity" />
    <p className="mb-4 border-l-4 border-cta bg-paper p-3 text-sm"><b>Mostly unverified.</b> No store here publishes an official restock schedule we could confirm. Cells come from our deal-day notes — <span className="font-bold text-cta-dark">UNVERIFIED</span> ones are from shoppers or aggregator sites; ✓ ones we sourced. Blank means <i>nothing on file</i>, not “no restock.” Spotted a pattern? <Link href="/submit" className="link">Tell us</Link> or report the week&apos;s color on the <Link href="/color-tags" className="link">Color Tag Board</Link>.</p>
    <section className="panel mb-4" aria-labelledby="days-h"><h2 id="days-h" className="panel-head">Busiest days across all listed stores</h2>
      <ol className="grid grid-cols-7 gap-1 p-3 text-center text-xs">{h.dayTotals.map((t, d) => { const l = heatLevel(t, h.maxDay); return <li key={d} className={`rounded border border-line py-2 ${HEAT_BG[l]} ${HEAT_FG[l]} ${d === today ? "ring-2 ring-cta" : ""}`}><div className="font-bold">{DAYS[d]}</div><div>{t}</div></li>; })}</ol>
      <p className="px-3 pb-3 text-xs text-gray-600">Score = verified entries ×2 + unverified ×1. Today is outlined in red.</p></section>
    <section className="panel min-w-0" aria-labelledby="grid-h"><h2 id="grid-h" className="panel-head">By store ({h.rows.length})</h2>
      <ul>{h.rows.map((r) => <li key={r.venue.slug} className="border-b border-line p-3 last:border-0">
        <div className="flex flex-wrap items-baseline gap-x-2"><Link href={`/stores/${r.venue.slug}`} className="font-bold text-royal hover:underline">{r.venue.name}</Link><span className="text-xs text-gray-600">{r.venue.city}{r.venue.type === "outlet_bins" && " · outlet bins"}</span>{!r.anyVerified && r.total > 0 && <span className="text-[10px] font-bold uppercase text-cta-dark">unverified</span>}</div>
        {r.total === 0 ? <p className="mt-1 text-xs italic text-gray-600">No restock schedule on file yet.</p> :
        <ol className="mt-2 grid grid-cols-7 gap-1 text-center text-[11px]" aria-label={`${r.venue.name} restock days`}>{r.cells.map((c) => { const l = heatLevel(c.score, h.max); return <li key={c.day} title={c.rules.map((x) => `${x.label}${x.verified ? "" : " (unverified)"}`).join("; ") || "nothing on file"} className={`min-h-10 rounded border border-line p-1 ${HEAT_BG[l]} ${HEAT_FG[l]} ${c.day === today ? "ring-2 ring-cta" : ""}`}><div className="font-bold">{DAYS[c.day]}</div>{c.rules.length > 0 && <div className="text-base leading-none sm:hidden" aria-hidden>{"●".repeat(Math.min(3, c.rules.length))}</div>}{c.rules.map((x, i) => <div key={i} className="hidden leading-tight sm:block">{KIND_LABEL[x.kind]}{x.time ? ` ${x.time}` : ""}{x.verified ? " ✓" : ""}</div>)}</li>; })}</ol>}
        {r.total > 0 && <ul className="mt-1 text-xs text-gray-700">{r.cells.flatMap((c) => c.rules.map((x, i) => <li key={c.day + "-" + i}>{DAYS[c.day]}: {x.label} {x.verified ? <span className="text-teal">✓ sourced</span> : <span className="font-bold text-cta-dark">unverified</span>}</li>))}</ul>}</li>)}</ul></section>
    <p className="mt-3 text-xs text-gray-600">Admins add restock / bin-rotation / $-day entries as deal rules in <Link href="/admin" className="link">admin</Link>; they show here automatically. See also <Link href="/deals" className="link">Deal Days</Link>. JSON: <code>/api/deal-rules</code>.</p></div>);
}
