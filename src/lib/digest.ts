// Weekly digest builder. Pure function → {subject, html, text}; sending is done by /api/cron/digest via Resend when RESEND_API_KEY is set.
import type { Sale } from "./data";
import { dealRules as seedRules, DAYS, type DealRule } from "./deal-rules";
import { SITE_URL } from "./site";
const h = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
export function upcomingWindow(sales: Sale[], from: string, days = 10) {
  const end = new Date(from + "T12:00:00"); end.setDate(end.getDate() + days); const to = end.toLocaleDateString("en-CA");
  return sales.filter((s) => s.days.some((d) => d.date >= from && d.date <= to))
    .sort((a, b) => Math.max(...b.days.map((d) => d.discountPct)) - Math.max(...a.days.map((d) => d.discountPct)) || a.days[0].date.localeCompare(b.days[0].date)).slice(0, 10);
}
export function buildDigest(sales: Sale[], from: string, unsubscribeUrl = `${SITE_URL}/digest`, dealRules: DealRule[] = seedRules) {
  const top = upcomingWindow(sales, from);
  const subject = `ThriftRadarFL: ${top.length} hot sales this week${top[0] ? ` — ${top[0].city}` : ""}`;
  const deals = dealRules.filter((r) => r.discountPct && r.discountPct >= 50);
  const html = `<!doctype html><html><body style="margin:0;background:#f2f4f7;font-family:Arial,sans-serif;color:#1d2330">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px">
<tr><td style="background:#1b3a8a;padding:16px"><img src="${SITE_URL}/logo.svg" alt="ThriftRadarFL" width="176" style="display:block"></td></tr>
<tr><td style="padding:16px"><h1 style="font-size:20px;margin:0 0 8px">This week's hot sales</h1>
${top.map((s) => `<p style="margin:0 0 12px"><a href="${SITE_URL}/sales/${s.slug}" style="color:#1b3a8a;font-weight:bold">${h(s.title)}</a><br><span style="font-size:13px;color:#555">${h(s.city)} · ${s.days.map((d) => `${d.date.slice(5)} ${d.start}${d.discountPct ? ` (${d.discountPct}% off)` : ""}`).join(", ")}</span></p>`).join("\n") || "<p>No sales listed this week.</p>"}
<h2 style="font-size:16px;margin:16px 0 8px">Half-off &amp; color-tag days</h2><ul style="padding-left:18px;font-size:13px">${deals.map((r) => `<li>${DAYS[r.day]}: ${h(r.label)}${r.verified ? "" : " <i>(unverified)</i>"}</li>`).join("")}</ul>
<p style="font-size:11px;color:#888;margin-top:24px">Always confirm details with the original listing. <a href="${unsubscribeUrl}">Unsubscribe</a></p></td></tr></table></td></tr></table></body></html>`;
  const text = [subject, "", ...top.map((s) => `- ${s.title} (${s.city}) ${SITE_URL}/sales/${s.slug}`), "", `Unsubscribe: ${unsubscribeUrl}`].join("\n");
  return { subject, html, text, count: top.length };
}
