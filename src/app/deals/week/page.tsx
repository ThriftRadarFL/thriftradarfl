import Link from "next/link";
import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { getSales, getVenues, getDealRules } from "@/lib/data";
import { todayET } from "@/lib/cities";
import { t12 } from "@/lib/time";
import { weekSheet, sheetText, sheetDayLabel } from "@/lib/week-sheet";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import SheetTools from "./SheetTools";
export const dynamic = "force-dynamic"; // starts at today's Eastern-time date
const title = "This week's deal days — printable sheet";
const description = "Next 7 days of Central Florida thrift deal days (Goodwill color tags, half-off, bin restocks) plus open estate sales, day by day. Print it or text it.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/deals/week" }, openGraph: { title, description, url: `${SITE_URL}/deals/week`, siteName: SITE_NAME, type: "website" } };
type SP = Promise<{ city?: string; verified?: string }>;
export default async function WeekSheet({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams; const [sales, venues, rules] = await Promise.all([getSales(), getVenues(), getDealRules()]);
  const cities = [...new Set(venues.map((v) => v.city).concat(sales.map((s) => s.city)))].sort();
  const city = cities.find((c) => c.toLowerCase().replace(/\s+/g, "-") === (sp.city ?? "").toLowerCase().trim().replace(/\s+/g, "-")); const verifiedOnly = sp.verified === "1";
  const today = todayET(); const days = weekSheet(today, rules, venues, sales, { city, verifiedOnly });
  const qs = new URLSearchParams({ ...(city ? { city: city.toLowerCase().replace(/\s+/g, "-") } : {}), ...(verifiedOnly ? { verified: "1" } : {}) }).toString();
  const url = `${SITE_URL}/deals/week${qs ? `?${qs}` : ""}`; const total = days.reduce((n, d) => n + d.deals.length + d.sales.length, 0);
  return (<div><div className="print:hidden"><PageHead title="This Week's Deal Days" sub={`${sheetDayLabel(days[0].date)} – ${sheetDayLabel(days.at(-1)!.date)}${city ? ` · ${city}` : " · all of Central Florida"}`} /></div>
    <div className="hidden print:block print:pb-2"><p className="text-xl font-bold">ThriftRadarFL deal-day sheet{city ? ` · ${city}` : ""}</p><p className="text-sm">{sheetDayLabel(days[0].date)} – {sheetDayLabel(days.at(-1)!.date)} · {total} listings · {SITE_URL.replace(/^https?:\/\//, "")}/deals/week</p></div>
    <div className="panel mb-4 p-3 print:hidden"><form className="flex flex-wrap items-end gap-3 text-sm" action="/deals/week">
      <label className="flex flex-col gap-1 font-bold">City<select name="city" defaultValue={city ? city.toLowerCase().replace(/\s+/g, "-") : ""} className="rounded-sm border border-line bg-white px-2 py-1.5 font-normal">
        <option value="">All cities</option>{cities.map((c) => <option key={c} value={c.toLowerCase().replace(/\s+/g, "-")}>{c}</option>)}</select></label>
      <label className="flex min-h-10 items-center gap-2"><input type="checkbox" name="verified" value="1" defaultChecked={verifiedOnly} /> Verified schedules only</label>
      <button className="btn-gray">Update</button></form>
      <div className="mt-3"><SheetTools text={sheetText(days, SITE_URL, city)} url={url} /></div></div>
    <div className="grid gap-3 md:grid-cols-2 print:block">{days.map((d, i) => <section key={d.date} aria-labelledby={`d-${d.date}`} className="panel overflow-hidden print:mb-3 print:break-inside-avoid print:border-black print:shadow-none">
      <h2 id={`d-${d.date}`} className={`flex items-center justify-between px-4 py-2 text-sm font-bold uppercase tracking-wide text-white print:bg-none print:px-2 print:text-black ${i === 0 ? "bg-gradient-to-b from-[#ee2a3f] to-cta" : "bg-gradient-to-b from-royal to-royal-dark"}`}>
        <span>{sheetDayLabel(d.date)}{i === 0 && " · today"}</span><span className="text-xs font-normal normal-case">{d.deals.length} deal{d.deals.length === 1 ? "" : "s"} · {d.sales.length} sale{d.sales.length === 1 ? "" : "s"}</span></h2>
      <ul className="divide-y divide-line text-sm">
        {d.deals.map((x) => <li key={x.rule.id ?? x.rule.label + x.venue.slug} className="flex gap-2 px-4 py-2 print:px-2"><span aria-hidden="true" className="hidden print:inline">☐</span>
          <div><Link href={`/stores/${x.venue.slug}`} className="link">{x.venue.name}</Link> <span className="text-xs text-gray-600">· {x.venue.city}</span>
            <div>{x.rule.discountPct ? <span className="pill mr-1 bg-cta print:border print:border-black print:bg-transparent print:text-black">{x.rule.discountPct}% OFF</span> : null}{x.rule.label}{x.rule.time && ` · ${t12(x.rule.time)}`}{!x.rule.verified && <span className="ml-1 text-xs text-gray-600">(unverified)</span>}</div></div></li>)}
        {d.sales.map((x) => <li key={x.sale.slug} className="flex gap-2 bg-[#f6f9ff] px-4 py-2 print:bg-transparent print:px-2"><span aria-hidden="true" className="hidden print:inline">☐</span>
          <div><span className="pill mr-1 bg-royal print:border print:border-black print:bg-transparent print:text-black">SALE</span><Link href={`/sales/${x.sale.slug}`} className="link">{x.sale.title}</Link>
            <div className="text-xs text-gray-700">{x.sale.city} · {x.hours}{x.discountPct ? ` · ${x.discountPct}% off` : ""}</div></div></li>)}
        {!d.deals.length && !d.sales.length && <li className="px-4 py-2 text-gray-600 print:px-2">Nothing listed.</li>}</ul></section>)}</div>
    <p className="mt-4 text-sm print:hidden"><Link href="/deals" className="link">Weekly schedule by store</Link> · <Link href="/today" className="link">Today</Link> · <Link href="/weekend" className="link">This weekend near you</Link></p>
    <p className="mt-2 text-xs text-gray-600">Unverified schedules haven&apos;t been confirmed with the store — check signage or call ahead.</p></div>);
}
