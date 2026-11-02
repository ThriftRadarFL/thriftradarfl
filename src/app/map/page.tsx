import Link from "next/link";
import { getVenues, getSales } from "@/lib/data";
import { PageHead, typeLabel } from "@/components/ui";
export const metadata = { title: "Sale Map — estate sales & thrift stores", description: "Map of upcoming estate sales, auctions, yard sales and thrift stores across Central Florida.", alternates: { canonical: "/map" } };
const dot: Record<string, string> = { estate: "bg-coral", auction: "bg-royal", auction_house: "bg-royal", thrift: "bg-teal", outlet_bins: "bg-cta", yard: "bg-[#6b4fa0]" };
export default async function MapPage() {
  const venues = await getVenues(); const sales = await getSales();
  const pins = [...venues.map((v) => ({ key: v.slug, href: `/stores/${v.slug}`, name: v.name, type: v.type, city: v.city, lat: v.lat })),
    ...sales.map((s) => ({ key: s.slug, href: `/sales/${s.slug}`, name: s.title, type: s.type, city: s.city, lat: s.lat }))];
  const byCity = Object.entries(pins.reduce<Record<string, typeof pins>>((a, p) => ((a[p.city] ??= []).push(p), a), {}))
    .sort((a, b) => Math.max(...b[1].map((p) => p.lat)) - Math.max(...a[1].map((p) => p.lat)));
  return (<div><PageHead title="Sale Map" sub={`${pins.length} pins in ${byCity.length} cities · list view, north to south (interactive map coming)`} />
    <div className="grid gap-3 md:grid-cols-4">
      <div className="md:col-span-3 grid gap-3 sm:grid-cols-2">{byCity.map(([city, ps]) => (<div key={city} className="panel">
        <div className="panel-head flex justify-between"><span>{city}</span><span className="font-normal">{ps.length}</span></div>
        <ul className="divide-y divide-line text-sm">{ps.map((p) => <li key={p.key} className="flex items-center gap-2 px-3 py-1.5">
          <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dot[p.type] ?? "bg-gray-400"}`} /><Link href={p.href} className="truncate hover:text-royal">{p.name}</Link>
          <span className="ml-auto shrink-0 text-[11px] text-gray-500">{typeLabel[p.type] ?? p.type}</span></li>)}</ul></div>))}</div>
      <div className="panel self-start"><div className="panel-head">Legend</div><ul className="space-y-1.5 p-3 text-sm">
        {[["estate", "Estate sale"], ["auction", "Auction"], ["thrift", "Thrift store"], ["outlet_bins", "Outlet bins"], ["yard", "Yard sale"]].map(([t, l]) =>
          <li key={t} className="flex items-center gap-2"><span className={`h-3 w-3 rounded-full ${dot[t]}`} />{l}</li>)}</ul></div>
    </div></div>);
}
