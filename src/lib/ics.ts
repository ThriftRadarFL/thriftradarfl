import type { Sale, Venue } from "./data";
import { ruleId, DAYS, type DealRule } from "./deal-rules";
import { SITE_URL } from "./site";
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/[,;]/g, (m) => "\\" + m).replace(/\r?\n/g, "\\n");
const dt = (date: string, time: string) => `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
// RFC 5545 §3.1: fold lines longer than 75 octets
function fold(line: string) {
  const out: string[] = []; let cur = ""; let bytes = 0;
  for (const ch of line) { const b = Buffer.byteLength(ch); if (bytes + b > (out.length ? 74 : 75)) { out.push(cur); cur = ""; bytes = 0; } cur += ch; bytes += b; }
  out.push(cur); return out.join("\r\n ");
}
const TZ = ["BEGIN:VTIMEZONE", "TZID:America/New_York", "BEGIN:STANDARD", "DTSTART:19701101T020000", "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU", "TZOFFSETFROM:-0400", "TZOFFSETTO:-0500", "TZNAME:EST", "END:STANDARD",
  "BEGIN:DAYLIGHT", "DTSTART:19700308T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU", "TZOFFSETFROM:-0500", "TZOFFSETTO:-0400", "TZNAME:EDT", "END:DAYLIGHT", "END:VTIMEZONE"];
export function buildIcs(sales: Sale[], calName = "ThriftRadarFL", extra: string[] = []) {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ThriftRadarFL//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", `X-WR-CALNAME:${esc(calName)}`, "X-WR-TIMEZONE:America/New_York", ...TZ];
  for (const s of sales) for (const d of s.days) lines.push("BEGIN:VEVENT", `UID:${s.slug}-${d.date}@thriftradarfl`, `DTSTAMP:${stamp}`,
    `DTSTART;TZID=America/New_York:${dt(d.date, d.start)}`, `DTEND;TZID=America/New_York:${dt(d.date, d.end)}`,
    `SUMMARY:${esc(s.title + (d.discountPct ? ` (${d.discountPct}% off)` : ""))}`, `LOCATION:${esc(`${s.city}, FL ${s.zip}`.trim())}`,
    `DESCRIPTION:${esc(`Payment: ${s.paymentMethods.join(", ")}\nDetails: ${SITE_URL}/sales/${s.slug}${s.sourceUrl ? `\nOriginal listing: ${s.sourceUrl}` : ""}`)}`,
    `URL:${SITE_URL}/sales/${s.slug}`, ...(s.lat && s.lng ? [`GEO:${s.lat};${s.lng}`] : []), "END:VEVENT");
  lines.push(...extra, "END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
export const icsHeaders = (filename: string, download = true) => ({ "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "public, max-age=600", ...(download ? { "Content-Disposition": `attachment; filename="${filename}"` } : {}) });
const BYDAY = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];
const ymd = (d: Date) => d.toISOString().slice(0, 10);
/** Next date (YYYY-MM-DD, on/after `from`) that falls on weekday `day` (0 = Sun). */
export function nextOnOrAfter(from: string, day: number) { const d = new Date(from + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + ((day - d.getUTCDay() + 7) % 7)); return ymd(d); }
/** Weekly recurring VEVENTs for store deal days (RRULE:FREQ=WEEKLY). Timed rules (e.g. 6:30 PM auction) get a 2-hour slot; the rest are all-day.
 *  UID is the stable rule id, so subscribed calendars update in place when a rule changes. Unverified rules say so in the title + description. */
export function dealEvents(rules: DealRule[], venues: Pick<Venue, "slug" | "name" | "address" | "city" | "zip" | "lat" | "lng">[], from: string): string[] {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, ""); const vm = new Map(venues.map((v) => [v.slug, v])); const out: string[] = [];
  for (const r of rules) {
    const v = vm.get(r.venue); if (!v) continue; const date = nextOnOrAfter(from, r.day); const ds = date.replace(/-/g, "");
    let when: string[];
    if (r.time && /^\d{1,2}:\d{2}$/.test(r.time)) { const [h, m] = r.time.split(":").map(Number); const end = `${String(Math.min(h + 2, 23)).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      when = [`DTSTART;TZID=America/New_York:${dt(date, r.time.padStart(5, "0"))}`, `DTEND;TZID=America/New_York:${dt(date, end)}`]; }
    else { const n = new Date(date + "T12:00:00Z"); n.setUTCDate(n.getUTCDate() + 1); when = [`DTSTART;VALUE=DATE:${ds}`, `DTEND;VALUE=DATE:${ymd(n).replace(/-/g, "")}`, "TRANSP:TRANSPARENT"]; }
    out.push("BEGIN:VEVENT", `UID:deal-${r.id ?? ruleId(r)}@thriftradarfl`, `DTSTAMP:${stamp}`, ...when, `RRULE:FREQ=WEEKLY;BYDAY=${BYDAY[r.day]}`,
      `SUMMARY:${esc(`${r.label} · ${v.name}${r.verified ? "" : " (unverified)"}`)}`, `LOCATION:${esc([v.address, `${v.city}, FL ${v.zip ?? ""}`.trim()].filter(Boolean).join(", "))}`,
      `DESCRIPTION:${esc(`Every ${DAYS[r.day]} at ${v.name}.${r.verified ? "" : "\nUnverified schedule — check signage or call ahead."}\nStore info: ${SITE_URL}/stores/${v.slug}`)}`,
      `URL:${SITE_URL}/stores/${v.slug}`, ...(v.lat && v.lng ? [`GEO:${v.lat};${v.lng}`] : []), "CATEGORIES:Deal day", "END:VEVENT");
  }
  return out;
}
export const buildDealIcs = (rules: DealRule[], venues: Parameters<typeof dealEvents>[1], from: string, calName = "ThriftRadarFL · Deal days") => buildIcs([], calName, dealEvents(rules, venues, from));
/** webcal:// link (opens "Subscribe" in Apple/Outlook calendars) for a feed path on this site. */
export const webcalUrl = (path: string, site = SITE_URL) => site.replace(/^https?:\/\//i, "webcal://") + path;
/** Google Calendar "add by URL" link for a feed path. */
export const googleCalUrl = (path: string, site = SITE_URL) => `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl(path, site))}`;
