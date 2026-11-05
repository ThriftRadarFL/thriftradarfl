import type { Metadata } from "next";
import { dowOf } from "@/lib/store-today";
import { bestDay } from "@/lib/best-day";
import { todayET } from "@/lib/cities";
import { t12 } from "@/lib/time";
import Link from "next/link";
import { PageHead } from "@/components/ui";
import { getVenues, getDealRules } from "@/lib/data";
import { DAYS } from "@/lib/deal-rules";
import CalendarLinks from "@/components/CalendarLinks";
import {
  GWCFL_OFFERS,
  GWCFL_SHOP_URL,
  collapseDayRules,
  gwcflCoveredRetail,
  hasVerifiedColorOfWeek,
  isGwcflChainRule,
} from "@/lib/goodwill-cfl";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const title = "Deal Days — Goodwill color tags, half-off & bin restocks";
const description =
  "Weekly schedule of Goodwill CFL Color of the Week, senior & military discounts, half-off days and outlet bin restocks in Central Florida — verified chain rules collapsed so you can scan the week.";
export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/deals" },
  openGraph: { title, description, url: `${SITE_URL}/deals`, siteName: SITE_NAME, type: "website" },
  twitter: { card: "summary_large_image", title, description },
};
export const dynamic = "force-dynamic"; // "today" highlight must follow the Eastern-time date, not the build date
const order = [1, 2, 3, 4, 5, 6, 0];

export default async function Deals() {
  const [venues, dealRules] = await Promise.all([getVenues(), getDealRules()]);
  const name = (s: string) => venues.find((v) => v.slug === s)?.name ?? s;
  const today = dowOf(todayET());
  const covered = gwcflCoveredRetail(venues, dealRules);
  const coveredSlugs = new Set(covered.map((v) => v.slug));
  const todayOffer = GWCFL_OFFERS.find((o) => o.day === today);
  const gwcflVenues = venues.filter((v) => coveredSlugs.has(v.slug));
  const otherVenues = venues.filter((v) => !coveredSlugs.has(v.slug));

  return (
    <div>
      <PageHead title="Deal Days" sub="Color-tag days, half-off days and bin restocks by weekday" />
      <p className="mb-3 border-l-4 border-cta bg-paper p-2 text-sm">
        <b>Heads up:</b> schedules marked <i>unverified</i> haven&apos;t been confirmed with the store yet — check
        signage or call ahead. Which color is on sale this week? See the shopper-reported{" "}
        <Link href="/color-tags" className="link">
          Color Tag Board
        </Link>{" "}
        (crowdsourced). Verified Goodwill CFL Color of the Week / senior / military rules:{" "}
        <Link href="/goodwill-cfl" className="link">
          Goodwill CFL deals
        </Link>
        . Restock and bin-rotation days by store:{" "}
        <Link href="/bins" className="link">
          Bins &amp; Restock Heatmap
        </Link>
        .
      </p>

      {covered.length > 0 && (
        <section className="panel mb-4" aria-labelledby="gwcfl-today-h">
          <h2 id="gwcfl-today-h" className="panel-head">
            Goodwill CFL retail · verified chain offers
          </h2>
          <div className="space-y-2 p-3 text-sm">
            {todayOffer ? (
              <p>
                <span className="pill bg-cta mr-1">Today · {DAYS[today]}</span>
                <b className="text-royal">{todayOffer.title}</b>
                {todayOffer.key === "color" ? " — 50% off most tagged textiles, shoes &amp; wares" : ` — ${todayOffer.detail}`}
                . Color / eligibility posted in store.{" "}
                <span className="text-xs text-teal">✓ sourced · {covered.length} stores</span>
              </p>
            ) : (
              <p>
                <span className="pill bg-paper mr-1 border border-line text-ink">Today · {DAYS[today]}</span>
                No Goodwill CFL chain discount today (Color of the Week still applies all week once the Sunday color is
                posted). Seniors Mon · Military Wed.
              </p>
            )}
            <ul className="flex flex-wrap gap-2 text-xs">
              {GWCFL_OFFERS.map((o) => (
                <li key={o.key} className={`pill ${o.day === today ? "bg-cta" : o.key === "color" ? "bg-teal" : "bg-gray-700"}`}>
                  {DAYS[o.day]}: {o.title}
                  {o.key === "color" ? " 50%" : " 10%"}
                </li>
              ))}
            </ul>
            <p className="text-xs text-gray-600">
              Same rules at every listed GICF <b>retail</b> store — outlets &amp; Winter Park Boutique not confirmed. Source:{" "}
              <a href={GWCFL_SHOP_URL} target="_blank" rel="noopener noreferrer" className="link">
                goodwillcfl.org/shop
              </a>
              .{" "}
              <Link href="/goodwill-cfl" className="link">
                Full explainer →
              </Link>
            </p>
          </div>
        </section>
      )}

      <div className="panel mb-4 p-3">
        <p className="mb-2 text-sm">
          Put every deal day in your phone&apos;s calendar — repeats weekly and updates when schedules change.
        </p>
        <CalendarLinks path="/api/calendar/deals" label="all deal days" />
        <p className="mt-3 text-sm">
          <Link href="/deals/week" className="btn-red">
            🖨 This week&apos;s printable sheet
          </Link>
        </p>
      </div>

      <div className="panel">
        <div className="panel-head">Weekly schedule</div>
        <p className="border-b border-line bg-paper px-3 py-2 text-xs text-gray-600">
          Goodwill CFL chain offers appear once per day (not once per store). Other stores and unverified schedules stay
          listed individually.
        </p>
        <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-7">
          {order.map((d) => {
            const { summaries, others } = collapseDayRules(d, dealRules, coveredSlugs);
            const empty = !summaries.length && !others.length;
            return (
              <div
                key={d}
                className={`bg-white sm:min-h-48 ${d === today ? "ring-2 ring-cta ring-inset" : ""}`}
              >
                <div className="border-b border-line bg-paper px-2 py-1 text-xs font-bold text-royal">
                  {DAYS[d]}
                  {d === today && " · today"}
                </div>
                <div className="space-y-1 p-1.5">
                  {summaries.map((s) => (
                    <div key={s.key} className={`pill ${s.color} block whitespace-normal`}>
                      <Link href="/goodwill-cfl" className="font-bold underline-offset-2 hover:underline">
                        Goodwill CFL · {s.title}
                        {s.discountPct ? ` ${s.discountPct}%` : ""}
                      </Link>
                      <div className="text-[11px] font-normal">
                        {s.storeCount} retail stores · ✓ sourced
                      </div>
                    </div>
                  ))}
                  {others.map((r) => (
                    <div key={r.id ?? `${r.venue}-${r.day}-${r.label}`} className={`pill ${r.color} block whitespace-normal`}>
                      {r.label}
                      {r.time && ` · ${t12(r.time)}`}
                      <div className="text-[11px] font-normal">
                        {name(r.venue)}
                        {!r.verified && " · unverified"}
                      </div>
                    </div>
                  ))}
                  {empty && <p className="px-1 py-2 text-[11px] italic text-gray-500">Nothing on file</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {gwcflVenues.length > 0 && (
        <div className="panel mt-4">
          <div className="panel-head">Goodwill CFL retail ({gwcflVenues.length}) · chain offers on file</div>
          <p className="border-b border-line bg-paper px-4 py-2 text-xs text-gray-600">
            Each store below has the verified Sunday Color of the Week rule. Extra store-only notes (restocks, etc.)
            still show when we have them.
          </p>
          <ul>
            {gwcflVenues.map((v) => {
              const extras = dealRules.filter((r) => r.venue === v.slug && !isGwcflChainRule(r, coveredSlugs));
              const b = bestDay(v.slug, dealRules, v.hoursJson);
              return (
                <li key={v.slug} className="border-b border-line px-4 py-2 text-sm last:border-0">
                  <Link href={`/stores/${v.slug}`} className="font-bold text-royal hover:underline">
                    {v.name}
                  </Link>{" "}
                  <span className="text-gray-600">· {v.city}</span>
                  {b ? <span className="pill ml-2 bg-cta">Best: {b.best.name}</span> : null}
                  <div className="text-xs text-gray-700">
                    ✓ GWCFL: Sun Color of the Week 50% · Mon Seniors 55+ 10% · Wed Military 10%
                    {extras.length
                      ? " · " +
                        extras
                          .map((r) => `${DAYS[r.day]}: ${r.label}${r.verified ? "" : " (unverified)"}`)
                          .join(" · ")
                      : ""}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="panel mt-4">
        <div className="panel-head">Other stores</div>
        <ul>
          {otherVenues.map((v) => {
            const rules = dealRules.filter((r) => r.venue === v.slug);
            const b = bestDay(v.slug, dealRules, v.hoursJson);
            const gwcflNote =
              v.org === "gwcfl" && !hasVerifiedColorOfWeek(dealRules, v.slug)
                ? " · GICF outlet/boutique — chain offers not confirmed"
                : "";
            return (
              <li key={v.slug} className="border-b border-line px-4 py-2 text-sm last:border-0">
                <Link href={`/stores/${v.slug}`} className="font-bold text-royal hover:underline">
                  {v.name}
                </Link>{" "}
                <span className="text-gray-600">
                  · {v.city}
                  {gwcflNote}
                </span>
                {b ? <span className="pill ml-2 bg-cta">Best: {b.best.name}</span> : null}
                <div>
                  {rules.map((r) => `${DAYS[r.day]}: ${r.label}${r.verified ? "" : " (unverified)"}`).join(" · ") ||
                    "No rules yet"}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
