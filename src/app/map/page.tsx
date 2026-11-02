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
  // Keyless SVG plot (equirectangular, fine at county scale). Replaced by MapLibre + MapTiler tiles once NEXT_PUBLIC_MAPTILER_KEY is set.
  const geo = pins.map((p) => ({ ...p, lng: [...venues, ...sales].find((x) => ("slug" in x) && x.slug === p.key)?.lng ?? 0 })).filter((p) => p.lat && p.lng);
  const [minLat, maxLat] = [Math.min(...geo.map((p) => p.lat)) - 0.05, Math.max(...geo.map((p) => p.lat)) + 0.05];
  const [minLng, maxLng] = [Math.min(...geo.map((p) => p.lng)) - 0.05, Math.max(...geo.map((p) => p.lng)) + 0.05];
  const W = 800, H = Math.round(W * ((maxLat - minLat) / ((maxLng - minLng) * Math.cos((minLat * Math.PI) / 180))));
  const X = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * W, Y = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * H;
  const fill: Record<string, string> = { estate: "#e0603f", auction: "#1b3a8a", auction_house: "#1b3a8a", thrift: "#1f9e8f", outlet_bins: "#d7262e", yard: "#6b4fa0" };
  const labels = Object.entries(geo.reduce<Record<string, { lat: number; lng: number; n: number }>>((a, p) => { const c = (a[p.city] ??= { lat: 0, lng: 0, n: 0 }); c.lat += p.lat; c.lng += p.lng; c.n++; return a; }, {}));
  return (<div><PageHead title="Sale Map" sub={`${pins.length} pins in ${byCity.length} cities · list view, north to south (interactive map coming)`} />
    <div className="panel mb-3 overflow-hidden"><div className="panel-head">Overview</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full max-h-[520px] bg-[#eaf2f8]" role="img" aria-label="Plot of sales and stores by location">
        {labels.map(([city, c]) => <text key={city} x={X(c.lng / c.n) + 10} y={Y(c.lat / c.n) - 10} fontSize="14" fill="#555" fontWeight="bold">{city}</text>)}
        {geo.map((p) => <a key={p.key} href={p.href}><circle cx={X(p.lng)} cy={Y(p.lat)} r="8" fill={fill[p.type] ?? "#888"} stroke="#fff" strokeWidth="2"><title>{p.name}</title></circle></a>)}
      </svg><p className="px-3 py-1 text-[11px] text-gray-500">Approximate positions. Interactive street map coming soon.</p></div>
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
