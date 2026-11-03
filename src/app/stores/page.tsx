import Link from "next/link";
import { getVenues, getDealRules } from "@/lib/data";
import StoreToday from "@/components/StoreToday";
import { storeToday } from "@/lib/store-today";
import { todayET } from "@/lib/cities";
import { PageHead, typeLabel } from "@/components/ui";
export const metadata = { title: "Thrift Stores, Goodwill Outlets & Auction Houses", description: "Hours, addresses and deal days for Goodwill stores, outlet bins and auction houses in Central Florida.", alternates: { canonical: "/stores" } };
export const dynamic = "force-dynamic"; // "Today" badges follow the Eastern-time date
const chip: Record<string, string> = { thrift: "bg-teal", outlet_bins: "bg-cta", auction_house: "bg-royal" };
export default async function Stores() {
  const [venues, rules] = await Promise.all([getVenues(), getDealRules()]); const today = todayET();
  return (<div><PageHead title="Thrift Stores, Outlets & Auctions" sub={`${venues.length} locations tracked`} />
    <div className="panel overflow-x-auto"><table className="w-full text-sm">
      <thead className="bg-royal text-left text-xs uppercase text-white"><tr><th className="px-3 py-2">Type</th><th className="px-3 py-2">Name</th><th className="px-3 py-2 hidden md:table-cell">Address</th><th className="px-3 py-2">City</th><th className="px-3 py-2">Today</th><th className="px-3 py-2 hidden sm:table-cell">Phone</th><th className="hidden sm:table-cell"><span className="sr-only">Actions</span></th></tr></thead>
      <tbody>{venues.map((v) => (<tr key={v.slug} className="border-b border-line last:border-0 even:bg-paper/60">
        <td className="px-3 py-2"><span className={`pill ${chip[v.type] ?? "bg-gray-700"}`}>{typeLabel[v.type] ?? v.type}</span></td>
        <td className="px-3 py-2"><Link href={`/stores/${v.slug}`} className="link">{v.name}</Link></td>
        <td className="px-3 py-2 hidden md:table-cell text-gray-700">{v.address}</td><td className="px-3 py-2">{v.city}<span className="hidden sm:inline"> {v.zip}</span></td>
        <td className="px-3 py-2"><StoreToday compact t={storeToday(v.slug, rules, today, v.hoursJson)} /></td>
        <td className="px-3 py-2 hidden sm:table-cell text-gray-700">{v.phone ?? "—"}</td>
        <td className="px-3 py-2 text-right hidden sm:table-cell"><Link href={`/stores/${v.slug}`} className="btn-gray px-2 py-1 text-xs">Details</Link></td></tr>))}</tbody></table></div>
  </div>);
}
