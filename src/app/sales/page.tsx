import Link from "next/link";
import { PageHead } from "@/components/ui";
import { getSales } from "@/lib/data";
export const metadata = { title: "All upcoming estate sales — Central Florida" };
export const dynamic = "force-dynamic";
export default async function SalesIndex() {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const sales = (await getSales())
    .filter((s) => s.days.some((d) => d.date >= today))
    .sort((a, b) => (a.days[0]?.date ?? "").localeCompare(b.days[0]?.date ?? ""));
  return (<div><PageHead title="All upcoming sales" sub={`${sales.length} estate sales across Central Florida, soonest first`} />
    <div className="panel"><div className="divide-y divide-line">{sales.map((s) => (
      <Link key={s.slug} href={`/sales/${s.slug}`} className="block p-3 hover:bg-blue-50">
        <b className="text-royal">{s.title}</b>
        <div className="text-xs text-gray-600">{s.city} · {s.days.map((d) => d.date.slice(5)).join(", ")}</div>
      </Link>))}
      {!sales.length && <div className="p-3 text-sm text-gray-400">No upcoming sales listed yet</div>}
    </div></div>
    <p className="mt-4 text-sm"><Link className="font-bold text-royal hover:underline" href="/weekend">See just this weekend</Link></p></div>);
}
