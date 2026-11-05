import { t12, hours12, dayKey } from "@/lib/time";
import { notFound } from "next/navigation";
import { getVenue, getDealRules, listTagReports } from "@/lib/data";
import { buildBoard } from "@/lib/color-tags";
import TagSwatch from "@/components/TagSwatch";
import { PageHead, typeLabel } from "@/components/ui";
import { DAYS } from "@/lib/deal-rules";
import { venueJsonLd } from "@/lib/jsonld";
import { SITE_URL } from "@/lib/site";
import ShareButtons from "@/components/ShareButtons";
import CalendarLinks from "@/components/CalendarLinks";
import StoreToday from "@/components/StoreToday";
import { storeToday, dowOf } from "@/lib/store-today";
import BestDay from "@/components/BestDay";
import { bestDay } from "@/lib/best-day";
import { todayET } from "@/lib/cities";
import { embedSnippet } from "@/lib/embed";
import ReportCardPanel from "@/components/ReportCardPanel";
import { reportCard, tagCountsThisWeek } from "@/lib/report-card";
export const dynamic = "force-dynamic"; // "today at this store" follows the Eastern-time date
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const v = await getVenue((await params).slug); if (!v) return { title: "Store not found", robots: { index: false } };
  return { title: `${v.name} — hours, deal days & address`, description: `${v.name} at ${v.address}, ${v.city}, FL: hours, color-tag and half-off days.`, alternates: { canonical: `/stores/${v.slug}` } };
}
const hostOf = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, "") || u; } catch { return u; } };
export default async function Store({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const v = await getVenue(slug); if (!v) notFound(); const [dealRules, tagReports] = await Promise.all([getDealRules(), listTagReports().catch(() => [])]);
  const tagRow = buildBoard(tagReports.filter((r) => r.venue === v.slug), todayET())[0]; const takesTags = ["thrift", "outlet_bins", "consignment"].includes(v.type);
  const hours = v.hoursJson ? Object.entries(v.hoursJson as unknown as Record<string, string>).filter(([, h]) => h) : [];
  const q = encodeURIComponent(`${v.address}, ${v.city} FL ${v.zip}`); const mine = dealRules.filter((r) => r.venue === v.slug);
  return (<div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(venueJsonLd(v)).replace(/</g, "\\u003c") }} /><div className="min-w-0 break-words [overflow-wrap:anywhere]"><PageHead title={v.name} sub={`${typeLabel[v.type] ?? v.type} · ${v.city}, FL`} />
    <StoreToday t={storeToday(v.slug, dealRules, todayET(), v.hoursJson)} />
    <BestDay b={bestDay(v.slug, dealRules, v.hoursJson)} today={dowOf(todayET())} />
    {takesTags && <div className="panel mb-4 min-w-0"><div className="panel-head">Color tag this week · crowdsourced</div><div className="flex flex-wrap items-center gap-2 p-3 text-sm">
      {tagRow ? <>{tagRow.colors.map((c) => <span key={c.color} className="inline-flex items-center gap-1"><TagSwatch color={c.color} big />{c.discountPct != null && <b>{c.discountPct}% off</b>}<span className="text-xs text-gray-600">({c.reports} {c.reports === 1 ? "report" : "reports"})</span></span>)}
        <span className="w-full text-xs text-gray-600">Shopper-reported and <b>unverified</b> — check the sign in store. <a href="/color-tags#report" className="link">Report a change</a></span></>
        : <span>No shopper reports yet this week. <a href="/color-tags#report" className="link">Seen the color-of-the-week sign? Report it →</a></span>} <a href="/bins" className="link">Restock days →</a></div></div>}
    <ReportCardPanel c={reportCard(v, dealRules, todayET(), takesTags ? tagCountsThisWeek(tagReports.filter((r) => r.venue === v.slug), todayET()).get(v.slug) ?? 0 : null)} />
    <div className="grid min-w-0 gap-4 break-words md:grid-cols-3">
      <div className="panel min-w-0 break-words md:col-span-2"><div className="panel-head">Location</div><div className="p-4 space-y-2">
        <p className="text-lg">{v.address}<br />{v.city}, FL {v.zip}</p>{v.phone && <p><a aria-label={`Call ${v.name} at ${v.phone}`} className="font-bold text-royal hover:underline" href={`tel:${v.phone.replace(/[^\d+]/g, "")}`}>{v.phone}</a></p>}
        {v.notes && <p className="text-sm text-gray-700 border-l-4 border-coral pl-3">{v.notes}</p>}
        <a className="btn-red mt-2" href={`https://www.google.com/maps/search/?api=1&query=${q}`} target="_blank" rel="noopener noreferrer" aria-label={`Get directions to ${v.name} in Google Maps (opens in a new tab)`}>Get directions ↗</a>
        {v.sourceUrl && /^https?:\/\//i.test(v.sourceUrl) && <p className="text-xs text-gray-600">Source: <a href={v.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline">{hostOf(v.sourceUrl)}</a></p>}
        <div className="pt-2"><ShareButtons url={`${SITE_URL}/stores/${v.slug}`} title={v.name} /></div>
        <p className="text-sm"><a href={`/stores/compare?s=${v.slug}`} className="link" aria-label={`Compare ${v.name} with another store`}>⇄ Compare with another store</a></p></div></div>
      <div className="panel min-w-0 break-words"><div className="panel-head">Hours</div><table className="w-full text-sm">
        <tbody>{hours.length ? hours.map(([k, h]) => <tr key={k} className="border-b border-line"><td className="px-4 py-2 font-bold">{dayKey(k)}</td><td className="px-4 py-2">{hours12(h)}</td></tr>)
          : <tr><td className="px-4 py-3 text-gray-600">Hours not verified yet — call ahead</td></tr>}</tbody></table>
        <div className="panel-head border-t border-line">Deal days</div><ul className="text-sm">{!mine.length && <li className="px-4 py-2 text-gray-600">No deal days listed.</li>}{mine.map((r) => <li key={r.id} className="border-b border-line px-4 py-2">
          <b>{DAYS[r.day]}</b> {r.label}{r.time && ` · ${t12(r.time)}`}{!r.verified && <span className="ml-1 text-xs text-gray-600">(unverified)</span>}</li>)}</ul>
        {mine.length > 0 && <div className="p-3"><CalendarLinks path={`/api/calendar/deals?venue=${v.slug}`} label="this store's deals" /><p className="mt-1 text-xs text-gray-600">Repeats weekly; updates automatically if the schedule changes.</p></div>}</div>
    </div>
    <details className="panel mt-4 overflow-hidden"><summary className="panel-head cursor-pointer list-none">▸ Embed this store&apos;s deal days on your site</summary>
      <div className="grid min-w-0 gap-4 break-words p-4 text-sm md:grid-cols-2"><div className="min-w-0 space-y-2"><p>Run a blog, club page or the store&apos;s own site? Paste this to show today&apos;s deal, the weekly schedule and the best day. It updates automatically.</p>
        <label className="block font-bold" htmlFor="embed-full">Full card (360×330)</label><textarea id="embed-full" readOnly rows={3} className="w-full rounded-sm border border-line bg-paper p-2 font-mono text-xs" value={embedSnippet(SITE_URL, v.slug)} />
        <label className="block font-bold" htmlFor="embed-compact">Compact badge (320×96)</label><textarea id="embed-compact" readOnly rows={3} className="w-full rounded-sm border border-line bg-paper p-2 font-mono text-xs" value={embedSnippet(SITE_URL, v.slug, true)} />
        <p className="text-xs text-gray-600">No scripts or tracking. JSON for your own code: <a className="link" href={`/api/venues/${v.slug}/today`}>/api/venues/{v.slug}/today</a> · <a className="link" href="/developers">API docs</a></p></div>
        <div className="min-w-0"><p className="mb-1 text-xs font-bold uppercase text-royal">Preview</p><iframe src={`/embed/stores/${v.slug}`} title={`${v.name} deal days widget preview`} width={360} height={330} loading="lazy" className="max-w-full border-0" /></div></div></details>
  </div></div>);
}
