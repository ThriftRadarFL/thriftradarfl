import { notFound } from "next/navigation";
import { getSale } from "@/lib/data";
import { PageHead, DayBox, Discount, typeLabel } from "@/components/ui";
export default async function Sale({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const s = await getSale(slug); if (!s) notFound();
  return (<div><PageHead title={s.title} sub={`${typeLabel[s.type] ?? s.type} · ${s.city}, FL ${s.zip}`} />
    <div className="grid gap-4 md:grid-cols-3">
      <div className="panel md:col-span-2"><div className="panel-head">Sale schedule</div>
        <ul>{s.days.map((d) => <li key={d.date} className="flex items-center gap-4 border-b border-line px-4 py-3 last:border-0">
          <DayBox date={d.date} /><span className="font-bold">{d.start} – {d.end}</span><span className="ml-auto"><Discount pct={d.discountPct} /></span></li>)}</ul></div>
      <div className="panel"><div className="panel-head">Details</div><div className="p-4 space-y-3 text-sm">
        <div><div className="font-bold text-gray-500 text-xs uppercase">Payment</div>{s.paymentMethods.join(", ")}</div>
        <a className="btn-red block text-center" href={s.sourceUrl}>Original Listing</a>
        <span className="btn-gray block text-center opacity-60 cursor-not-allowed">Add to Calendar (soon)</span></div></div>
    </div></div>);
}
