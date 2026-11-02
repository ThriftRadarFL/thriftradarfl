// UNVERIFIED DEMO schedules — invented for layout/testing. Verify with each store before publishing.
export type DealKind = "color_tag" | "half_off" | "senior_day" | "restock" | "bins_rotation" | "dollar_day";
export type DealRule = { id?: string; venue: string; day: number; kind: DealKind; label: string; color: string; time?: string; discountPct?: number; verified: boolean };
export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const dealRules: DealRule[] = [
  { venue: "goodwill-port-orange", day: 0, kind: "color_tag", label: "Color of the Week 50% off (color changes Sundays, posted in store)", discountPct: 50, color: "bg-teal", verified: true },
  { venue: "goodwill-port-orange", day: 1, kind: "senior_day", label: "Seniors 55+ discount (ask in store for amount)", color: "bg-gray-500", verified: true },
  { venue: "goodwill-port-orange", day: 3, kind: "senior_day", label: "Military 10% off", discountPct: 10, color: "bg-gray-500", verified: true },
  { venue: "goodwill-daytona-isb", day: 0, kind: "color_tag", label: "Color of the Week 50% off (color changes Sundays, posted in store)", discountPct: 50, color: "bg-teal", verified: true },
  { venue: "goodwill-daytona-isb", day: 1, kind: "senior_day", label: "Seniors 55+ discount (ask in store for amount)", color: "bg-gray-500", verified: true },
  { venue: "goodwill-daytona-isb", day: 3, kind: "senior_day", label: "Military 10% off", discountPct: 10, color: "bg-gray-500", verified: true },
  { venue: "goodwill-port-orange", day: 2, kind: "restock", label: "Fresh housewares floor (AM)", color: "bg-royal", time: "09:00", verified: false },
  { venue: "goodwill-daytona-isb", day: 5, kind: "half_off", label: "Half-off clothing", discountPct: 50, color: "bg-coral", verified: false },
  { venue: "goodwill-pine-hills-outlet", day: 1, kind: "restock", label: "Heavy bin restock (AM)", color: "bg-royal", time: "08:00", verified: false },
  { venue: "goodwill-pine-hills-outlet", day: 4, kind: "dollar_day", label: "Bins $/lb discount day", color: "bg-coral", verified: false },
  { venue: "goodwill-pine-hills-outlet", day: 6, kind: "bins_rotation", label: "Saturday bin rotations hourly", color: "bg-royal", verified: false },
  { venue: "goodwill-taft-outlet", day: 2, kind: "restock", label: "Heavy bin restock (AM)", color: "bg-royal", time: "08:00", verified: false },
  { venue: "goodwill-taft-outlet", day: 4, kind: "dollar_day", label: "Select bins $1 items", color: "bg-coral", verified: false },
  { venue: "goodwill-taft-outlet", day: 6, kind: "bins_rotation", label: "Furniture rotation", color: "bg-royal", time: "10:00", verified: false },
  { venue: "berners-auction-deland", day: 2, kind: "restock", label: "Preview day", color: "bg-gray-500", verified: false },
  { venue: "berners-auction-deland", day: 3, kind: "restock", label: "Weekly auction 6:30pm", color: "bg-royal", time: "18:30", verified: true },
];
export const nextDealDate = (r: DealRule, from = new Date()) => { const d = new Date(from); d.setDate(d.getDate() + ((r.day - d.getDay() + 7) % 7)); return d.toLocaleDateString("en-CA"); };
export const ruleId = (r: Pick<DealRule, "venue" | "day" | "label">) => `${r.venue}-${r.day}-${r.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
export const DEAL_KINDS: DealKind[] = ["color_tag", "half_off", "senior_day", "restock", "bins_rotation", "dollar_day"];
export const KIND_COLOR: Record<DealKind, string> = { color_tag: "bg-teal", half_off: "bg-coral", senior_day: "bg-gray-500", restock: "bg-royal", bins_rotation: "bg-royal", dollar_day: "bg-coral" };
