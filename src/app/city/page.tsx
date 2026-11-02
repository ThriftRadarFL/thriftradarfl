import Link from "next/link";
import { CITIES, getSales, getVenues } from "@/lib/data";
import { PageHead } from "@/components/ui";
export const metadata = { title: "Cities — Central Florida estate sales & thrift deals", description: "Browse estate sales and thrift stores by city: Port Orange, Daytona Beach, DeLand, New Smyrna Beach, Ormond Beach.", alternates: { canonical: "/city" } };
export const dynamic = "force-dynamic";
export default async function Cities() {
  const [sales, venues] = await Promise.all([getSales(), getVenues()]);
  return (<div><PageHead title="Browse by city" sub="Estate sales and thrift stores across Volusia County" />
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {Object.entries(CITIES).map(([k, n]) => { const s = sales.filter((x) => x.city === n).length; const v = venues.filter((x) => x.city === n).length;
        return <Link key={k} href={`/city/${k}`} className="panel block p-4 hover:border-royal"><b className="text-lg text-royal">{n}, FL</b><div className="text-xs text-gray-600">{s} upcoming sale{s === 1 ? "" : "s"} · {v} store{v === 1 ? "" : "s"}</div></Link>; })}
    </div></div>);
}
