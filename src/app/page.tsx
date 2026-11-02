import Link from "next/link";
import { getSales, dataMode } from "@/lib/data";
export default async function Home() {
  const sales = await getSales();
  return (<div className="space-y-4">
    <h1 className="text-2xl font-bold">This Week in Central Florida</h1>
    <p className="text-xs text-gray-500">Data mode: {dataMode}</p>
    {sales.map((s) => (<div key={s.slug} className="rounded border p-3">
      <Link href={`/sales/${s.slug}`} className="font-semibold hover:underline">{s.title}</Link>
      <div className="text-sm text-gray-600">{s.type} · {s.city} {s.zip}</div>
      <ul className="text-sm">{s.days.map((d) => <li key={d.date}>{d.date} {d.start}–{d.end}{d.discountPct ? ` · ${d.discountPct}% off` : ""}</li>)}</ul>
    </div>))}
  </div>);
}
