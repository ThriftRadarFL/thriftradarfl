// UNVERIFIED DEMO schedules — invented for layout/testing. Verify with each store before publishing.
export type DealKind = "color_tag" | "half_off" | "senior_day" | "restock" | "bins_rotation" | "dollar_day";
export type DealRule = { id?: string; venue: string; day: number; kind: DealKind; label: string; color: string; time?: string; discountPct?: number; verified: boolean };
export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const dealRules: DealRule[] = [
  // VERIFIED 2026-11-04 from official https://www.goodwillcfl.org/shop (applies to GICF retail stores; outlets/boutique excluded; discounts don't stack)
  { venue: "goodwill-deland", day: 0, kind: "color_tag", label: "Color of the Week 50% off (color changes Sundays, posted in store)", discountPct: 50, color: "bg-teal", verified: true },
  { venue: "goodwill-deland", day: 1, kind: "senior_day", label: "Seniors 55+ 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-deland", day: 3, kind: "senior_day", label: "Military 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-holly-hill", day: 0, kind: "color_tag", label: "Color of the Week 50% off (color changes Sundays, posted in store)", discountPct: 50, color: "bg-teal", verified: true },
  { venue: "goodwill-holly-hill", day: 1, kind: "senior_day", label: "Seniors 55+ 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-holly-hill", day: 3, kind: "senior_day", label: "Military 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-orange-city", day: 0, kind: "color_tag", label: "Color of the Week 50% off (color changes Sundays, posted in store)", discountPct: 50, color: "bg-teal", verified: true },
  { venue: "goodwill-orange-city", day: 1, kind: "senior_day", label: "Seniors 55+ 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-orange-city", day: 3, kind: "senior_day", label: "Military 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-sanford", day: 0, kind: "color_tag", label: "Color of the Week 50% off (color changes Sundays, posted in store)", discountPct: 50, color: "bg-teal", verified: true },
  { venue: "goodwill-sanford", day: 1, kind: "senior_day", label: "Seniors 55+ 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-sanford", day: 3, kind: "senior_day", label: "Military 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-west-sanford", day: 0, kind: "color_tag", label: "Color of the Week 50% off (color changes Sundays, posted in store)", discountPct: 50, color: "bg-teal", verified: true },
  { venue: "goodwill-west-sanford", day: 1, kind: "senior_day", label: "Seniors 55+ 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-west-sanford", day: 3, kind: "senior_day", label: "Military 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-fern-park", day: 0, kind: "color_tag", label: "Color of the Week 50% off (color changes Sundays, posted in store)", discountPct: 50, color: "bg-teal", verified: true },
  { venue: "goodwill-fern-park", day: 1, kind: "senior_day", label: "Seniors 55+ 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-fern-park", day: 3, kind: "senior_day", label: "Military 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-casselberry", day: 0, kind: "color_tag", label: "Color of the Week 50% off (color changes Sundays, posted in store)", discountPct: 50, color: "bg-teal", verified: true },
  { venue: "goodwill-casselberry", day: 1, kind: "senior_day", label: "Seniors 55+ 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-casselberry", day: 3, kind: "senior_day", label: "Military 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-oviedo", day: 0, kind: "color_tag", label: "Color of the Week 50% off (color changes Sundays, posted in store)", discountPct: 50, color: "bg-teal", verified: true },
  { venue: "goodwill-oviedo", day: 1, kind: "senior_day", label: "Seniors 55+ 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-oviedo", day: 3, kind: "senior_day", label: "Military 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-curry-ford", day: 0, kind: "color_tag", label: "Color of the Week 50% off (color changes Sundays, posted in store)", discountPct: 50, color: "bg-teal", verified: true },
  { venue: "goodwill-curry-ford", day: 1, kind: "senior_day", label: "Seniors 55+ 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-curry-ford", day: 3, kind: "senior_day", label: "Military 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-goldenrod", day: 0, kind: "color_tag", label: "Color of the Week 50% off (color changes Sundays, posted in store)", discountPct: 50, color: "bg-teal", verified: true },
  { venue: "goodwill-goldenrod", day: 1, kind: "senior_day", label: "Seniors 55+ 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-goldenrod", day: 3, kind: "senior_day", label: "Military 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-south-obt", day: 0, kind: "color_tag", label: "Color of the Week 50% off (color changes Sundays, posted in store)", discountPct: 50, color: "bg-teal", verified: true },
  { venue: "goodwill-south-obt", day: 1, kind: "senior_day", label: "Seniors 55+ 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-south-obt", day: 3, kind: "senior_day", label: "Military 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-waterford-lakes", day: 0, kind: "color_tag", label: "Color of the Week 50% off (color changes Sundays, posted in store)", discountPct: 50, color: "bg-teal", verified: true },
  { venue: "goodwill-waterford-lakes", day: 1, kind: "senior_day", label: "Seniors 55+ 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-waterford-lakes", day: 3, kind: "senior_day", label: "Military 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-apopka", day: 0, kind: "color_tag", label: "Color of the Week 50% off (color changes Sundays, posted in store)", discountPct: 50, color: "bg-teal", verified: true },
  { venue: "goodwill-apopka", day: 1, kind: "senior_day", label: "Seniors 55+ 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-apopka", day: 3, kind: "senior_day", label: "Military 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-port-orange", day: 0, kind: "color_tag", label: "Color of the Week 50% off (color changes Sundays, posted in store)", discountPct: 50, color: "bg-teal", verified: true },
  { venue: "goodwill-port-orange", day: 1, kind: "senior_day", label: "Seniors 55+ 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-port-orange", day: 3, kind: "senior_day", label: "Military 10% off", discountPct: 10, color: "bg-gray-700", verified: true },
  { venue: "goodwill-port-orange", day: 2, kind: "restock", label: "Fresh housewares floor (AM)", color: "bg-royal", time: "09:00", verified: false },
  { venue: "goodwill-pine-hills-outlet", day: 1, kind: "restock", label: "Heavy bin restock (AM)", color: "bg-royal", time: "08:00", verified: false },
  { venue: "goodwill-pine-hills-outlet", day: 4, kind: "dollar_day", label: "Bins $/lb discount day", color: "bg-coral", verified: false },
  { venue: "goodwill-pine-hills-outlet", day: 6, kind: "bins_rotation", label: "Saturday bin rotations hourly", color: "bg-royal", verified: false },
  { venue: "goodwill-taft-outlet", day: 2, kind: "restock", label: "Heavy bin restock (AM)", color: "bg-royal", time: "08:00", verified: false },
  { venue: "goodwill-taft-outlet", day: 4, kind: "dollar_day", label: "Select bins $1 items", color: "bg-coral", verified: false },
  { venue: "goodwill-taft-outlet", day: 6, kind: "bins_rotation", label: "Furniture rotation", color: "bg-royal", time: "10:00", verified: false },
  { venue: "berners-auction-deland", day: 2, kind: "restock", label: "Preview day", color: "bg-gray-700", verified: false },
  { venue: "berners-auction-deland", day: 3, kind: "restock", label: "Weekly auction", color: "bg-royal", time: "18:30", verified: true },
  // Store-specific, UNVERIFIED (Yelp owner reply / aggregators) — https://www.salvationarmyusa.org/fl/orlando/w-colonial-dr-1/
  { venue: "salvation-army-w-colonial-orlando", day: 3, kind: "half_off", label: "Customer Appreciation Day: 50% off all tag colors but one (Yelp)", discountPct: 50, color: "bg-coral", verified: false },
  { venue: "omg-thrift", day: 1, kind: "color_tag", label: "Color of the Week half price (changes Mondays, per thriftstores.net)", discountPct: 50, color: "bg-teal", verified: false },
  { venue: "the-hope-chest", day: 6, kind: "dollar_day", label: "$1 clothing, non-boutique (per mylocalnooks.com)", color: "bg-coral", verified: false },
  { venue: "city-thrift-edgewater", day: 2, kind: "senior_day", label: "Seniors 30% off (per uncoveringflorida.com)", discountPct: 30, color: "bg-gray-700", verified: false },
  { venue: "city-thrift-edgewater", day: 3, kind: "senior_day", label: "Military discount (per uncoveringflorida.com)", color: "bg-gray-700", verified: false },
];
/** Next date (YYYY-MM-DD, Eastern time) this rule applies, today included. Timezone-safe on UTC servers. */
export const nextDealDate = (r: DealRule, from = new Date()) => { const iso = from.toLocaleDateString("en-CA", { timeZone: "America/New_York" }); const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + ((r.day - d.getUTCDay() + 7) % 7)); return d.toISOString().slice(0, 10); };
export const ruleId = (r: Pick<DealRule, "venue" | "day" | "label">) => `${r.venue}-${r.day}-${r.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
export const DEAL_KINDS: DealKind[] = ["color_tag", "half_off", "senior_day", "restock", "bins_rotation", "dollar_day"];
export const KIND_COLOR: Record<DealKind, string> = { color_tag: "bg-teal", half_off: "bg-coral", senior_day: "bg-gray-700", restock: "bg-royal", bins_rotation: "bg-royal", dollar_day: "bg-coral" };

export type GroupedDeal = { key: string; label: string; color: string; verified: boolean; count: number; names: string[] };
/** Collapse identical chain-wide deal labels (e.g. Goodwill Color of the Week on 13 stores) into one calendar pill. */
export function groupChainDeals(rules: DealRule[], venues: { slug: string; name: string; org?: string }[]): GroupedDeal[] {
  const nameOf = (slug: string) => venues.find((v) => v.slug === slug)?.name ?? slug;
  const map = new Map<string, GroupedDeal>();
  for (const r of rules) {
    const key = `${r.day}|${r.kind}|${r.label}`;
    const g = map.get(key) ?? { key, label: r.label, color: r.color, verified: r.verified, count: 0, names: [] };
    g.count += 1;
    g.verified = g.verified && r.verified;
    g.names.push(nameOf(r.venue));
    map.set(key, g);
  }
  return [...map.values()];
}
