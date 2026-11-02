import type { Sale } from "./data";
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
export function buildIcs(sales: Sale[], calName = "ThriftRadarFL") {
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ThriftRadarFL//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH", `X-WR-CALNAME:${esc(calName)}`, "X-WR-TIMEZONE:America/New_York", ...TZ];
  for (const s of sales) for (const d of s.days) lines.push("BEGIN:VEVENT", `UID:${s.slug}-${d.date}@thriftradarfl`, `DTSTAMP:${stamp}`,
    `DTSTART;TZID=America/New_York:${dt(d.date, d.start)}`, `DTEND;TZID=America/New_York:${dt(d.date, d.end)}`,
    `SUMMARY:${esc(s.title + (d.discountPct ? ` (${d.discountPct}% off)` : ""))}`, `LOCATION:${esc(`${s.city}, FL ${s.zip}`.trim())}`,
    `DESCRIPTION:${esc(`Payment: ${s.paymentMethods.join(", ")}\nDetails: ${SITE_URL}/sales/${s.slug}${s.sourceUrl ? `\nOriginal listing: ${s.sourceUrl}` : ""}`)}`,
    `URL:${SITE_URL}/sales/${s.slug}`, ...(s.lat && s.lng ? [`GEO:${s.lat};${s.lng}`] : []), "END:VEVENT");
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
export const icsHeaders = (filename: string, download = true) => ({ "Content-Type": "text/calendar; charset=utf-8", "Cache-Control": "public, max-age=600", ...(download ? { "Content-Disposition": `attachment; filename="${filename}"` } : {}) });
