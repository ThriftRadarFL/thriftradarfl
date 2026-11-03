// Embeddable store widget: a self-contained HTML card (inline CSS, no JS, no external assets) served at
// /embed/stores/<slug> so stores, blogs and Facebook-group sites can iframe a store's deal days.
import { DAYS, type DealRule } from "./deal-rules";
import { storeToday, whenLabel } from "./store-today";
import { bestDay } from "./best-day";
import { t12 } from "./time";

export const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
export type EmbedVenue = { slug: string; name: string; city: string; address?: string; hoursJson?: Record<string, string> | null };
export type EmbedOpts = { compact?: boolean };
/** Parse ?compact=1 / ?size=compact. */
export const embedOpts = (sp: URLSearchParams): EmbedOpts => ({ compact: sp.get("compact") === "1" || sp.get("size") === "compact" });
/** Iframe snippet for the "Embed this store" box. Compact = one-line badge height. */
export const embedSnippet = (site: string, slug: string, compact = false) =>
  `<iframe src="${site}/embed/stores/${slug}${compact ? "?compact=1" : ""}" title="Deal days — ThriftRadarFL" width="${compact ? 320 : 360}" height="${compact ? 96 : 330}" style="border:0;max-width:100%" loading="lazy"></iframe>`;

const CSS = `*{box-sizing:border-box}body{margin:0;font:13px/1.35 Verdana,Geneva,sans-serif;color:#1d2330;background:transparent}
.w{border:1px solid #c9d1dc;border-radius:3px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.15);overflow:hidden}
.h{background:linear-gradient(#0b3d91,#072a66);color:#fff;padding:7px 10px;border-bottom:3px solid #d4001a}
.h b{font:bold 14px Arial,sans-serif;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.h small{color:#cfe0ff;font-size:11px}
.b{padding:8px 10px;background:linear-gradient(#fff,#eef1f5)}.p{display:inline-block;padding:1px 6px;border-radius:2px;color:#fff;font:bold 11px Arial,sans-serif;margin-right:4px}
.r{background:#d4001a}.k{background:#0b3d91}.g{background:#4b5563}ul{list-style:none;margin:6px 0 0;padding:0}li{padding:3px 0;border-top:1px solid #e3e8ef}
li span.d{display:inline-block;width:34px;font-weight:bold;color:#0b3d91}.t{background:#fff8d6}.u{color:#5b6472;font-size:11px}
.f{display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border-top:1px solid #c9d1dc;background:#f7f8fa;font-size:11px}
a{color:#0b3d91;font-weight:bold;text-decoration:none}a:hover{text-decoration:underline}
.c{display:inline-block;background:linear-gradient(#e8112d,#d4001a 55%,#a30014);color:#fff!important;border:1px solid #a30014;border-radius:3px;padding:3px 8px}`;

/** Full HTML document for the widget. `today` is the Eastern-time YYYY-MM-DD date. Pure (tested). */
export function storeWidgetHtml(v: EmbedVenue, rules: DealRule[], today: string, site: string, opts: EmbedOpts = {}): string {
  const t = storeToday(v.slug, rules, today, v.hoursJson); const best = bestDay(v.slug, rules, v.hoursJson);
  const mine = rules.filter((r) => r.venue === v.slug).sort((a, b) => a.day - b.day || (b.discountPct ?? 0) - (a.discountPct ?? 0));
  const url = `${site}/stores/${encodeURIComponent(v.slug)}?ref=embed`;
  const todayLine = t.today.length
    ? `<span class="p r">${t.today[0].discountPct ? `${t.today[0].discountPct}% OFF` : "TODAY"}</span><b>${esc(t.today[0].label)}</b>${t.today[0].verified ? "" : ' <span class="u">(unverified)</span>'}`
    : t.next ? `<span class="p g">No deal today</span>Next: <b>${esc(whenLabel(t.next.inDays, t.next.rule.day))}</b> — ${esc(t.next.rule.label)}` : `<span class="p g">No weekly deals listed</span>`;
  const hours = t.hours ? (t.hours === "Closed" ? "Closed today" : `Open today ${esc(t.hours)}`) : "";
  const list = opts.compact ? "" : `<ul>${mine.length ? mine.map((r) => `<li${r.day === t.dow ? ' class="t"' : ""}><span class="d">${DAYS[r.day]}</span>${esc(r.label)}${r.time ? ` · ${esc(t12(r.time))}` : ""}${r.verified ? "" : ' <span class="u">(unverified)</span>'}</li>`).join("") : '<li class="u">This store has no weekly deal days on file yet.</li>'}</ul>`
    + (best ? `<p style="margin:6px 0 0"><span class="p k">BEST DAY</span><b>${esc(best.best.name)}</b> <span class="u">${esc(best.reason)}</span></p>` : "");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>${esc(v.name)} deal days — ThriftRadarFL</title><base target="_blank"><style>${CSS}</style></head><body><div class="w">
<div class="h"><b>${esc(v.name)}</b><small>${esc(v.city)}, FL${hours ? ` · ${hours}` : ""}</small></div>
<div class="b"><div>${todayLine}</div>${list}</div>
<div class="f"><a href="${esc(url)}" rel="noopener">ThriftRadar<span style="color:#d4001a">FL</span></a><a class="c" href="${esc(url)}" rel="noopener">Full schedule ›</a></div></div></body></html>`;
}
export const notFoundWidgetHtml = (site: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Store not found — ThriftRadarFL</title><base target="_blank"><style>${CSS}</style></head><body><div class="w"><div class="h"><b>Store not found</b></div><div class="b">This widget's store link is out of date. <a href="${esc(site)}/stores">Browse stores ›</a></div></div></body></html>`;
