import Link from "next/link";
import type { Metadata } from "next";
import { getVenues, getDealRules } from "@/lib/data";
import { PageHead, typeLabel } from "@/components/ui";
import { todayET } from "@/lib/cities";
import { t12 } from "@/lib/time";
import { DAYS } from "@/lib/deal-rules";
import { whenLabel } from "@/lib/store-today";
import { compareStores, parseCompare, MAX_COMPARE } from "@/lib/compare";
export const dynamic = "force-dynamic"; // "today" row follows the Eastern-time date
const title = "Compare thrift stores — deal days side by side";
const description = "Pick up to 4 Central Florida thrift stores, Goodwill outlets or auction houses and compare deal days, hours and the best day to go, side by side.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/stores/compare" } };
const SUGGEST = [["goodwill-pine-hills-outlet", "goodwill-taft-outlet"], ["goodwill-port-orange", "city-thrift-edgewater", "the-hope-chest"]];
type SP = Promise<{ s?: string | string[] }>;
export default async function Compare({ searchParams }: { searchParams: SP }) {
  const [venues, rules] = await Promise.all([getVenues(), getDealRules()]); const known = new Set(venues.map((v) => v.slug));
  const { slugs, unknown } = parseCompare((await searchParams).s, known); const today = todayET(); const { cols, winners, miles } = compareStores(slugs, venues, rules, today);
  const sorted = [...venues].sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
  const suggestions = SUGGEST.map((g) => g.filter((s) => known.has(s))).filter((g) => g.length >= 2);
  const nameOf = (s: string) => venues.find((v) => v.slug === s)?.name ?? s;
  return (<div><PageHead title="Compare Stores" sub={cols.length ? `${cols.length} stores side by side · deal days, hours, best day` : `Pick 2–${MAX_COMPARE} stores to compare`} />
    <form action="/stores/compare" className="panel mb-4 p-3"><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: MAX_COMPARE }, (_, i) => <label key={i} className="flex min-w-0 flex-col gap-1 text-sm font-bold">Store {i + 1}
        <select name="s" defaultValue={slugs[i] ?? ""} className="w-full min-w-0 rounded-sm border border-line bg-white px-2 py-1.5 font-normal"><option value="">{i < 2 ? "Choose a store…" : "(optional)"}</option>
          {sorted.map((v) => <option key={v.slug} value={v.slug}>{v.city} — {v.name}</option>)}</select></label>)}</div>
      <div className="mt-3 flex flex-wrap items-center gap-3"><button className="btn-red">Compare</button>{cols.length > 0 && <Link href="/stores/compare" className="link text-sm">Clear</Link>}</div></form>
    {unknown.length > 0 && <p role="status" className="panel mb-4 border-l-4 border-l-cta p-3 text-sm">Skipped unknown store{unknown.length > 1 ? "s" : ""}: {unknown.join(", ")}.</p>}
    {cols.length < 2 ? <div className="panel p-4 text-sm"><p className="mb-2">{cols.length === 1 ? <>Add at least one more store to compare with <b>{cols[0].v.name}</b>.</> : "Choose two or more stores above, or try one of these:"}</p>
      <ul className="list-disc space-y-1 pl-5">{suggestions.map((g) => <li key={g.join()}><Link className="link" href={`/stores/compare?s=${g.join(",")}`}>{g.map(nameOf).join(" vs ")}</Link></li>)}</ul></div>
    : <div className="panel overflow-x-auto"><table className="w-full min-w-[560px] border-collapse text-sm">
      <caption className="sr-only">Store comparison</caption>
      <thead><tr className="bg-gradient-to-b from-royal to-royal-dark text-left text-white"><th scope="col" className="w-24 px-3 py-2 text-xs uppercase">&nbsp;</th>
        {cols.map((c) => <th key={c.v.slug} scope="col" className="border-l border-royal-dark px-3 py-2 align-top"><Link href={`/stores/${c.v.slug}`} className="hover:underline">{c.v.name}</Link>
          <span className="block text-xs font-normal text-blue-100">{typeLabel[c.v.type] ?? c.v.type} · {c.v.city}</span></th>)}</tr></thead>
      <tbody>
        <tr className="border-b border-line bg-[#fff8d6]"><th scope="row" className="px-3 py-2 text-left text-xs uppercase text-royal">Today ({DAYS[cols[0].today.dow]})</th>{cols.map((c) => <td key={c.v.slug} className="border-l border-line px-3 py-2 align-top">
          {c.today.today.length ? <><span className="pill bg-cta">{c.today.today[0].discountPct ? `${c.today.today[0].discountPct}% OFF` : "Deal"}</span> {c.today.today[0].label}</>
            : <span className="text-gray-700">No deal{c.today.next ? ` · next ${whenLabel(c.today.next.inDays, c.today.next.rule.day)}` : ""}</span>}
          {c.today.hours && <span className="block text-xs text-gray-600">{c.today.hours === "Closed" ? "Closed today" : `Today ${c.today.hours}${c.today.openNow ? (c.today.openNow === "open" ? " · Open now" : " · Closed now") : ""}`}</span>}</td>)}</tr>
        <tr className="border-b border-line"><th scope="row" className="px-3 py-2 text-left text-xs uppercase text-royal">Best day</th>{cols.map((c) => <td key={c.v.slug} className="border-l border-line px-3 py-2 align-top">
          {c.best ? <><span className="rounded-sm border border-cta-dark bg-gradient-to-b from-[#ee2a3f] to-cta px-2 py-0.5 text-xs font-bold text-white">{c.best.best.name}</span> <span className="text-xs">{c.best.reason}</span></> : <span className="text-gray-600">No deal days listed</span>}</td>)}</tr>
        {[1, 2, 3, 4, 5, 6, 0].map((day, i) => <tr key={day} className="border-b border-line even:bg-paper/60"><th scope="row" className="px-3 py-2 text-left font-bold">{DAYS[day]}</th>
          {cols.map((c, ci) => { const w = c.week[i]; const win = winners[i] === ci; return <td key={c.v.slug} className={`border-l border-line px-3 py-2 align-top ${win ? "bg-[#e6eefb]" : ""}`}>
            {w.hours === "Closed" ? <span className="text-gray-500">Closed</span> : w.rules.length ? w.rules.map((r) => <div key={r.id ?? r.label}>{r.discountPct ? <b className="text-cta">{r.discountPct}% </b> : null}{r.label}{r.time && ` · ${t12(r.time)}`}{!r.verified && <span className="text-xs text-gray-600"> (unverified)</span>}</div>) : <span className="text-gray-400">—</span>}
            {win && <span className="pill mt-1 bg-royal">Best pick {DAYS[day]}</span>}</td>; })}</tr>)}
        <tr className="border-b border-line"><th scope="row" className="px-3 py-2 text-left text-xs uppercase text-royal">Schedules</th>{cols.map((c) => <td key={c.v.slug} className="border-l border-line px-3 py-2 text-xs">{c.total ? `${c.verified} of ${c.total} verified` : "None on file"}</td>)}</tr>
        <tr><th scope="row" className="px-3 py-2"><span className="sr-only">Links</span></th>{cols.map((c) => <td key={c.v.slug} className="border-l border-line px-3 py-2"><Link href={`/stores/${c.v.slug}`} className="btn-gray px-2 py-1 text-xs">Details</Link></td>)}</tr>
      </tbody></table>
      <p className="border-t border-line p-3 text-xs text-gray-600">Blue cell = strongest open deal that weekday among these stores (ties show no pick). {miles != null && <>These two stores are about <b>{Math.round(miles)} miles</b> apart (straight line). </>}<Link href={`/plan`} className="link">Plan a route →</Link></p></div>}
  </div>);
}
