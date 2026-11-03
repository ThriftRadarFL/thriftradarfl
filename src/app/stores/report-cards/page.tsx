import Link from "next/link";
import type { Metadata } from "next";
import { PageHead, typeLabel } from "@/components/ui";
import { loadReportCards } from "@/lib/report-card-load";
import { gradeCounts, GRADE_ORDER, LABELS, MARK_ICON, type CheckKey, type Grade } from "@/lib/report-card";
import { GRADE_CLASS, MARK_CLASS } from "@/lib/report-card-ui";
export const dynamic = "force-dynamic"; // source freshness and this week's tag counts follow the Eastern date
const title = "Store report cards — how complete is our info?";
const description = "Every Central Florida thrift store we list, graded on how complete and fresh our info is: confirmed listing, hours, deal days, map pin, phone and source date.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/stores/report-cards" } };
const KEYS: CheckKey[] = ["listing", "hours", "deals", "pin", "phone", "source"];
const SHORT: Record<CheckKey, string> = { listing: "Listing", hours: "Hours", deals: "Deals", pin: "Pin", phone: "Phone", source: "Fresh" }; // ✔/◐/✘ legend below
type SP = Promise<{ grade?: string; city?: string }>;
export default async function ReportCards({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams; const { cards } = await loadReportCards(); const counts = gradeCounts(cards);
  const g = GRADE_ORDER.find((x) => x === sp.grade?.toUpperCase()) as Grade | undefined; const cities = [...new Set(cards.map((c) => c.city))].sort();
  const city = cities.find((c) => c.toLowerCase() === sp.city?.toLowerCase()); const shown = cards.filter((c) => (!g || c.grade === g) && (!city || c.city === city));
  const qs = (o: { grade?: string; city?: string }) => { const p = new URLSearchParams(); const gg = "grade" in o ? o.grade : g; const cc = "city" in o ? o.city : city; if (gg) p.set("grade", gg); if (cc) p.set("city", cc); const s = p.toString(); return `/stores/report-cards${s ? `?${s}` : ""}`; };
  return (<div><PageHead title="Store Report Cards" sub={`${cards.length} stores graded on how complete & fresh our info is`} />
    <p className="panel mb-4 border-l-4 border-l-royal p-3 text-sm">These grades are about <b>ThriftRadarFL&apos;s info</b>, not the stores: a <b>D</b> means “we&apos;re missing things — call ahead”, not “bad store”. Nothing here is a review or price rating.</p>
    <nav aria-label="Filter by grade" className="mb-3 flex flex-wrap items-center gap-2 text-sm"><Link href={qs({ grade: undefined })} className={`btn-gray px-3 py-1 ${!g ? "ring-2 ring-royal" : ""}`} aria-current={!g ? "page" : undefined}>All ({cards.length})</Link>
      {GRADE_ORDER.map((x) => <Link key={x} href={qs({ grade: x })} aria-current={g === x ? "page" : undefined} className={`inline-flex min-h-10 items-center gap-1 rounded-sm px-3 py-1 font-bold text-white ${GRADE_CLASS[x]} ${g === x ? "ring-2 ring-offset-1 ring-royal-dark" : ""}`}>{x} <span className="font-normal">({counts[x]})</span></Link>)}</nav>
    <form action="/stores/report-cards" className="mb-4 flex flex-wrap items-end gap-2 text-sm">{g && <input type="hidden" name="grade" value={g} />}<label className="flex flex-col font-bold">City<select name="city" defaultValue={city ?? ""} className="rounded-sm border border-line bg-white px-2 py-1.5 font-normal"><option value="">All cities</option>{cities.map((c) => <option key={c}>{c}</option>)}</select></label><button className="btn-red">Filter</button></form>
    {!shown.length ? <p className="panel p-4 text-sm">No stores match. <Link href="/stores/report-cards" className="link">Show all</Link></p>
    : <><ul className="space-y-2 sm:hidden">{shown.map((c) => { const gaps = c.checks.filter((k) => k.mark === "missing" || k.mark === "partial"); return <li key={c.slug} className="panel flex min-w-0 items-start gap-3 p-3 text-sm">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-sm text-xl font-black text-white ${GRADE_CLASS[c.grade]}`} aria-label={`Grade ${c.grade}, ${c.score} percent`}>{c.grade}</span>
      <div className="min-w-0"><Link href={`/stores/${c.slug}#report-card`} className="font-bold text-royal hover:underline">{c.name}</Link><span className="block text-xs text-gray-600">{typeLabel[c.type] ?? c.type} · {c.city} · {c.score}%</span>
        <span className="mt-1 block text-xs">{gaps.length ? gaps.map((k) => <span key={k.key} className={`mr-2 inline-block font-bold ${MARK_CLASS[k.mark]}`}>{MARK_ICON[k.mark]} {SHORT[k.key]}</span>) : <span className={`font-bold ${MARK_CLASS.pass}`}>✔ All info complete</span>}
          {c.tagReportsThisWeek ? <span className="inline-block text-gray-600">· {c.tagReportsThisWeek} tag report{c.tagReportsThisWeek > 1 ? "s" : ""}*</span> : null}</span></div></li>; })}</ul>
    <div className="panel hidden overflow-x-auto sm:block"><table className="w-full min-w-[640px] border-collapse text-sm"><caption className="sr-only">Store info report cards</caption>
      <thead><tr className="bg-gradient-to-b from-royal to-royal-dark text-left text-white"><th scope="col" className="px-3 py-2">Store</th><th scope="col" className="whitespace-nowrap px-2 py-2 text-center">Grade</th>{KEYS.map((k) => <th key={k} scope="col" className="px-2 py-2 text-center text-xs uppercase" title={LABELS[k]}>{SHORT[k]}</th>)}<th scope="col" className="px-2 py-2 text-center text-xs uppercase" title="Approved shopper color-tag reports this week — crowdsourced, not graded">Tags*</th></tr></thead>
      <tbody>{shown.map((c) => <tr key={c.slug} className="border-b border-line even:bg-paper/60"><th scope="row" className="px-3 py-2 text-left font-normal"><Link href={`/stores/${c.slug}#report-card`} className="font-bold text-royal hover:underline">{c.name}</Link><span className="block text-xs text-gray-600">{typeLabel[c.type] ?? c.type} · {c.city}</span></th>
        <td className="px-2 py-2 text-center"><span className={`inline-block w-8 rounded-sm py-0.5 font-black text-white ${GRADE_CLASS[c.grade]}`}>{c.grade}</span><span className="block text-xs text-gray-600">{c.score}%</span></td>
        {KEYS.map((k) => { const ck = c.checks.find((x) => x.key === k)!; return <td key={k} className={`px-2 py-2 text-center font-bold ${MARK_CLASS[ck.mark]}`} title={ck.detail}><span aria-hidden>{MARK_ICON[ck.mark]}</span><span className="sr-only">{ck.label}: {ck.mark === "na" ? "not applicable" : ck.mark} — {ck.detail}</span></td>; })}
        <td className="px-2 py-2 text-center text-gray-700">{c.tagReportsThisWeek ?? "—"}</td></tr>)}</tbody></table></div></>}
    <div id="how" className="panel mt-4 p-4 text-sm"><h2 className="mb-2 text-lg font-bold text-royal">How it&apos;s graded</h2>
      <p className="mb-2">Each check is <span className={MARK_CLASS.pass}>✔ complete</span> (2 pts), <span className={MARK_CLASS.partial}>◐ partial</span> (1) or <span className={MARK_CLASS.missing}>✘ missing</span> (0); “—” doesn&apos;t count. Grade = share of points: A ≥ 90%, B ≥ 75%, C ≥ 60%, D ≥ 40%, F below.</p>
      <ul className="list-disc space-y-1 pl-5"><li><b>Listing confirmed</b> — found on the store or organization&apos;s own site (or another primary source), not only third-party directories.</li>
        <li><b>Hours on file</b> — all 7 days known; partial if they come from a directory/aggregator or are marked unverified.</li>
        <li><b>Deal-day info</b> — at least one verified weekly deal rule; partial if only unverified ones. Not applicable to auction houses.</li>
        <li><b>Map pin</b> — coordinates on file; partial if the pin is approximate.</li><li><b>Phone number</b> — a valid 10-digit number on file.</li>
        <li><b>Source freshness</b> — a source with a “checked” date: within 30 days = complete, 31–90 days = partial, older = missing.</li></ul>
      <p className="mt-2 text-xs text-gray-600">*Tags = moderator-approved shopper color-tag reports this week (Sun–Sat, Eastern). Crowdsourced and <b>unverified</b>; shown for context, never graded. Spot something out of date? <Link href="/contact" className="link">Tell us</Link> · JSON: <Link href="/api/report-cards" className="link">/api/report-cards</Link></p></div>
  </div>);
}
