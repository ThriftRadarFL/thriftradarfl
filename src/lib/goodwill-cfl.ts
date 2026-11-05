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
