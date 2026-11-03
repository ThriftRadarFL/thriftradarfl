// Estate-sale keyword alerts: match subscriber keywords against real listing text (title, description, tags).
// Pure functions; /api/cron/alerts sends via Resend, /api/cron/digest adds a "Your keyword matches" block.
import type { Sale } from "./data";
import { recentlyAdded } from "./new-sales";
import { dayLabel } from "./digest";
import { SITE_URL } from "./site";
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
const reEsc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const norm = (s: string) => s.toLowerCase().replace(/[\u2010-\u2015]/g, "-");
/** Keywords (from `keywords`) that appear as whole words in the sale text; a trailing "s" plural also matches ("lamp" ↔ "lamps"). */
export function matchedKeywords(s: Sale, keywords: string[]): string[] {
  const text = norm([s.title, s.description ?? "", ...(s.tags ?? [])].join(" \n "));
  return keywords.filter((k) => { const base = reEsc(norm(k).replace(/s$/, "")); return base.length >= 2 && new RegExp(`(^|[^a-z0-9])${base}s?(?=$|[^a-z0-9])`).test(text); });
}
const lastDay = (s: Sale) => s.days.at(-1)?.date ?? "";
/** Sales still running on/after `from` that mention any keyword, soonest first. */
export function keywordMatches(sales: Sale[], keywords: string[], from: string): { sale: Sale; hits: string[] }[] {
  if (!keywords.length) return [];
  return sales.filter((s) => s.published !== false && lastDay(s) >= from).map((sale) => ({ sale, hits: matchedKeywords(sale, keywords) })).filter((m) => m.hits.length)
    .sort((a, b) => (a.sale.days[0]?.date ?? "").localeCompare(b.sale.days[0]?.date ?? "") || a.sale.slug.localeCompare(b.sale.slug));
}
/** Newly listed (within `hours`) upcoming sales matching keywords: what the daily alert emails about. */
export function newKeywordMatches(sales: Sale[], keywords: string[], now = new Date(), hours = 24) {
  const fresh = recentlyAdded(sales, now, hours / 24); const today = now.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  return keywordMatches(fresh, keywords, today);
}
const when = (s: Sale, from = "") => { const d = s.days.find((x) => x.date >= from) ?? s.days[0]; return d ? dayLabel(d.date, d.start) : ""; };
/** HTML <tr> block for the weekly digest (empty string when nothing matches). */
export function digestKeywordBlock(m: { sale: Sale; hits: string[] }[], from: string, siteUrl = SITE_URL): { html: string; text: string } {
  if (!m.length) return { html: "", text: "" };
  const top = m.slice(0, 8);
  return {
    html: `<h2 style="font-size:16px;margin:16px 0 8px">Your keyword matches</h2>${top.map(({ sale: s, hits }) => `<p style="margin:0 0 10px"><a href="${siteUrl}/sales/${s.slug}" style="color:#1b3a8a;font-weight:bold">${esc(s.title)}</a><br><span style="font-size:13px;color:#555">${esc(s.city)} · ${when(s, from)} · matched <b>${hits.map(esc).join(", ")}</b></span></p>`).join("")}`,
    text: ["", "Your keyword matches:", ...top.map(({ sale: s, hits }) => `- ${s.title} (${s.city}, ${when(s, from)}) [${hits.join(", ")}] ${siteUrl}/sales/${s.slug}`)].join("\n"),
  };
}
/** Standalone alert email for newly listed matching sales. */
export function buildKeywordAlert(m: { sale: Sale; hits: string[] }[], unsubscribeUrl: string, siteUrl = SITE_URL, from = "") {
  const words = [...new Set(m.flatMap((x) => x.hits))];
  const subject = `ThriftRadarFL alert: ${m.length} new sale${m.length === 1 ? "" : "s"} mention ${words.slice(0, 3).map((w) => `“${w}”`).join(", ")}`;
  const html = `<!doctype html><html><body style="margin:0;background:#f2f4f7;font-family:Arial,sans-serif;color:#1d2330"><table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="background:#fff;max-width:600px">
<tr><td style="background:#1b3a8a;padding:16px;color:#fff;font-weight:bold;font-size:18px">ThriftRadarFL keyword alert</td></tr><tr><td style="padding:16px">
${m.map(({ sale: s, hits }) => `<p style="margin:0 0 12px"><a href="${siteUrl}/sales/${s.slug}" style="color:#1b3a8a;font-weight:bold">${esc(s.title)}</a><br><span style="font-size:13px;color:#555">${esc(s.city)} · ${when(s, from)} · matched <b>${hits.map(esc).join(", ")}</b></span></p>`).join("\n")}
<p style="font-size:11px;color:#888;margin-top:24px">Matches are based on the listing's own text — confirm details with the original listing. Change keywords at <a href="${siteUrl}/digest">${siteUrl.replace(/^https?:\/\//, "")}/digest</a> · <a href="${unsubscribeUrl}">Unsubscribe</a></p></td></tr></table></td></tr></table></body></html>`;
  const text = [subject, "", ...m.map(({ sale: s, hits }) => `- ${s.title} (${s.city}, ${when(s, from)}) [${hits.join(", ")}] ${siteUrl}/sales/${s.slug}`), "", `Unsubscribe: ${unsubscribeUrl}`].join("\n");
  return { subject, html, text };
}
