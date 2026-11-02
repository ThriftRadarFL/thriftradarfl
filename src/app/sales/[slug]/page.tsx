import { notFound } from "next/navigation";
import { getSale } from "@/lib/data";
export default async function Sale({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const s = await getSale(slug); if (!s) notFound();
  return (<div className="space-y-2"><h1 className="text-2xl font-bold">{s.title}</h1><p>{s.city} {s.zip} · pays: {s.paymentMethods.join(", ")}</p>
    <ul>{s.days.map((d) => <li key={d.date}>{d.date} {d.start}–{d.end}{d.discountPct ? ` · ${d.discountPct}% off` : ""}</li>)}</ul>
    <a className="text-blue-600 underline" href={s.sourceUrl}>Original listing</a><p className="text-sm text-gray-500">TODO: .ics download</p></div>);
}
