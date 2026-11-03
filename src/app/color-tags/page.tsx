import Link from "next/link";
import { PageHead } from "@/components/ui";
import { Honeypot, Notice, inp } from "@/components/FormBits";
import TagSwatch from "@/components/TagSwatch";
import { getVenues, listTagReports } from "@/lib/data";
import { buildBoard, weekBounds, TAG_COLORS, NOTE_MAX } from "@/lib/color-tags";
import { tagVenues, weekLabel, ago } from "@/lib/color-tag-board";
import { todayET } from "@/lib/cities";
import { reportColorTag } from "./actions";
export const dynamic = "force-dynamic"; // board follows the Eastern-time week and moderation
export const metadata = { title: "Color Tag Board — which tag color is on sale this week", description: "Shopper-reported Goodwill and thrift store color-tag sales in Central Florida this week. Crowdsourced and unverified — moderated, and cleared every Sunday.", alternates: { canonical: "/color-tags" } };
export default async function ColorTags({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const sp = await searchParams; const today = todayET(); const wk = weekBounds(today);
  const [venues, reports] = await Promise.all([getVenues(), listTagReports()]);
  const stores = tagVenues(venues); const byslug = new Map(venues.map((v) => [v.slug, v])); const board = buildBoard(reports, today).filter((r) => byslug.has(r.venue));
  return (<div><PageHead title="Color Tag Board" sub={`Which tag color is on sale at which store · week of ${weekLabel(wk.weekOf, wk.expiresOn)}`} />
    <p className="mb-4 border-l-4 border-cta bg-paper p-3 text-sm"><b>Crowdsourced &amp; unverified.</b> These come from shoppers, not the stores. A moderator checks each report before it appears, and the board clears every Sunday when colors rotate. Always check the sign at the register. Scheduled deal days we&apos;ve sourced are on <Link href="/deals" className="link">Deal Days</Link>.</p>
    <Notice ok={sp.ok} err={sp.err} okText="Thanks! Your report is waiting for a quick moderator check and will show here once approved." />
    <div className="grid min-w-0 gap-4 md:grid-cols-3">
      <section className="panel min-w-0 md:col-span-2" aria-labelledby="board-h"><h2 id="board-h" className="panel-head">This week&apos;s reported colors ({board.length} {board.length === 1 ? "store" : "stores"})</h2>
        {!board.length && <p className="p-4 text-sm text-gray-700">No approved reports yet this week. Spotted the color-of-the-week sign? <a href="#report" className="link">Be the first to report it →</a></p>}
        <ul>{board.map((row) => { const v = byslug.get(row.venue)!; return <li key={row.venue} className="border-b border-line px-4 py-3 last:border-0">
          <div className="flex flex-wrap items-baseline gap-x-2"><Link href={`/stores/${v.slug}`} className="font-bold text-royal hover:underline">{v.name}</Link><span className="text-xs text-gray-600">{v.city}</span></div>
          <ul className="mt-1.5 space-y-1.5">{row.colors.map((c) => <li key={c.color} className="flex flex-wrap items-center gap-2 text-sm">
            <TagSwatch color={c.color} big /><span className="font-bold">{c.discountPct != null ? `${c.discountPct}% off` : "discount not reported"}</span>
            <span className="text-xs text-gray-600">{c.reports} {c.reports === 1 ? "report" : "reports"} · last {ago(c.lastAt)} · <span className="font-bold uppercase text-cta-dark">unverified</span></span>
            {c.notes.length > 0 && <span className="w-full text-xs text-gray-700">“{c.notes.join("” · “")}”</span>}</li>)}</ul></li>; })}</ul></section>
      <section id="report" className="panel min-w-0 scroll-mt-4" aria-labelledby="report-h"><h2 id="report-h" className="panel-head">Report a color tag</h2>
        <div className="p-4">
          <form action={reportColorTag} className="space-y-3"><Honeypot />
            <label className="block text-xs font-bold">Store<span className="text-red-700" aria-hidden="true"> *</span><select name="venue" required className={inp} defaultValue=""><option value="" disabled>Choose a store…</option>{stores.map((v) => <option key={v.slug} value={v.slug}>{v.name} · {v.city}</option>)}</select></label>
            <fieldset><legend className="text-xs font-bold">Tag color on sale<span className="text-red-700" aria-hidden="true"> *</span></legend>
              <div className="mt-1 grid grid-cols-2 gap-1.5">{TAG_COLORS.map((c, i) => <label key={c} className="flex min-h-10 cursor-pointer items-center gap-2 rounded-sm border border-line bg-paper px-2 has-[:checked]:border-royal has-[:checked]:ring-2 has-[:checked]:ring-royal">
                <input type="radio" name="color" value={c} required={i === 0} /><TagSwatch color={c} /></label>)}</div></fieldset>
            <label className="block text-xs font-bold">% off shown on the sign<input name="discountPct" type="number" min={5} max={90} step={1} inputMode="numeric" placeholder="e.g. 50" className={inp} /><span className="mt-0.5 block font-normal text-gray-600">Leave blank if you&apos;re not sure.</span></label>
            <label className="block text-xs font-bold">Note (optional)<input name="note" maxLength={NOTE_MAX} placeholder="e.g. sign by the registers, Sunday AM" className={inp} /></label>
            <button className="btn-red w-full">Send report</button>
            <p className="text-xs text-gray-600">Applies to this week only ({weekLabel(wk.weekOf, wk.expiresOn)}). No account or email needed; we don&apos;t store your name or IP.</p></form></div></section>
    </div></div>);
}
