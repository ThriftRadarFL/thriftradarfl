import Link from "next/link";
import type { ReportCard } from "@/lib/report-card";
import { MARK_ICON } from "@/lib/report-card";
import { GRADE_CLASS, MARK_CLASS } from "@/lib/report-card-ui";
const MARK_SR = { pass: "complete", partial: "partly complete", missing: "missing", na: "not applicable" } as const;
export default function ReportCardPanel({ c }: { c: ReportCard }) {
  return (<div className="panel mb-4 min-w-0" id="report-card"><div className="panel-head flex items-center justify-between gap-2"><span>Info report card</span><Link href="/stores/report-cards" className="text-xs font-normal underline">All stores →</Link></div>
    <div className="flex min-w-0 flex-wrap items-start gap-4 p-3 text-sm">
      <div className="flex shrink-0 flex-col items-center"><span className={`flex h-14 w-14 items-center justify-center rounded-sm text-3xl font-black text-white shadow ${GRADE_CLASS[c.grade]}`} aria-label={`Info grade ${c.grade}, ${c.score} percent`}>{c.grade}</span><span className="mt-1 text-xs text-gray-600">{c.score}%</span></div>
      <ul className="min-w-0 flex-1 space-y-1">{c.checks.map((k) => <li key={k.key} className="flex min-w-0 gap-2"><span aria-hidden className={`w-4 shrink-0 font-bold ${MARK_CLASS[k.mark]}`}>{MARK_ICON[k.mark]}</span>
        <span className="min-w-0"><b>{k.label}</b><span className="sr-only"> ({MARK_SR[k.mark]})</span> — <span className="text-gray-700">{k.detail}</span></span></li>)}
        {c.tagReportsThisWeek != null && <li className="flex min-w-0 gap-2"><span aria-hidden className="w-4 shrink-0 text-gray-500">•</span><span className="min-w-0"><b>Color-tag reports this week</b> — {c.tagReportsThisWeek} <span className="text-xs text-gray-600">(crowdsourced · unverified · not graded)</span></span></li>}</ul>
      <p className="w-full text-xs text-gray-600">Grades how complete and fresh <b>our info</b> is, from what&apos;s on file — not the store&apos;s quality, prices or service. <Link href="/stores/report-cards#how" className="link">How it&apos;s graded</Link> · <Link href="/contact" className="link">Send a correction</Link></p></div></div>);
}
