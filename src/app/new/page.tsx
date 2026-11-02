import Link from "next/link";
import { PageHead, DayBox, Discount, typeLabel } from "@/components/ui";
import FavButton from "@/components/FavButton";
import { getSales } from "@/lib/data";
import { recentlyAdded } from "@/lib/new-sales";
import { range12 } from "@/lib/time";
export const metadata = { title: "New this week — just-listed estate sales", description: "Estate sales, auctions and thrift events newly listed on ThriftRadarFL in the last 7 days, newest first.",
  alternates: { canonical: "/new", types: { "application/atom+xml": "/feed.xml" } } };
export const dynamic = "force-dynamic";
const ago = (iso: string, now: number) => { const h = Math.max(0, Math.round((now - Date.parse(iso)) / 3_600_000));
  return h < 1 ? "just now" : h < 24 ? `${h} hr ago` : `${Math.round(h / 24)} day${Math.round(h / 24) > 1 ? "s" : ""} ago`; };
export default async function NewThisWeek() {
  const now = new Date(); const all = await getSales(); const fresh = recentlyAdded(all, now, 7);
  return (<div><PageHead title="New this week" sub={`${fresh.length} sale${fresh.length === 1 ? "" : "s"} listed in the last 7 days · newest first`} />
    <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
      <a href="/feed.xml" className="btn-gray inline-flex items-center gap-1"><span aria-hidden="true" className="inline-block h-3 w-3 rounded-[2px] bg-gradient-to-b from-[#ff9a3c] to-[#e8650c]" /> Atom / RSS feed</a>
      <Link href="/digest" className="btn-red">Get new sales by email</Link>
      <span className="text-xs text-gray-600">Paste <code className="break-all">/feed.xml</code> into any feed reader to get new listings.</span></div>
    <section className="panel"><h2 className="panel-head">Just listed</h2>
      <ul className="divide-y divide-line">{fresh.map((s) => (<li key={s.slug} className="flex items-start gap-3 p-3">
        <DayBox date={s.days.find((d) => d.date >= now.toLocaleDateString("en-CA", { timeZone: "America/New_York" }))?.date ?? s.days[0].date} />
        <div className="min-w-0 flex-1"><Link href={`/sales/${s.slug}`} className="font-bold text-royal hover:underline">{s.title}</Link>
          <div className="text-xs text-gray-600">{typeLabel[s.type] ?? s.type} · {s.city} · {s.days.length} day{s.days.length > 1 ? "s" : ""}, {range12(s.days[0].start, s.days[0].end)}</div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5"><span className="pill bg-cta">NEW</span><span className="text-[11px] text-gray-600">listed {ago(s.addedAt!, now.getTime())}</span>
            {Math.max(...s.days.map((d) => d.discountPct ?? 0)) > 0 && <Discount pct={Math.max(...s.days.map((d) => d.discountPct ?? 0))} />}</div></div>
        <FavButton slug={s.slug} title={s.title} compact /></li>))}
        {!fresh.length && <li className="p-4 text-sm text-gray-600">Nothing new in the last 7 days. <Link href="/sales" className="font-bold text-royal underline">Browse all upcoming sales</Link> or <Link href="/submit" className="font-bold text-royal underline">submit one</Link>.</li>}
      </ul></section></div>);
}
