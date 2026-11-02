import { t12 } from "@/lib/time";
import Link from "next/link";
import { PageHead } from "@/components/ui";
import { getVenues, getDealRules } from "@/lib/data";
import { DAYS } from "@/lib/deal-rules";
export const metadata = { title: "Deal Days — Goodwill color tags, half-off & bin restocks", description: "Weekly schedule of Goodwill color-tag days, half-off days, senior discounts and outlet bin restocks in Central Florida.", alternates: { canonical: "/deals" } };
const order = [1, 2, 3, 4, 5, 6, 0];
export default async function Deals() {
  const [venues, dealRules] = await Promise.all([getVenues(), getDealRules()]); const name = (s: string) => venues.find((v) => v.slug === s)?.name ?? s;
  const today = new Date().getDay();
  return (<div><PageHead title="Deal Days" sub="Color-tag days, half-off days and bin restocks by weekday" />
    <p className="mb-3 border-l-4 border-cta bg-paper p-2 text-sm"><b>Heads up:</b> schedules marked <i>unverified</i> haven&apos;t been confirmed with the store yet — check signage or call ahead.</p>
    <div className="panel"><div className="panel-head">Weekly schedule</div>
      <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-7">{order.map((d) => <div key={d} className={`bg-white sm:min-h-48 ${d === today ? "ring-2 ring-cta ring-inset" : ""}`}>
        <div className="bg-paper border-b border-line px-2 py-1 text-xs font-bold text-royal">{DAYS[d]}{d === today && " · today"}</div>
        <div className="p-1.5 space-y-1">{dealRules.filter((r) => r.day === d).map((r) => <div key={r.id} className={`pill ${r.color} block whitespace-normal`}>
          {r.label}{r.time && ` · ${t12(r.time)}`}<div className="text-[11px] font-normal">{name(r.venue)}{!r.verified && " · unverified"}</div></div>)}</div></div>)}</div></div>
    <div className="panel mt-4"><div className="panel-head">By store</div><ul>{venues.map((v) => <li key={v.slug} className="border-b border-line px-4 py-2 text-sm last:border-0">
      <Link href={`/stores/${v.slug}`} className="font-bold text-royal hover:underline">{v.name}</Link> <span className="text-gray-600">· {v.city}</span>
      <div>{dealRules.filter((r) => r.venue === v.slug).map((r) => `${DAYS[r.day]}: ${r.label}${r.verified ? "" : " (unverified)"}`).join(" · ") || "No rules yet"}</div></li>)}</ul></div></div>);
}
