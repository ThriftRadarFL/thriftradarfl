import { range12 } from "@/lib/time";
import Link from "next/link";
import { getSales, getVenues, getDealRules, CITIES, citySlug } from "@/lib/data";
import { DayBox, Discount, typeLabel } from "@/components/ui";
import { homeSummary } from "@/lib/home";
import { DAYS } from "@/lib/deal-rules";
import { t12 } from "@/lib/time";
import { DEFAULT_ZIP } from "@/lib/zips";
import FavButton from "@/components/FavButton";
import { cleanTags, TAG_LABEL } from "@/lib/flip-tips";
const chip: Record<string, string> = { estate: "bg-coral", auction: "bg-royal", thrift: "bg-teal", outlet_bins: "bg-cta", yard: "bg-[#6b4fa0]" };
const TYPES = ["estate", "auction", "yard", "thrift", "outlet_bins"];
export const dynamic = "force-dynamic"; // live sale/store links (no stale prerender)
export default async function Home({ searchParams }: { searchParams: Promise<{ city?: string; type?: string; past?: string }> }) {
  const sp = await searchParams; const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const [rawSales, venues, rules] = await Promise.all([getSales(), getVenues(), getDealRules()]);
  const sum = homeSummary(rawSales, venues, rules, today); const dow = new Date(today + "T12:00:00Z").getUTCDay();
  const all = [...rawSales].sort((a, b) => a.days[0].date.localeCompare(b.days[0].date));
  const sales = all.filter((s) => (sp.past || s.days.some((d) => d.date >= today)) && (!sp.city || citySlug(s.city) === sp.city) && (!sp.type || s.type === sp.type));
  const q = (k: string, v?: string) => { const n = new URLSearchParams(Object.entries({ ...sp, [k]: v }).filter(([, x]) => x) as [string, string][]); const str = n.toString(); return str ? `/?${str}` : "/"; };
  const fl = (on: boolean) => `px-2 py-1 border text-xs font-bold ${on ? "bg-royal text-white border-royal" : "bg-white border-line hover:border-royal"}`;
  const best = (s: (typeof sales)[number]) => Math.max(...s.days.map((d) => d.discountPct ?? 0));
  const featured = sales.filter((s) => best(s) >= 50).slice(0, 4);
  return (<div>
    <section aria-labelledby="home-h1" className="hero-gloss -mx-4 -mt-4 mb-4 border-b-4 border-cta px-4 py-5 text-white sm:px-6 sm:py-7">
      <div className="grid gap-5 lg:grid-cols-[1fr_380px] lg:items-start">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#ffd34d]">Volusia · Flagler · Orange · Seminole</p>
          <h1 id="home-h1" className="mt-1 text-[1.65rem] leading-tight [text-shadow:0_1px_2px_rgba(0,0,0,0.4)] sm:text-4xl">This Week in Central Florida</h1>
          <p className="mt-2 max-w-xl text-sm text-blue-100 sm:text-base">Every estate sale, auction and thrift-store deal day in one place — <b className="text-white">{sum.upcoming} sales</b> across {sum.cities} cities and <b className="text-white">{sum.stores} stores</b> with their color-tag, half-off and bin days.</p>
          <form action="/weekend" className="mt-4 max-w-lg rounded-sm border border-[#0a2f70] bg-white/10 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.2)]" aria-label="Find sales near you">
            <label htmlFor="hero-zip" className="block text-sm font-bold">Find this weekend&apos;s sales near you</label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              <input id="hero-zip" name="zip" inputMode="numeric" pattern="[0-9]{5}" maxLength={5} autoComplete="postal-code" placeholder={`ZIP, e.g. ${DEFAULT_ZIP}`} title="5-digit Florida ZIP code" className="w-36 rounded-sm border border-[#0a2f70] bg-white px-3 py-2 text-ink" />
              <label htmlFor="hero-r" className="sr-only">Distance</label>
              <select id="hero-r" name="r" defaultValue="25" className="rounded-sm border border-[#0a2f70] bg-white px-2 py-2 text-sm text-ink"><option value="10">within 10 mi</option><option value="25">within 25 mi</option><option value="50">within 50 mi</option><option value="any">any distance</option></select>
              <button className="btn-gloss">Show sales near me ›</button></div>
            <p className="mt-1.5 text-xs text-blue-100">No account needed. Or browse <Link href="/today" className="font-bold text-white underline">today</Link>, <Link href="/map" className="font-bold text-white underline">the map</Link> or <Link href="/city" className="font-bold text-white underline">your city</Link>.</p>
          </form>
        </div>
        <div className="motion-today overflow-hidden rounded-sm border border-[#0a2f70] bg-white text-ink shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
          <h2 className="panel-head flex items-center justify-between"><span>Today · {DAYS[dow]} {Number(today.slice(5, 7))}/{Number(today.slice(8))}</span><Link href="/today" className="text-xs font-normal normal-case tracking-normal text-white underline">Full list ›</Link></h2>
          <dl className="grid grid-cols-3 border-b border-line text-center">
            {[["Open today", sum.openToday, "/today"], ["Deal days", sum.todayDealCount, "/deals"], ["This weekend", sum.weekendSales, "/weekend"]].map(([l, n, h]) => <div key={l as string} className="flex flex-col-reverse border-r border-line px-1 py-2 last:border-0">
              <dt className="text-[11px] font-bold uppercase text-gray-600">{l}</dt><dd className="text-2xl font-bold text-royal"><Link href={h as string} className="hover:underline">{n}</Link></dd></div>)}</dl>
          <ul className="text-sm">{sum.todayDeals.map((d) => <li key={d.id} className="flex items-center gap-2 border-b border-line px-3 py-2 last:border-0">
            <span className={`pill ${d.color} w-14 shrink-0 text-center`}>{d.discountPct ? `${d.discountPct}%` : "Deal"}</span>
            <span className="min-w-0 flex-1"><Link href={`/stores/${d.venue}`} className="block truncate font-bold text-royal hover:underline">{d.storeName}</Link><span className="block truncate text-xs text-gray-600">{d.label}{d.time ? ` · ${t12(d.time)}` : ""}{!d.verified && " · unverified"}</span></span></li>)}
            {!sum.todayDeals.length && <li className="px-3 py-3 text-sm text-gray-600">No store deal days today. <Link href="/deals/week" className="link">See this week&apos;s sheet</Link></li>}</ul>
        </div>
      </div>
    </section>
    <nav aria-label="Quick links" className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {([["/today", "📍", "Today", "Open now + deals", "bg-cta"], ["/weekend", "🗓", "This weekend", "Fri–Sun near you", "bg-royal"], ["/deals", "🏷", "Deal days", "Color tags & 50% off", "bg-coral"], ["/map", "🗺", "Map", "Every sale & store", "bg-teal"], ["/plan", "🚗", "Route planner", "Best driving order", "bg-[#6b4fa0]"], ["/digest", "✉", "Weekly digest", "Thursday email", "bg-royal-dark"]] as const).map(([h, i, l, d, bg]) =>
        <Link key={h} href={h} className="tile"><span aria-hidden="true" className={`tile-icon ${bg}`}>{i}</span><span className="min-w-0"><span className="block font-bold text-royal">{l}</span><span className="block truncate text-xs text-gray-600">{d}</span></span></Link>)}
    </nav>
    <details className="panel mb-4 group" open={!sp.city && !sp.type}>
      <summary className="panel-head cursor-pointer list-none [&::-webkit-details-marker]:hidden"><span aria-hidden="true" className="mr-1 inline-block transition-transform group-open:rotate-90">▸</span>New here? How ThriftRadarFL works</summary>
      <ol className="grid gap-0 sm:grid-cols-3">{[["1", "Pick your area", "Enter your ZIP above or open a city page. We cover Daytona, Port Orange, DeLand, New Smyrna, Ormond, Orlando and more."], ["2", "Catch the deal days", "Stores rotate color tags, half-off days and bin restocks. We list them weekly — schedules marked “unverified” are still being confirmed."], ["3", "Save, route & go", "Tap ♡ on sales you like, then the Route planner orders your stops. Add the calendar feed so you never miss a Saturday."]].map(([n, t, d]) =>
        <li key={n} className="flex gap-3 border-b border-line p-3 last:border-0 sm:border-b-0 sm:border-r"><span aria-hidden="true" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-cta bg-white font-bold text-cta">{n}</span><span><b className="block text-royal">{t}</b><span className="text-xs text-gray-700">{d}</span></span></li>)}</ol>
    </details>
    <h2 className="mb-2 flex items-baseline gap-2 border-b-2 border-royal pb-1 text-lg text-royal">Upcoming sales <span className="text-sm font-normal text-gray-600">{sales.length} listed</span></h2>
    {featured.length > 0 && <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-1 border border-cta-dark bg-cta px-4 py-2 text-sm text-white">
      <span className="font-bold uppercase tracking-wide">Half-off days:</span>
      {featured.map((s) => <Link key={s.slug} href={`/sales/${s.slug}`} className="font-bold underline-offset-2 hover:underline">{s.title} <span className="font-normal text-red-100">· {s.city}</span></Link>)}</div>}
    <div className="mb-3 flex flex-wrap items-center gap-1.5" role="group" aria-label="Filters"><span className="mr-1 text-xs font-bold uppercase text-gray-600">City</span>
      <Link href={q("city")} className={fl(!sp.city)}>All</Link>{Object.entries(CITIES).map(([k, n]) => <Link key={k} href={q("city", k)} className={fl(sp.city === k)}>{n}</Link>)}
      <span className="mr-1 sm:ml-3 text-xs font-bold uppercase text-gray-600">Type</span><Link href={q("type")} className={fl(!sp.type)}>All</Link>
      {TYPES.map((t) => <Link key={t} href={q("type", t)} className={fl(sp.type === t)}>{typeLabel[t]}</Link>)}
      <a href={`/api/calendar${sp.city ? `?city=${sp.city}` : ""}`} className="ml-auto py-2 text-xs underline">Subscribe (calendar feed)</a></div>
    {sales.length === 0 && <p className="panel p-4 text-sm">No upcoming sales match these filters. <Link href="/" className="underline">Clear filters</Link></p>}
    <div className="grid min-w-0 gap-3 lg:grid-cols-2">{sales.map((s) => (<article key={s.slug} className="panel flex min-w-0 flex-col">
      <div className="flex items-start gap-2 border-b border-line px-3 py-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2"><span className={`pill ${chip[s.type] ?? "bg-gray-700"}`}>{typeLabel[s.type] ?? s.type}</span><span className="text-xs text-gray-600">{s.city}, FL {s.zip}</span></div>
          <Link href={`/sales/${s.slug}`} className="mt-0.5 block font-bold text-ink hover:text-royal">{s.title}</Link>
          {!!s.tags?.length && <div className="mt-1 flex flex-wrap gap-1">{cleanTags(s.tags).map((t) => <span key={t} className="rounded-sm border border-line bg-paper px-1.5 text-[11px] text-gray-700">{TAG_LABEL[t]}</span>)}</div>}</div>
        <FavButton slug={s.slug} title={s.title} compact /><Link href={`/sales/${s.slug}`} className="btn-red px-3 py-1 text-xs" aria-label={`View ${s.title}`}>View</Link></div>
      <div className="flex flex-wrap gap-1.5 px-3 py-2">{s.days.map((d) => (<div key={d.date} className="flex items-center gap-1.5 border border-line pr-2">
        <DayBox date={d.date} /><div className="text-xs leading-tight"><div className="font-bold">{range12(d.start, d.end)}</div><div className="mt-0.5"><Discount pct={d.discountPct} /></div></div></div>))}</div>
    </article>))}</div>
  </div>);
}
