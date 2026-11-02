// Weekly digest builder. Pure function → {subject, html, text}; sending is done by /api/cron/digest via Resend when RESEND_API_KEY is set.
import type { Sale } from "./data";
import { dealRules as seedRules, DAYS, type DealRule } from "./deal-rules";
import { SITE_URL } from "./site";
import { t12 } from "./time";
const h = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
export function upcomingWindow(sales: Sale[], from: string, days = 10) {
  const end = new Date(from + "T12:00:00"); end.setDate(end.getDate() + days); const to = end.toLocaleDateString("en-CA");
  return sales.filter((s) => s.days.some((d) => d.date >= from && d.date <= to))
    .sort((a, b) => Math.max(...b.days.map((d) => d.discountPct)) - Math.max(...a.days.map((d) => d.discountPct)) || a.days[0].date.localeCompare(b.days[0].date)).slice(0, 10);
}
const WD = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
/** "2026-11-12" + "09:00" -> "Thu 11/12 9 AM" */
export const dayLabel = (date: string, start: string) => { const d = new Date(date + "T12:00:00Z"); return `${WD[d.getUTCDay()]} ${d.getUTCMonth() + 1}/${d.getUTCDate()} ${t12(start)}`; };
export const LOGO_PATH = "/logo-email.png";
export function buildDigest(sales: Sale[], from: string, unsubscribeUrl = `${SITE_URL}/digest`, dealRules: DealRule[] = seedRules, venueNames: Record<string, string> = {}, siteUrl = SITE_URL) {
  const top = upcomingWindow(sales, from);
  const subject = `ThriftRadarFL: ${top.length} hot sales this week${top[0] ? ` — ${top[0].city}` : ""}`;
  const deals = dealRules.filter((r) => r.discountPct && r.discountPct >= 50);
  const html = `<!doctype html><html><body style="margin:0;background:#f2f4f7;font-family:Arial,sans-serif;color:#1d2330">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px">
<tr><td style="background:#1b3a8a;padding:16px"><a href="${siteUrl}/" style="text-decoration:none"><img src="${siteUrl}${LOGO_PATH}" alt="ThriftRadarFL" width="215" height="40" style="display:block;border:0;outline:none;height:auto;max-width:215px"></a></td></tr>
<tr><td style="padding:16px"><h1 style="font-size:20px;margin:0 0 8px">This week's hot sales</h1>
${top.map((s) => `<p style="margin:0 0 12px"><a href="${siteUrl}/sales/${s.slug}" style="color:#1b3a8a;font-weight:bold">${h(s.title)}</a><br><span style="font-size:13px;color:#555">${h(s.city)} · ${s.days.map((d) => `${dayLabel(d.date, d.start)}${d.discountPct ? ` (${d.discountPct}% off)` : ""}`).join(", ")}</span></p>`).join("\n") || "<p>No sales listed this week.</p>"}
<h2 style="font-size:16px;margin:16px 0 8px">Half-off &amp; color-tag days</h2><ul style="padding-left:18px;font-size:13px">${deals.map((r) => `<li><b>${DAYS[r.day]}</b>: ${h(r.label)}${venueNames[r.venue] ? ` — ${h(venueNames[r.venue])}` : ""}${r.verified ? "" : " <i>(unverified)</i>"}</li>`).join("")}</ul>
<p style="font-size:11px;color:#888;margin-top:24px">Always confirm details with the original listing. <a href="${unsubscribeUrl}">Unsubscribe</a></p></td></tr></table></td></tr></table></body></html>`;
  const text = [subject, "", ...top.map((s) => `- ${s.title} (${s.city}, ${(({ date, start }) => dayLabel(date, start))(s.days.find((d) => d.date >= from) ?? s.days[0])}) ${siteUrl}/sales/${s.slug}`), "", `Unsubscribe: ${unsubscribeUrl}`].join("\n");
  return { subject, html, text, count: top.length };
}
