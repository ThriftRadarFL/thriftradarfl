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
for (const r of rows) if (!r.item) { console.error("Row missing item:", r); process.exit(1); }
writeFileSync(OUT, JSON.stringify(rows, null, 2) + "\n");
console.log(`Imported ${rows.length} rows (${rows.filter((r: { sold_median_usd?: string }) => r.sold_median_usd).length} with sold data) -> ${OUT}`);
