import Link from "next/link";
import { getVenues } from "@/lib/data";
export default async function Stores() {
  const venues = await getVenues();
  return (<div className="space-y-3"><h1 className="text-2xl font-bold">Thrift Stores, Outlets & Auctions</h1>
    {venues.map((v) => (<div key={v.slug} className="rounded border p-3"><Link href={`/stores/${v.slug}`} className="font-semibold hover:underline">{v.name}</Link>
      <div className="text-sm text-gray-600">{v.type} · {v.address}, {v.city} {v.zip}</div></div>))}
  </div>);
}
