// "New this week" + Atom feed: sales by when they were first listed (Sale.addedAt), still upcoming, newest first.
import type { Sale } from "./data";
import { todayET } from "./cities";
import { typeLabel } from "@/components/ui";
const lastDay = (s: Sale) => s.days.at(-1)?.date ?? "";
const addedMs = (s: Sale) => (s.addedAt ? Date.parse(s.addedAt) : NaN);
/** Upcoming (or in-progress) sales first listed within `days` days of `now`, newest first. Sales without addedAt are skipped. */
export function recentlyAdded(sales: Sale[], now = new Date(), days = 7): Sale[] {
  const since = now.getTime() - days * 86_400_000; const today = todayET(now);
  return sales.filter((s) => { const t = addedMs(s); return Number.isFinite(t) && t >= since && t <= now.getTime() + 60_000 && lastDay(s) >= today; })
    .sort((a, b) => addedMs(b) - addedMs(a) || a.slug.localeCompare(b.slug));
}
/** Newest-listed upcoming sales regardless of window (for the feed), capped. */
export function newestListed(sales: Sale[], now = new Date(), limit = 30): Sale[] { return recentlyAdded(sales, now, 3650).slice(0, limit); }
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const clean = (s: string) => s.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "");
const fmtDay = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" });
/** Atom 1.0 (RFC 4287) feed of newly listed sales. */
/** `city` (display name, e.g. "Port Orange") → per-city feed at /feed.xml?city=port-orange. */
export const citySlug = (c: string) => c.toLowerCase().trim().replace(/\s+/g, "-");
export function atomFeed(sales: Sale[], site: string, now = new Date(), city?: string): string {
  const items = newestListed(city ? sales.filter((s) => citySlug(s.city) === citySlug(city)) : sales, now); const base = site.replace(/\/$/, "");
  const selfUrl = `${base}/feed.xml${city ? `?city=${citySlug(city)}` : ""}`;
  const updated = items[0]?.addedAt ? new Date(items[0].addedAt).toISOString() : now.toISOString();
  const host = (() => { try { return new URL(base).hostname; } catch { return "thriftradarfl"; } })();
  const entries = items.map((s) => {
    const url = `${base}/sales/${s.slug}`; const when = s.days.map((d) => fmtDay(d.date)).join(", ");
    const summary = `${typeLabel[s.type] ?? "Sale"} in ${s.city}, FL ${s.zip} · ${when}${s.days.some((d) => d.discountPct) ? ` · up to ${Math.max(...s.days.map((d) => d.discountPct ?? 0))}% off` : ""}`;
    return `  <entry>\n    <title>${esc(clean(s.title))} · ${esc(s.city)}</title>\n    <link rel="alternate" type="text/html" href="${esc(url)}"/>\n    <id>tag:${host},2026:sale/${esc(s.slug)}</id>\n    <published>${new Date(s.addedAt!).toISOString()}</published>\n    <updated>${new Date(s.addedAt!).toISOString()}</updated>\n    <category term="${esc(s.type)}" label="${esc(typeLabel[s.type] ?? s.type)}"/>\n    <summary>${esc(clean(summary))}</summary>\n  </entry>`;
  });
  return `<?xml version="1.0" encoding="utf-8"?>\n<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>\n<feed xmlns="http://www.w3.org/2005/Atom">\n  <title>ThriftRadarFL · New estate sales in ${city ? `${esc(city)}, FL` : "Central Florida"}</title>\n  <subtitle>Newly listed estate sales, auctions and thrift events</subtitle>\n  <link rel="self" type="application/atom+xml" href="${esc(selfUrl)}"/>\n  <link rel="alternate" type="text/html" href="${esc(base)}${city ? `/city/${citySlug(city)}` : "/new"}"/>\n  <id>${esc(selfUrl)}</id>\n  <updated>${updated}</updated>\n  <author><name>ThriftRadarFL</name></author>\n  <icon>${esc(base)}/icons/mark-64.png</icon>\n${entries.join("\n")}${entries.length ? "\n" : ""}</feed>\n`;
}
