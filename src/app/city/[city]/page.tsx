import { range12 } from "@/lib/time";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getSales, getVenues, getDealRules } from "@/lib/data";
import { cityList, cityData, nearbyCities, todayET } from "@/lib/cities";
import { DAYS } from "@/lib/deal-rules";
import { PageHead, DayBox, Discount, typeLabel } from "@/components/ui";
import { SITE_URL, SITE_NAME } from "@/lib/site";
type P = { params: Promise<{ city: string }> };
export const dynamic = "force-dynamic"; // "this weekend" depends on today's date
async function load(slug: string) {
  const [sales, venues, rules] = await Promise.all([getSales(), getVenues(), getDealRules()]); const today = todayET();
  const list = cityList(sales, venues, today); const info = list.find((c) => c.slug === slug); if (!info) return null;
  return { info, list, today, ...cityData(info.name, sales, venues, rules, today) };
}
export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { city } = await params; const d = await load(city); if (!d) return { title: "City not found" };
  const n = d.info.name; const title = `Estate Sales & Thrift Deals in ${n}, FL`;
  const description = `${d.upcoming.length} upcoming estate sale${d.upcoming.length === 1 ? "" : "s"}, auctions and yard sales plus ${d.stores.length} thrift store${d.stores.length === 1 ? "" : "s"} with deal days in ${n}, Florida. Updated daily — see what's on this weekend.`;
  return { title, description, alternates: { canonical: `/city/${city}`, types: { "application/atom+xml": [{ url: `/feed.xml?city=${city}`, title: `ThriftRadarFL · New sales in ${n}` }] } }, openGraph: { title, description, url: `${SITE_URL}/city/${city}`, siteName: SITE_NAME, type: "website" }, twitter: { card: "summary_large_image", title, description } };
}
const md = (iso: string) => { const d = new Date(iso + "T12:00:00Z"); return `${DAYS[d.getUTCDay()]} ${d.getUTCMonth() + 1}/${d.getUTCDate()}`; };
export default async function City({ params }: P) {
  const { city } = await params; const d = await load(city); if (!d) notFound();
  const { info, upcoming, stores, weekend, bestPct } = d; const name = info.name; const near = nearbyCities(d.list, city);
  const ld = [{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: SITE_NAME, item: SITE_URL }, { "@type": "ListItem", position: 2, name: "Cities", item: `${SITE_URL}/city` }, { "@type": "ListItem", position: 3, name: `${name}, FL`, item: `${SITE_URL}/city/${city}` }] },
    { "@context": "https://schema.org", "@type": "ItemList", name: `Upcoming sales in ${name}, FL`, itemListElement: upcoming.slice(0, 20).map((s, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/sales/${s.slug}`, name: s.title })) }];
  const wkCount = weekend.reduce((a, w) => a + w.sales.length + w.deals.length, 0);
  return (<div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
    <PageHead title={`Estate Sales & Thrift Deals in ${name}, FL`} sub={`${upcoming.length} upcoming sale${upcoming.length === 1 ? "" : "s"} · ${stores.length} store${stores.length === 1 ? "" : "s"} tracked${bestPct ? ` · up to ${bestPct}% off` : ""}`} />
    <nav aria-label="Breadcrumb" className="mb-3 text-xs text-gray-600"><Link href="/" className="link">Home</Link> › <Link href="/city" className="link">Cities</Link> › {name}</nav>
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <Link href="/digest" className="btn-red text-sm">Get the {name} weekly digest</Link>
      <Link href={`/?city=${city}`} className="btn-gray text-sm">Filter this week</Link><Link href="/map" className="btn-gray text-sm">Open map</Link><Link href="/plan" className="btn-gray text-sm">Plan a route</Link></div>

    <section aria-labelledby="wk" className="panel mb-4"><h2 id="wk" className="panel-head">This weekend in {name} {wkCount ? `(${wkCount})` : ""}</h2>
      <div className="grid gap-px bg-line sm:grid-cols-3">{weekend.map((w) => <div key={w.date} className="bg-white p-3">
        <div className="mb-2 border-b-2 border-cta pb-1 text-sm font-bold text-royal">{md(w.date)}</div>
        {w.sales.map(({ sale: s, day }) => <Link key={s.slug} href={`/sales/${s.slug}`} className="mb-1.5 block rounded-sm border border-line bg-gradient-to-b from-white to-paper p-2 text-sm hover:border-royal">
          <b className="text-royal">{s.title}</b><div className="text-xs text-gray-600">{typeLabel[s.type] ?? s.type} · {range12(day.start, day.end)}{day.discountPct ? ` · ${day.discountPct}% off` : ""}</div></Link>)}
        {w.deals.map((r) => <div key={r.id ?? r.venue + r.label} className={`pill ${r.color} mb-1.5 block whitespace-normal`}>{r.label}<div className="text-[11px] font-normal">{r.store}{!r.verified && " · unverified"}</div></div>)}
        {!w.sales.length && !w.deals.length && <p className="text-xs text-gray-600">Nothing listed yet.</p>}</div>)}</div>
      {!weekend.length && <p className="p-3 text-sm">Weekend&apos;s over — check back Thursday for the next one.</p>}</section>

    <div className="grid gap-4 md:grid-cols-3">
      <section className="panel md:col-span-2"><h2 className="panel-head">All upcoming sales</h2>
        {upcoming.length ? <ul>{upcoming.map((x) => <li key={x.slug} className="flex min-h-14 items-center gap-3 border-b border-line px-4 py-2 last:border-0">
          <DayBox date={x.days.find((dd) => dd.date >= d.today)?.date ?? x.days[0].date} /><div className="min-w-0"><Link href={`/sales/${x.slug}`} className="font-bold hover:text-royal">{x.title}</Link><div className="text-xs text-gray-600">{typeLabel[x.type] ?? x.type} · {x.days.length} day{x.days.length === 1 ? "" : "s"}{x.zip ? ` · ${x.zip}` : ""}</div></div>
          <span className="ml-auto shrink-0"><Discount pct={Math.max(...x.days.map((dd) => dd.discountPct))} /></span></li>)}</ul>
          : <p className="p-4 text-sm">No sales listed in {name} yet. Running one? <Link href="/submit" className="link">Submit it free</Link>.</p>}</section>
      <aside className="space-y-4">
        <section className="panel"><h2 className="panel-head">Stores &amp; deal days</h2>{stores.length ? <ul>{stores.map((v) => <li key={v.slug} className="border-b border-line px-4 py-2 text-sm last:border-0">
          <Link href={`/stores/${v.slug}`} className="font-bold hover:text-royal">{v.name}</Link><div className="text-xs text-gray-600">{v.address}</div>
          {v.rules.length > 0 && <div className="mt-1 flex flex-wrap gap-1">{v.rules.map((r) => <span key={r.id ?? r.label} className={`pill ${r.color}`}>{DAYS[r.day]}: {r.label}</span>)}</div>}</li>)}</ul>
          : <p className="p-4 text-sm">No stores tracked yet.</p>}</section>
        {near.length > 0 && <section className="panel"><h2 className="panel-head">Nearby cities</h2><ul className="text-sm">{near.map((c) => <li key={c.slug} className="flex border-b border-line px-4 py-2 last:border-0">
          <Link href={`/city/${c.slug}`} className="link">{c.name}</Link><span className="ml-auto text-xs text-gray-600">{c.miles != null ? `${c.miles} mi · ` : ""}{c.sales} sale{c.sales === 1 ? "" : "s"}</span></li>)}</ul>
          <div className="border-t border-line p-3 text-xs"><Link href="/city" className="link">All cities →</Link></div></section>}
      </aside></div></div>);
}
