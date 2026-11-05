// Facts only from https://www.goodwillcfl.org/shop/ (checked 2026-11-05). Do not invent store-specific prices or boutique/outlet coverage.
import type { DealRule } from "./deal-rules";
import type { Venue } from "./data";

export const GWCFL_SHOP_URL = "https://www.goodwillcfl.org/shop/";
export const GWCFL_ORG = "gwcfl";

/** Verified chain-wide offers published on goodwillcfl.org/shop — retail stores only. */
export const GWCFL_OFFERS = [
  {
    key: "color",
    title: "Color of the Week",
    when: "Color refreshes every Sunday; the current color is posted in store only",
    detail: "Half off (50%) on most color-tagged textiles (clothing), shoes, and wares.",
    day: 0 as const,
  },
  {
    key: "senior",
    title: "Senior discount",
    when: "Mondays",
    detail: "10% off for shoppers age 55 and older.",
    day: 1 as const,
  },
  {
    key: "military",
    title: "Military discount",
    when: "Wednesdays",
    detail: "10% off for active-duty or retired military.",
    day: 3 as const,
  },
] as const;

export const GWCFL_STACKING_NOTE =
  "Discounts cannot be combined or stacked with any other offers. Color of the Week applies only to textiles (clothing), shoes, and wares.";

export const GWCFL_COUNTIES =
  "Available at Goodwill Industries of Central Florida retail stores in Brevard, Lake, Orange, Osceola, Seminole, and Volusia counties.";

/** True when this venue has a verified Color-of-the-Week rule on file (our proxy for “GICF retail covered by /shop”). */
export function hasVerifiedColorOfWeek(rules: DealRule[], venueSlug: string): boolean {
  return rules.some((r) => r.venue === venueSlug && r.kind === "color_tag" && r.verified && r.day === 0);
}

/** GICF retail stores we list as covered — only those with a verified Sunday color_tag rule. Never invents boutique/outlet coverage. */
export function gwcflCoveredRetail(venues: Venue[], rules: DealRule[]): Venue[] {
  return venues
    .filter((v) => v.org === GWCFL_ORG && v.type === "thrift" && hasVerifiedColorOfWeek(rules, v.slug))
    .slice()
    .sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
}

/** GICF locations on our map that are not covered by the verified /shop retail offers (outlets, boutique, or thrift without a verified color rule). */
export function gwcflUnconfirmed(venues: Venue[], rules: DealRule[]): Venue[] {
  return venues
    .filter((v) => v.org === GWCFL_ORG && !hasVerifiedColorOfWeek(rules, v.slug))
    .slice()
    .sort((a, b) => a.city.localeCompare(b.city) || a.name.localeCompare(b.name));
}

/** Match a verified GICF retail rule to a published chain-wide offer key (color / senior / military). */
export function gwcflChainOfferKey(r: DealRule): (typeof GWCFL_OFFERS)[number]["key"] | null {
  if (!r.verified) return null;
  if (r.day === 0 && r.kind === "color_tag") return "color";
  if (r.day === 1 && r.kind === "senior_day" && /senior/i.test(r.label)) return "senior";
  if (r.day === 3 && r.kind === "senior_day" && /military/i.test(r.label)) return "military";
  return null;
}

/** True when this rule is a verified chain-wide offer at a covered GICF retail store (safe to collapse on /deals). */
export function isGwcflChainRule(r: DealRule, coveredSlugs: ReadonlySet<string>): boolean {
  return coveredSlugs.has(r.venue) && gwcflChainOfferKey(r) != null;
}

export type GwcflDaySummary = {
  key: (typeof GWCFL_OFFERS)[number]["key"];
  title: string;
  detail: string;
  color: string;
  storeCount: number;
  discountPct?: number;
};

/**
 * Split one weekday's deal rules into a single GWCFL chain summary (when ≥2 covered stores share it)
 * plus every other rule listed individually. Never invents boutique/outlet coverage.
 */
export function collapseDayRules(
  day: number,
  rules: DealRule[],
  coveredSlugs: ReadonlySet<string>,
): { summaries: GwcflDaySummary[]; others: DealRule[] } {
  const dayRules = rules.filter((r) => r.day === day);
  const buckets = new Map<(typeof GWCFL_OFFERS)[number]["key"], DealRule[]>();
  const others: DealRule[] = [];
  for (const r of dayRules) {
    const key = isGwcflChainRule(r, coveredSlugs) ? gwcflChainOfferKey(r) : null;
    if (!key) {
      others.push(r);
      continue;
    }
    const list = buckets.get(key) ?? [];
    list.push(r);
    buckets.set(key, list);
  }
  const summaries: GwcflDaySummary[] = [];
  const collapsed = new Set<(typeof GWCFL_OFFERS)[number]["key"]>();
  for (const offer of GWCFL_OFFERS) {
    if (offer.day !== day) continue;
    const list = buckets.get(offer.key);
    if (!list?.length) continue;
    // Fewer than 2 → keep individual pills (no clutter to collapse yet)
    if (list.length < 2) continue;
    const pct = list.find((r) => r.discountPct != null)?.discountPct;
    summaries.push({
      key: offer.key,
      title: offer.title,
      detail: offer.detail,
      color: list[0].color || (offer.key === "color" ? "bg-teal" : "bg-gray-700"),
      storeCount: list.length,
      discountPct: pct,
    });
    collapsed.add(offer.key);
  }
  // Non-collapsed bucket keys (single-store matches or unexpected) stay as individual pills
  for (const [key, list] of buckets) {
    if (collapsed.has(key)) continue;
    others.push(...list);
  }
  return { summaries, others };
}
