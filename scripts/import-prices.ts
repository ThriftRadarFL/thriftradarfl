// Re-import resale price research from the assets folder (JSON preferred, CSV fallback) into data/resale-prices.json.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
const SRC = process.env.PRICES_SRC_DIR || "/workspace/thriftradarfl-assets";
const OUT = path.join(process.cwd(), "data/resale-prices.json");
function parseCsv(t: string): Record<string, string>[] {
  const rows: string[][] = []; let row: string[] = [], f = "", q = false;
  for (let i = 0; i < t.length; i++) { const c = t[i];
    if (q) { if (c === '"' && t[i + 1] === '"') { f += '"'; i++; } else if (c === '"') q = false; else f += c; }
    else if (c === '"') q = true; else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; row.push(f); f = ""; if (row.some((x) => x)) rows.push(row); row = []; }
    else f += c; }
  row.push(f); if (row.some((x) => x)) rows.push(row);
  const [h, ...b] = rows; return b.map((r) => Object.fromEntries(h.map((k, i) => [k.trim(), (r[i] ?? "").trim()])));
}
const j = path.join(SRC, "resale-prices.json"), c = path.join(SRC, "resale-prices.csv");
const rows = existsSync(j) ? JSON.parse(readFileSync(j, "utf8")) : existsSync(c) ? parseCsv(readFileSync(c, "utf8")) : null;
if (!Array.isArray(rows)) { console.error(`No resale-prices.json/.csv in ${SRC}`); process.exit(1); }
// Merge eBay sold-search pulls (resale-prices-ebay.csv): fills rows that have no sold data yet; matched by search-query words.
const e = path.join(SRC, "resale-prices-ebay.csv");
const words = (q: string) => new Set(q.toLowerCase().match(/[a-z0-9]+/g) ?? []);
if (existsSync(e)) {
  let merged = 0;
  for (const x of parseCsv(readFileSync(e, "utf8"))) {
    const xw = words(x.query); if (!xw.size || !x.median_usd || !/^https?:\/\//.test(x.source_url)) continue;
    const r = rows.find((r: Record<string, string>) => { const rw = words(r.search_query ?? ""); return [...xw].every((w) => rw.has(w)); });
    if (!r || r.sold_median_usd) continue;
    Object.assign(r, { sold_median_usd: x.median_usd, sold_min_usd: x.min_usd, sold_max_usd: x.max_usd, sample_size: x.n_sold, date_range: `${x.earliest_sold} to ${x.latest_sold}`, source_url: x.source_url, retrieved_date: x.pulled || r.retrieved_date,
      notes: `${x.source}: median of the ${x.n_sold} most recent sold listings on one search-results page (query “${x.query}”), not a full market sample; mixed conditions and sizes.` });
    merged++;
  }
  console.log(`Merged ${merged} rows from resale-prices-ebay.csv`);
}
for (const r of rows) if (!r.item) { console.error("Row missing item:", r); process.exit(1); }
writeFileSync(OUT, JSON.stringify(rows, null, 2) + "\n");
console.log(`Imported ${rows.length} rows (${rows.filter((r: { sold_median_usd?: string }) => r.sold_median_usd).length} with sold data) -> ${OUT}`);
