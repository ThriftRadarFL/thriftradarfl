import { getSale } from "@/lib/data";
export const dynamic = "force-dynamic";
const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/[,;]/g, (m) => "\\" + m).replace(/\n/g, "\\n");
const dt = (date: string, time: string) => `${date.replace(/-/g, "")}T${time.replace(":", "")}00`;
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const s = await getSale(slug);
  if (!s) return new Response("Not found", { status: 404 });
  const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//ThriftRadarFL//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
    "BEGIN:VTIMEZONE", "TZID:America/New_York", "BEGIN:STANDARD", "DTSTART:19701101T020000", "RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU", "TZOFFSETFROM:-0400", "TZOFFSETTO:-0500", "END:STANDARD",
    "BEGIN:DAYLIGHT", "DTSTART:19700308T020000", "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU", "TZOFFSETFROM:-0500", "TZOFFSETTO:-0400", "END:DAYLIGHT", "END:VTIMEZONE"];
  for (const d of s.days) {
    lines.push("BEGIN:VEVENT", `UID:${s.slug}-${d.date}@thriftradarfl`, `DTSTAMP:${stamp}`,
      `DTSTART;TZID=America/New_York:${dt(d.date, d.start)}`, `DTEND;TZID=America/New_York:${dt(d.date, d.end)}`,
      `SUMMARY:${esc(s.title + (d.discountPct ? ` (${d.discountPct}% off)` : ""))}`,
      `LOCATION:${esc(`${s.city}, FL ${s.zip}`)}`, `DESCRIPTION:${esc(`Payment: ${s.paymentMethods.join(", ")}\nListing: ${s.sourceUrl}`)}`,
      `URL:${s.sourceUrl}`, "END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return new Response(lines.join("\r\n") + "\r\n", { headers: { "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="${s.slug}.ics"` } });
}
