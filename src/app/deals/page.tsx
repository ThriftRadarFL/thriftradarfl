import { PageHead } from "@/components/ui";
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const sample: Record<string, [string, string][]> = { Wed: [["bg-royal", "Berner's Auction 6:30pm"]], Sat: [["bg-teal", "Color-tag 50% (TBD)"]] };
export default function Deals() {
  return (<div><PageHead title="Deal Days" sub="Color-tag days, half-off days and bin restocks by weekday" />
    <div className="panel"><div className="panel-head">This week</div>
      <div className="grid grid-cols-7 gap-px bg-line">{days.map((d) => <div key={d} className="bg-white min-h-40">
        <div className="bg-paper border-b border-line px-2 py-1 text-xs font-bold text-royal">{d}</div>
        <div className="p-1.5 space-y-1">{(sample[d] ?? []).map(([c, t]) => <div key={t} className={`pill ${c} block whitespace-normal`}>{t}</div>)}</div></div>)}</div></div>
    <p className="mt-3 text-xs text-gray-600">Schedules are being verified with each store.</p></div>);
}
