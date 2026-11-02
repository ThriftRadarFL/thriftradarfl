// UNVERIFIED DEMO schedules — invented for layout/testing. Verify with each store before publishing.
export type DealRule = { venue: string; day: number; label: string; color: string; time?: string; verified: boolean };
export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const dealRules: DealRule[] = [
  { venue: "goodwill-port-orange", day: 0, label: "Color-of-week tag 50% off", color: "bg-teal", verified: false },
  { venue: "goodwill-port-orange", day: 3, label: "Senior/Military 10% off", color: "bg-gray-500", verified: false },
  { venue: "goodwill-port-orange", day: 6, label: "Rotating tag color 50% off", color: "bg-teal", verified: false },
  { venue: "goodwill-daytona-isb", day: 1, label: "Color-tag 50% off", color: "bg-teal", verified: false },
  { venue: "goodwill-daytona-isb", day: 5, label: "Half-off clothing", color: "bg-coral", verified: false },
  { venue: "goodwill-pine-hills-outlet", day: 1, label: "Heavy bin restock (AM)", color: "bg-royal", time: "08:00", verified: false },
  { venue: "goodwill-pine-hills-outlet", day: 4, label: "Bins $/lb discount day", color: "bg-coral", verified: false },
  { venue: "goodwill-taft-outlet", day: 2, label: "Heavy bin restock (AM)", color: "bg-royal", time: "08:00", verified: false },
  { venue: "goodwill-taft-outlet", day: 6, label: "Furniture rotation", color: "bg-royal", time: "10:00", verified: false },
  { venue: "berners-auction-deland", day: 3, label: "Weekly auction 6:30pm", color: "bg-royal", time: "18:30", verified: true },
  { venue: "berners-auction-deland", day: 2, label: "Preview day", color: "bg-gray-500", verified: false },
];
