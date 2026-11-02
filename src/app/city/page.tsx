import Link from "next/link";
import { getSales, getVenues } from "@/lib/data";
import { cityList, todayET } from "@/lib/cities";
import { PageHead } from "@/components/ui";
export const metadata = { title: "Cities — Central Florida estate sales & thrift deals", description: "Browse estate sales, auctions and thrift stores by city across Volusia, Orange and Seminole counties: Port Orange, Daytona Beach, DeLand, Orlando, Sanford and more.", alternates: { canonical: "/city" } };
export const dynamic = "force-dynamic";
export default async function Cities() {
  const [sales, venues] = await Promise.all([getSales(), getVenues()]); const list = cityList(sales, venues, todayET());
  return (<div><PageHead title="Browse by city" sub={`${list.length} Central Florida cities with estate sales or thrift stores`} />
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      {list.map((c) => <Link key={c.slug} href={`/city/${c.slug}`} className="panel block p-4 hover:border-royal"><b className="text-lg text-royal">{c.name}, FL</b>
        <div className="text-xs text-gray-600">{c.sales} upcoming sale{c.sales === 1 ? "" : "s"} · {c.venues} store{c.venues === 1 ? "" : "s"}</div></Link>)}
    </div></div>);
}
