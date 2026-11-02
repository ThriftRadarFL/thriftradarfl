import Link from "next/link";
import { notFound } from "next/navigation";
import { CITIES, getSales, getVenues } from "@/lib/data";
import { PageHead, DayBox, Discount, typeLabel } from "@/components/ui";
type P = { params: Promise<{ city: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(CITIES).map((city) => ({ city })); }
export async function generateMetadata({ params }: P) {
  const n = CITIES[(await params).city]; return { title: `Estate Sales & Thrift Deals in ${n}, FL | ThriftRadarFL`, description: `Upcoming estate sales, auctions, yard sales and thrift store deal days in ${n}, Florida.` };
}
export default async function City({ params }: P) {
  const { city } = await params; const name = CITIES[city]; if (!name) notFound();
  const [sales, venues] = await Promise.all([getSales(), getVenues()]);
  const s = sales.filter((x) => x.city === name); const v = venues.filter((x) => x.city === name);
  return (<div><PageHead title={`Estate Sales & Thrift Deals in ${name}, FL`} sub={`${s.length} upcoming sales · ${v.length} stores tracked`} />
    <p className="mb-4 text-sm">ThriftRadarFL tracks estate sales, auctions, yard sales and thrift-store deal days around {name} and Volusia County. Add any sale to your calendar in one tap.</p>
    <div className="grid gap-4 md:grid-cols-3">
      <div className="panel md:col-span-2"><div className="panel-head">Upcoming sales</div>
        {s.length ? <ul>{s.map((x) => <li key={x.slug} className="flex items-center gap-3 border-b border-line px-4 py-2 last:border-0">
          <DayBox date={x.days[0].date} /><div><Link href={`/sales/${x.slug}`} className="font-bold hover:text-royal">{x.title}</Link><div className="text-xs text-gray-500">{typeLabel[x.type] ?? x.type} · {x.days.length} day(s)</div></div>
          <span className="ml-auto"><Discount pct={Math.max(...x.days.map((d) => d.discountPct))} /></span></li>)}</ul> : <p className="p-4 text-sm">No sales listed yet — check back Thursday.</p>}</div>
      <div className="panel"><div className="panel-head">Stores</div>{v.length ? <ul>{v.map((x) => <li key={x.slug} className="border-b border-line px-4 py-2 text-sm"><Link href={`/stores/${x.slug}`} className="font-bold hover:text-royal">{x.name}</Link><div className="text-xs">{x.address}</div></li>)}</ul> : <p className="p-4 text-sm">No stores tracked yet.</p>}
        <div className="border-t border-line p-3 text-xs">Other cities: {Object.entries(CITIES).filter(([k]) => k !== city).map(([k, n]) => <Link key={k} href={`/city/${k}`} className="mr-2 underline">{n}</Link>)}</div></div>
    </div></div>);
}
