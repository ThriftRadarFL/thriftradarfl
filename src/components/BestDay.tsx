import { t12 } from "@/lib/time";
import { heat, type BestDay as B } from "@/lib/best-day";
const ORDER = [1, 2, 3, 4, 5, 6, 0];
const CELL = ["bg-white text-gray-500", "bg-[#e6eefb] text-royal", "bg-[#c4d6f5] text-royal-dark", "bg-gradient-to-b from-[#2a5cb8] to-royal text-white", "bg-gradient-to-b from-[#ee2a3f] to-cta text-white"];
/** "Best day to go" panel: 7-day heat strip (Mon→Sun) + best/runner-up with reasons. Server component. */
export default function BestDay({ b, today }: { b: B | null; today: number }) {
  if (!b) return null; const max = b.best.score;
  return (<section aria-labelledby="best-h" className="panel mb-4 overflow-hidden">
    <h2 id="best-h" className="panel-head">Best day to go</h2>
    <div className="bg-gradient-to-b from-white to-paper p-4 text-sm">
      <p className="mb-3 flex flex-wrap items-center gap-2"><span className="rounded-sm border border-cta-dark bg-gradient-to-b from-[#ee2a3f] to-cta px-2.5 py-1 text-base font-bold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">{b.best.name}</span>
        <span><b>{b.reason}</b>{b.best.rules[0].time && ` · from ${t12(b.best.rules[0].time)}`}</span></p>
      {b.runnerUp && <p className="mb-3 text-gray-700">Runner-up: <b>{b.runnerUp.name}</b> — {b.runnerUp.rules[0].label}{b.runnerUp.rules[0].verified ? "" : " (unverified)"}</p>}
      <ol className="grid grid-cols-7 gap-1" aria-label="Deal strength by weekday">{ORDER.map((d) => { const w = b.week[d]; const h = heat(w.score, max);
        const label = w.closed ? "closed" : w.rules.length ? w.rules.map((r) => r.label).join("; ") : "no deals";
        return <li key={d} title={label} aria-label={`${w.name}: ${label}`} className={`rounded-sm border border-line py-1.5 text-center text-xs font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.3)] ${CELL[h]} ${d === today ? "ring-2 ring-[#f5b400]" : ""}`}>
          {w.name}<span className="block text-[10px] font-normal">{w.closed ? "closed" : w.rules.length ? (w.rules[0].discountPct ? `${w.rules[0].discountPct}%` : "deal") : "—"}</span></li>; })}</ol>
      <p className="mt-2 text-xs text-gray-600">Ranked by discount size; senior/military days count less (not everyone qualifies) and unverified schedules count a bit less. Yellow ring = today.</p></div></section>);
}
