// Store report cards: grade how complete and fresh OUR info about each store is (pure, tested).
// Graded only from data on file (hours, deal rules, coordinates, phone, source + "checked YYYY-MM-DD" dates in notes).
// It never rates the store itself, its prices or its service. Crowdsourced color-tag reports are shown but NOT graded.
import type { Venue } from "./data";
import type { DealRule } from "./deal-rules";
import { rawHoursOn } from "./store-today";
import { phoneOk } from "./data-quality";
import { isActive, type TagReport } from "./color-tags";
export type Mark = "pass" | "partial" | "missing" | "na";
export type CheckKey = "listing" | "hours" | "deals" | "pin" | "phone" | "source";
export type Check = { key: CheckKey; label: string; mark: Mark; detail: string };
export type Grade = "A" | "B" | "C" | "D" | "F";
export type ReportCard = { slug: string; name: string; city: string; type: string; grade: Grade; score: number; checks: Check[]; checkedOn: string | null; tagReportsThisWeek: number | null };
export const POINTS: Record<Mark, number> = { pass: 2, partial: 1, missing: 0, na: 0 };
export const LABELS: Record<CheckKey, string> = { listing: "Listing confirmed", hours: "Hours on file", deals: "Deal-day info", pin: "Map pin", phone: "Phone number", source: "Source freshness" };
/** Latest "checked YYYY-MM-DD" date mentioned in the notes, or null. */
export function lastChecked(notes: string | null | undefined): string | null {
  const ds = [...(notes ?? "").matchAll(/checked (\d{4}-\d{2}-\d{2})/gi)].map((m) => m[1]).sort(); return ds.at(-1) ?? null;
}
const daysBetween = (a: string, b: string) => Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 864e5);
export const gradeFor = (pct: number): Grade => (pct >= 90 ? "A" : pct >= 75 ? "B" : pct >= 60 ? "C" : pct >= 40 ? "D" : "F");
const DAYN = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
/** @param tagReports approved color-tag reports for this store this week (crowdsourced), or null if the store type doesn't take them. */
export function reportCard(v: Venue, rules: DealRule[], today: string, tagReports: number | null = null): ReportCard {
  const notes = v.notes ?? ""; const unverifiedListing = /UNVERIFIED listing/i.test(notes); const checks: Check[] = [];
  const add = (key: CheckKey, mark: Mark, detail: string) => checks.push({ key, label: LABELS[key], mark, detail });
  add("listing", unverifiedListing ? "missing" : "pass", unverifiedListing ? "Only seen in third-party directories — confirm the store is open before visiting" : "Listed by the store/organization's own site or another primary source");
  const covered = DAYN.filter((_, d) => rawHoursOn(v.hoursJson, d) != null).length;
  const hoursSoft = unverifiedListing || /hours[^.]*\b(unverified|aggregator)\b/i.test(notes) || /\((aggregator)\)/i.test(notes);
  if (!covered) add("hours", "missing", "No opening hours on file — call ahead");
  else if (covered < 7) add("hours", "partial", `Hours cover ${covered} of 7 days`);
  else add("hours", hoursSoft ? "partial" : "pass", hoursSoft ? "All 7 days on file, but from a directory/aggregator (unverified)" : "All 7 days on file from the listed source");
  const mine = rules.filter((r) => r.venue === v.slug); const ver = mine.filter((r) => r.verified).length;
  if (v.type === "auction_house") add("deals", "na", "Not applicable to auction houses");
  else if (!mine.length) add("deals", "missing", "No deal days on file");
  else add("deals", ver ? "pass" : "partial", ver ? `${ver} of ${mine.length} deal-day rule${mine.length > 1 ? "s" : ""} verified` : `${mine.length} deal-day rule${mine.length > 1 ? "s" : ""}, none verified`);
  if (!v.lat || !v.lng) add("pin", "missing", "Not on the map yet");
  else add("pin", /approximate/i.test(notes) ? "partial" : "pass", /approximate/i.test(notes) ? "Pin is approximate (geocoded)" : "Pinned on the map");
  add("phone", v.phone && phoneOk(v.phone) ? "pass" : "missing", v.phone && phoneOk(v.phone) ? v.phone : "No phone number on file");
  const checkedOn = lastChecked(notes); const hasSource = !!v.sourceUrl || /Source:/i.test(notes);
  if (!hasSource || !checkedOn) add("source", "missing", !hasSource ? "No source on file" : "Source has no checked date");
  else { const age = daysBetween(checkedOn, today); add("source", age <= 30 ? "pass" : age <= 90 ? "partial" : "missing", `Last checked ${checkedOn}${age > 0 ? ` (${age} day${age === 1 ? "" : "s"} ago)` : " (today)"}`); }
  const graded = checks.filter((c) => c.mark !== "na"); const score = Math.round((graded.reduce((s, c) => s + POINTS[c.mark], 0) / (graded.length * 2)) * 100);
  return { slug: v.slug, name: v.name, city: v.city, type: v.type, grade: gradeFor(score), score, checks, checkedOn, tagReportsThisWeek: tagReports };
}
export const GRADE_ORDER: Grade[] = ["A", "B", "C", "D", "F"];
/** All cards, best first (score desc, then name). */
export const reportCards = (venues: Venue[], rules: DealRule[], today: string, tagCounts: Map<string, number> = new Map(), takesTags: (v: Venue) => boolean = () => true) =>
  venues.map((v) => reportCard(v, rules, today, takesTags(v) ? tagCounts.get(v.slug) ?? 0 : null)).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
export const gradeCounts = (cards: ReportCard[]) => Object.fromEntries(GRADE_ORDER.map((g) => [g, cards.filter((c) => c.grade === g).length])) as Record<Grade, number>;
export const MARK_ICON: Record<Mark, string> = { pass: "✔", partial: "◐", missing: "✘", na: "—" };
/** Approved, active-this-week color-tag report counts per store (crowdsourced; display only, never graded). */
export function tagCountsThisWeek(reports: TagReport[], today: string) { const m = new Map<string, number>(); for (const r of reports) if (isActive(r, today)) m.set(r.venue, (m.get(r.venue) ?? 0) + 1); return m; }
