import Link from "next/link";
import { getSales, getVenues } from "@/lib/data";
import { searchAll } from "@/lib/search";
import { PageHead, typeLabel } from "@/components/ui";
export const metadata = { title: "Search sales & stores", alternates: { canonical: "/search" }, robots: { index: false, follow: true } };
export const dynamic = "force-dynamic"; // live sale/store links (no stale prerender)
export default async function Search({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 100);
  const r = q ? searchAll(q, await getSales(), await getVenues()) : { sales: [], venues: [] };
  return (<div><PageHead title={q ? `Search: “${q}”` : "Search"} sub={q ? `${r.sales.length} sales · ${r.venues.length} stores` : "Find sales and stores by name, city, ZIP or type"} />
    <form action="/search" role="search" aria-label="Search results filter" className="mb-4 flex max-w-xl gap-2"><label htmlFor="sq" className="sr-only">Search sales and stores</label>
      <input id="sq" name="q" type="search" defaultValue={q} placeholder="e.g. DeLand, mid-century, 32129, bins" className="flex-1 border border-line bg-white px-3 py-2 text-sm" /><button className="btn-red">Search</button></form>
    <div className="search-frame">
    {!q && <p className="panel p-4 text-sm text-gray-600">Type a city, ZIP, store name, or item keyword above — results show here.</p>}
    {q && !r.sales.length && !r.venues.length && <p className="panel p-4 text-sm">Nothing matched “{q}”. Try a city name, a ZIP code, or browse <Link href="/sales" className="link">all sales</Link> and <Link href="/stores" className="link">stores</Link>.</p>}
    <div className="grid gap-4 md:grid-cols-2">
      {r.sales.length > 0 && <section className="panel"><h2 className="panel-head">Sales ({r.sales.length})</h2><ul>{r.sales.map((s) => <li key={s.slug} className="border-b border-line px-4 py-2 text-sm last:border-0">
        <Link href={`/sales/${s.slug}`} className="link">{s.title}</Link><div className="text-xs text-gray-600">{typeLabel[s.type] ?? s.type} · {s.city} {s.zip} · {s.days[0]?.date}</div></li>)}</ul></section>}
      {r.venues.length > 0 && <section className="panel"><h2 className="panel-head">Stores ({r.venues.length})</h2><ul>{r.venues.map((v) => <li key={v.slug} className="border-b border-line px-4 py-2 text-sm last:border-0">
        <Link href={`/stores/${v.slug}`} className="link">{v.name}</Link><div className="text-xs text-gray-600">{typeLabel[v.type] ?? v.type} · {v.address}, {v.city}</div></li>)}</ul></section>}
    </div></div></div>);
}
