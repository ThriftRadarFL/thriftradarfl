import Link from "next/link";
import { getVenues } from "@/lib/data";
import { PageHead, typeLabel } from "@/components/ui";
export const metadata = { title: "Thrift Stores, Goodwill Outlets & Auction Houses", description: "Hours, addresses and deal days for Goodwill stores, outlet bins and auction houses in Central Florida.", alternates: { canonical: "/stores" } };
const chip: Record<string, string> = { thrift: "bg-teal", outlet_bins: "bg-cta", auction_house: "bg-royal" };
export default async function Stores() {
  const venues = await getVenues();
  return (<div><PageHead title="Thrift Stores, Outlets & Auctions" sub={`${venues.length} locations tracked`} />
    <div className="panel"><table className="w-full text-sm">
      <thead className="bg-royal text-left text-xs uppercase text-white"><tr><th className="px-3 py-2">Type</th><th className="px-3 py-2">Name</th><th className="px-3 py-2 hidden md:table-cell">Address</th><th className="px-3 py-2">City</th><th className="px-3 py-2 hidden sm:table-cell">Phone</th><th /></tr></thead>
      <tbody>{venues.map((v) => (<tr key={v.slug} className="border-b border-line last:border-0 even:bg-paper/60">
        <td className="px-3 py-2"><span className={`pill ${chip[v.type] ?? "bg-gray-500"}`}>{typeLabel[v.type] ?? v.type}</span></td>
        <td className="px-3 py-2"><Link href={`/stores/${v.slug}`} className="link">{v.name}</Link></td>
        <td className="px-3 py-2 hidden md:table-cell text-gray-700">{v.address}</td><td className="px-3 py-2">{v.city} {v.zip}</td>
        <td className="px-3 py-2 hidden sm:table-cell text-gray-700">{v.phone ?? "—"}</td>
        <td className="px-3 py-2 text-right"><Link href={`/stores/${v.slug}`} className="btn-gray px-2 py-1 text-xs">Details</Link></td></tr>))}</tbody></table></div>
  </div>);
}
