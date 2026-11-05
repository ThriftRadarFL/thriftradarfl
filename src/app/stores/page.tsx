import Link from "next/link";
import { getVenues, getDealRules } from "@/lib/data";
import StoreToday from "@/components/StoreToday";
import { storeToday } from "@/lib/store-today";
import { todayET } from "@/lib/cities";
import { PageHead, typeLabel } from "@/components/ui";
export const metadata = { title: "Thrift Stores, Goodwill Outlets & Auction Houses", description: "Hours, addresses and deal days for Goodwill stores, outlet bins and auction houses in Central Florida.", alternates: { canonical: "/stores" } };
export const dynamic = "force-dynamic"; // "Today" badges follow the Eastern-time date
const chip: Record<string, string> = { thrift: "bg-teal", outlet_bins: "bg-cta", auction_house: "bg-royal" };
export default async function Stores({ searchParams }: { searchParams: Promise<{ open?: string }> }) {
  const [all, rules, sp] = await Promise.all([getVenues(), getDealRules(), searchParams]); const today = todayET();
  const st = new Map(all.map((v) => [v.slug, storeToday(v.slug, rules, today, v.hoursJson)]));
  const openCount = all.filter((v) => st.get(v.slug)?.openNow === "open").length; const onlyOpen = sp.open === "1";
  const venues = onlyOpen ? all.filter((v) => st.get(v.slug)?.openNow === "open") : all;
  return (<div><PageHead title="Thrift Stores, Outlets & Auctions" sub={`${all.length} locations tracked`} />
    <p className="mb-2 text-sm" aria-live="polite">{onlyOpen ? <><b>{openCount} open right now</b> (Eastern time, from listed hours) · <Link href="/stores" className="link">Show all {all.length}</Link></> : <><Link href="/stores?open=1" className="btn-gray px-3 py-1.5 text-sm">● Open now ({openCount})</Link> <span className="text-xs text-gray-600">based on listed hours, Eastern time</span></>}</p>
    <p className="mb-3 text-sm"><Link href="/stores/compare" className="btn-gray px-3 py-1.5 text-sm">⇄ Compare stores side by side</Link> <Link href="/stores/report-cards" className="btn-gray px-3 py-1.5 text-sm">▦ Store report cards</Link></p>
    <div className="panel overflow-x-auto"><table className="w-full text-sm">
      <thead className="bg-royal text-left text-xs uppercase text-white"><tr><th className="px-3 py-2">Type</th><th className="px-3 py-2">Name</th><th className="px-3 py-2 hidden md:table-cell">Address</th><th className="px-3 py-2 hidden sm:table-cell">City</th><th className="px-3 py-2 hidden sm:table-cell">Today</th><th className="px-3 py-2 hidden sm:table-cell">Phone</th><th className="hidden sm:table-cell"><span className="sr-only">Actions</span></th></tr></thead>
      <tbody>{venues.map((v) => (<tr key={v.slug} className="border-b border-line last:border-0 even:bg-paper/60">
        <td className="px-3 py-2"><span className={`pill ${chip[v.type] ?? "bg-gray-700"}`}>{typeLabel[v.type] ?? v.type}</span></td>
        <td className="px-3 py-2"><Link href={`/stores/${v.slug}`} className="link">{v.name}</Link>
          <div className="mt-0.5 flex flex-wrap items-center gap-1 text-xs text-gray-700 sm:hidden">{v.city} <StoreToday compact t={st.get(v.slug)!} /></div></td>
        <td className="px-3 py-2 hidden md:table-cell text-gray-700">{v.address}</td><td className="px-3 py-2 hidden sm:table-cell">{v.city} {v.zip}</td>
        <td className="px-3 py-2 hidden sm:table-cell"><StoreToday compact t={st.get(v.slug)!} /></td>
        <td className="px-3 py-2 hidden sm:table-cell text-gray-700">{v.phone ?? "—"}</td>
        <td className="px-3 py-2 text-right hidden sm:table-cell"><Link href={`/stores/${v.slug}`} className="btn-gray px-2 py-1 text-xs">Details</Link></td></tr>))}{!venues.length && <tr><td colSpan={7} className="px-3 py-4 text-gray-700">No stores are open right now by their listed hours. <Link href="/stores" className="link">Show all stores</Link> or <Link href="/deals" className="link">see deal days</Link>.</td></tr>}</tbody></table></div>
  </div>);
}
