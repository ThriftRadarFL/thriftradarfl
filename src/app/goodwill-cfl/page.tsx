import Link from "next/link";
import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { getVenues, getDealRules } from "@/lib/data";
import { DAYS } from "@/lib/deal-rules";
import {
  GWCFL_SHOP_URL,
  GWCFL_OFFERS,
  GWCFL_STACKING_NOTE,
  GWCFL_COUNTIES,
  gwcflCoveredRetail,
  gwcflUnconfirmed,
} from "@/lib/goodwill-cfl";
export const dynamic = "force-dynamic"; // store list follows verified deal rules in the DB
const title = "Goodwill CFL Color of the Week — verified deal rules";
const description =
  "Color of the Week (50% off most tagged clothing, shoes and wares, refreshes Sundays), seniors 55+ 10% Mondays, and military 10% Wednesdays at Goodwill Industries of Central Florida retail stores — sourced from goodwillcfl.org/shop.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/goodwill-cfl" } };
export default async function GoodwillCfl() {
  const [venues, rules] = await Promise.all([getVenues(), getDealRules()]);
  const covered = gwcflCoveredRetail(venues, rules);
  const unconfirmed = gwcflUnconfirmed(venues, rules);
  return (
    <div>
      <PageHead title="Goodwill CFL deals" sub="Color of the Week, senior &amp; military discounts — from the official shop page" />
      <p className="mb-4 border-l-4 border-cta bg-paper p-3 text-sm">
        <b>Sourced, not invented.</b> Everything below is copied from{" "}
        <a href={GWCFL_SHOP_URL} target="_blank" rel="noopener noreferrer" className="link">
          goodwillcfl.org/shop
        </a>
        . We do <b>not</b> invent the week&apos;s tag color (it&apos;s posted in store only) or apply these rules to outlets or the Winter Park Boutique until that&apos;s confirmed. Always check the sign at the register.
      </p>

      <section className="panel mb-4" aria-labelledby="offers-h">
        <h2 id="offers-h" className="panel-head">
          Verified weekly offers
        </h2>
        <ul className="divide-y divide-line text-sm">
          {GWCFL_OFFERS.map((o) => (
            <li key={o.key} className="px-4 py-3">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <b className="text-royal">{o.title}</b>
                <span className="pill bg-teal">{DAYS[o.day]}</span>
                <span className="text-xs text-teal">✓ sourced</span>
              </div>
              <p className="mt-1">{o.detail}</p>
              <p className="text-xs text-gray-600">{o.when}</p>
            </li>
          ))}
        </ul>
        <p className="border-t border-line bg-paper px-4 py-3 text-xs text-gray-700">
          <b>No stacking.</b> {GWCFL_STACKING_NOTE} {GWCFL_COUNTIES}
        </p>
      </section>

      <div className="mb-4 grid min-w-0 gap-4 md:grid-cols-2">
        <section className="panel min-w-0" aria-labelledby="color-h">
          <h2 id="color-h" className="panel-head">
            Which color is on sale this week?
          </h2>
          <div className="space-y-2 p-4 text-sm">
            <p>
              Goodwill CFL does not publish the current Color of the Week online — it&apos;s on a sign inside each retail store, and it refreshes on Sundays.
            </p>
            <p>
              Shoppers report what they see on our{" "}
              <Link href="/color-tags" className="link">
                Color Tag Board
              </Link>{" "}
              (crowdsourced &amp; unverified). Full weekday schedule:{" "}
              <Link href="/deals" className="link">
                Deal Days
              </Link>
              .
            </p>
            <Link href="/color-tags#report" className="btn-red inline-flex">
              Report this week&apos;s color →
            </Link>
          </div>
        </section>
        <section className="panel min-w-0" aria-labelledby="scope-h">
          <h2 id="scope-h" className="panel-head">
            What these offers cover
          </h2>
          <ul className="list-disc space-y-1 p-4 pl-8 text-sm text-gray-800">
            <li>GICF <b>retail</b> thrift stores only (not clearance outlets / bins).</li>
            <li>Color of the Week: textiles, shoes, and wares with the posted tag color.</li>
            <li>Senior (55+) Mondays and military Wednesdays: 10% each, per the shop page.</li>
            <li>Cannot combine discounts with each other or other offers.</li>
          </ul>
        </section>
      </div>

      <section className="panel mb-4" aria-labelledby="stores-h">
        <h2 id="stores-h" className="panel-head">
          Retail stores with these rules on file ({covered.length})
        </h2>
        <p className="border-b border-line px-4 py-2 text-xs text-gray-600">
          Listed only when we have a <b>verified</b> Sunday Color-of-the-Week deal rule for that store. Source: {GWCFL_SHOP_URL.replace(/^https?:\/\//, "")} (checked 2026-11-05).
        </p>
        {!covered.length ? (
          <p className="p-4 text-sm text-gray-700">No verified Color-of-the-Week rules on file yet.</p>
        ) : (
          <ul className="columns-1 gap-0 text-sm sm:columns-2">
            {covered.map((v) => (
              <li key={v.slug} className="break-inside-avoid border-b border-line px-4 py-2">
                <Link href={`/stores/${v.slug}`} className="font-bold text-royal hover:underline">
                  {v.name}
                </Link>{" "}
                <span className="text-xs text-gray-600">
                  · {v.city}
                  {v.phone ? ` · ${v.phone}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {unconfirmed.length > 0 && (
        <section className="panel mb-4" aria-labelledby="out-h">
          <h2 id="out-h" className="panel-head">
            Not confirmed for these GICF locations ({unconfirmed.length})
          </h2>
          <p className="border-b border-line px-4 py-2 text-xs text-gray-600">
            Clearance outlets use bin / by-the-pound pricing we have not verified. The Winter Park Boutique is listed separately on the shop page; we have <b>not</b> confirmed that Color of the Week / senior / military offers apply there — so we do not invent rules for it.
          </p>
          <ul className="text-sm">
            {unconfirmed.map((v) => (
              <li key={v.slug} className="border-b border-line px-4 py-2 last:border-0">
                <Link href={`/stores/${v.slug}`} className="font-bold text-royal hover:underline">
                  {v.name}
                </Link>{" "}
                <span className="text-xs text-gray-600">
                  · {v.city}
                  {v.type === "outlet_bins" ? " · outlet bins" : ""}
                  {v.slug.includes("boutique") ? " · boutique" : ""} ·{" "}
                  <span className="font-bold uppercase text-cta-dark">unverified for these offers</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-gray-600">
        Official source:{" "}
        <a href={GWCFL_SHOP_URL} target="_blank" rel="noopener noreferrer" className="link">
          goodwillcfl.org/shop
        </a>
        . Store addresses:{" "}
        <a href="https://www.goodwillcfl.org/locations/" target="_blank" rel="noopener noreferrer" className="link">
          goodwillcfl.org/locations
        </a>
        . Bin restock days (mostly unverified):{" "}
        <Link href="/bins" className="link">
          Bins &amp; Restock Heatmap
        </Link>
        .
      </p>
    </div>
  );
}
