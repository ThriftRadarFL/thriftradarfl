import Link from "next/link";
import { getSales, CITIES, citySlug } from "@/lib/data";
import { PageHead, DayBox, Discount, typeLabel } from "@/components/ui";
import FavButton from "@/components/FavButton";
const chip: Record<string, string> = { estate: "bg-coral", auction: "bg-royal", thrift: "bg-teal", outlet_bins: "bg-cta", yard: "bg-[#6b4fa0]" };
const TYPES = ["estate", "auction", "yard", "thrift", "outlet_bins"];
export default async function Home({ searchParams }: { searchParams: Promise<{ city?: string; type?: string; past?: string }> }) {
  const sp = await searchParams; const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const all = [...(await getSales())].sort((a, b) => a.days[0].date.localeCompare(b.days[0].date));
  const sales = all.filter((s) => (sp.past || s.days.some((d) => d.date >= today)) && (!sp.city || citySlug(s.city) === sp.city) && (!sp.type || s.type === sp.type));
  const q = (k: string, v?: string) => { const n = new URLSearchParams(Object.entries({ ...sp, [k]: v }).filter(([, x]) => x) as [string, string][]); const str = n.toString(); return str ? `/?${str}` : "/"; };
  const fl = (on: boolean) => `px-2 py-1 border text-xs font-bold ${on ? "bg-royal text-white border-royal" : "bg-white border-line hover:border-royal"}`;
  const best = (s: (typeof sales)[number]) => Math.max(...s.days.map((d) => d.discountPct ?? 0));
  const featured = sales.filter((s) => best(s) >= 50).slice(0, 4);
  const cities = new Set(sales.map((s) => s.city)).size;
  return (<div>
    <PageHead title="This Week in Central Florida" sub={`${sales.length} sales across ${cities} cities · Daytona, Port Orange, DeLand, Ormond, NSB, Orlando`} />
    {featured.length > 0 && <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 border border-cta-dark bg-cta px-4 py-2 text-sm text-white">
      <span className="font-bold uppercase tracking-wide">Half-off days:</span>
      {featured.map((s) => <Link key={s.slug} href={`/sales/${s.slug}`} className="font-bold underline-offset-2 hover:underline">{s.title} <span className="font-normal text-red-100">· {s.city}</span></Link>)}</div>}
    <div className="mb-3 flex flex-wrap items-center gap-1.5" role="group" aria-label="Filters"><span className="mr-1 text-xs font-bold uppercase text-gray-600">City</span>
      <Link href={q("city")} className={fl(!sp.city)}>All</Link>{Object.entries(CITIES).map(([k, n]) => <Link key={k} href={q("city", k)} className={fl(sp.city === k)}>{n}</Link>)}
      <span className="mr-1 sm:ml-3 text-xs font-bold uppercase text-gray-600">Type</span><Link href={q("type")} className={fl(!sp.type)}>All</Link>
      {TYPES.map((t) => <Link key={t} href={q("type", t)} className={fl(sp.type === t)}>{typeLabel[t]}</Link>)}
      <a href={`/api/calendar${sp.city ? `?city=${sp.city}` : ""}`} className="ml-auto py-2 text-xs underline">Subscribe (calendar feed)</a></div>
    {sales.length === 0 && <p className="panel p-4 text-sm">No upcoming sales match these filters. <Link href="/" className="underline">Clear filters</Link></p>}
    <div className="grid gap-3 lg:grid-cols-2">{sales.map((s) => (<article key={s.slug} className="panel flex flex-col">
      <div className="flex items-start gap-2 border-b border-line px-3 py-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2"><span className={`pill ${chip[s.type] ?? "bg-gray-500"}`}>{typeLabel[s.type] ?? s.type}</span><span className="text-xs text-gray-600">{s.city}, FL {s.zip}</span></div>
          <Link href={`/sales/${s.slug}`} className="mt-0.5 block font-bold text-ink hover:text-royal">{s.title}</Link></div>
        <FavButton slug={s.slug} title={s.title} compact /><Link href={`/sales/${s.slug}`} className="btn-red px-3 py-1 text-xs" aria-label={`View ${s.title}`}>View</Link></div>
      <div className="flex flex-wrap gap-1.5 px-3 py-2">{s.days.map((d) => (<div key={d.date} className="flex items-center gap-1.5 border border-line pr-2">
        <DayBox date={d.date} /><div className="text-xs leading-tight"><div className="font-bold">{d.start}–{d.end}</div><div className="mt-0.5"><Discount pct={d.discountPct} /></div></div></div>))}</div>
    </article>))}</div>
  </div>);
}
