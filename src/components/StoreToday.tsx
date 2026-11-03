import Link from "next/link";
import { t12 } from "@/lib/time";
import type { StoreToday as T } from "@/lib/store-today";
import { whenLabel } from "@/lib/store-today";
import { DAYS } from "@/lib/deal-rules";
/** "What's on today" box for a store page: today's deals (or the next one), today's hours. Server component. */
export default function StoreToday({ t, compact }: { t: T; compact?: boolean }) {
  const date = new Date(t.date + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
  if (compact) {
    if (t.today.length) return <span className="pill bg-cta" title={t.today.map((r) => r.label).join(" · ")}>Today: {t.today[0].discountPct ? `${t.today[0].discountPct}% off` : t.today[0].label.split(/[(:]/)[0].trim().slice(0, 28)}</span>;
    return t.next ? <span className="text-xs text-gray-600">Next deal {whenLabel(t.next.inDays, t.next.rule.day)}</span> : null;
  }
  return (<section aria-labelledby="today-h" className="panel mb-4 overflow-hidden">
    <h2 id="today-h" className="panel-head flex flex-wrap items-center justify-between gap-2"><span>Today at this store · {t.dayName} {date}</span>
      {t.hours && <span className="rounded-sm bg-white/15 px-2 py-0.5 text-xs normal-case tracking-normal">{t.hours === "Closed" ? "Closed today" : `Open ${t.hours}`}</span>}</h2>
    <div className="bg-gradient-to-b from-white to-paper p-4 text-sm">
      {t.today.length ? <ul className="space-y-2">{t.today.map((r) => <li key={r.id ?? r.label} className="flex flex-wrap items-center gap-2">
        {r.discountPct ? <span className="pill bg-cta">{r.discountPct}% OFF</span> : <span className="pill bg-royal">Deal</span>}
        <b>{r.label}</b>{r.time && <span className="text-gray-700">from {t12(r.time)}</span>}{!r.verified && <span className="text-xs text-gray-600">(unverified — check signage)</span>}</li>)}</ul>
        : <p className="text-gray-700">No deal day today.{t.next ? <> Next: <b>{whenLabel(t.next.inDays, t.next.rule.day)}{t.next.inDays > 1 ? ` (${DAYS[t.next.rule.day]})` : ""}</b> — {t.next.rule.label}{t.next.rule.time ? ` · ${t12(t.next.rule.time)}` : ""}.</> : " No weekly deals are listed for this store yet."}</p>}
      {t.today.length > 0 && t.next && <p className="mt-2 text-xs text-gray-600">Next after today: {whenLabel(t.next.inDays, t.next.rule.day)} — {t.next.rule.label}</p>}
      <p className="mt-2 text-xs"><Link href="/today" className="link">Everything on today across Central Florida →</Link></p></div></section>);
}
