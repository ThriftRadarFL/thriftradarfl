import type { Venue } from "./data";
/** Stores that can get color-tag reports: thrift stores and outlets (not auction houses / estate companies). */
export const tagVenues = (venues: Venue[]) => venues.filter((v) => v.type === "thrift" || v.type === "outlet_bins" || v.type === "consignment").sort((a, b) => a.name.localeCompare(b.name));
const fmt = (iso: string) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
export const weekLabel = (weekOf: string, expiresOn: string) => `${fmt(weekOf)}–${fmt(expiresOn)}`;
/** "3h ago" style relative time for report freshness. */
export function ago(iso: string, now = new Date()) {
  const m = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 60000));
  if (m < 60) return `${m || 1}m ago`; const h = Math.round(m / 60); if (h < 48) return `${h}h ago`; return `${Math.round(h / 24)}d ago`;
}
