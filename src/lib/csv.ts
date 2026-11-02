// Minimal RFC 4180 CSV parser (quotes, escaped quotes, CRLF, newlines inside quotes).
export function parseCsv(text: string): string[][] {
  const rows: string[][] = []; let row: string[] = []; let f = ""; let q = false;
  const s = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '"') { if (s[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; continue; }
    if (c === '"') q = true; else if (c === ",") { row.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && s[i + 1] === "\n") i++; row.push(f); f = ""; if (row.some((x) => x.trim())) rows.push(row); row = []; }
    else f += c;
  }
  row.push(f); if (row.some((x) => x.trim())) rows.push(row); return rows;
}
export const SALE_CSV_COLUMNS = ["title", "type", "city", "zip", "lat", "lng", "sourceUrl", "paymentMethods", "tags", "description", "days", "published"] as const;
export const SALE_CSV_TEMPLATE = `${SALE_CSV_COLUMNS.join(",")}\n"Example Estate Sale",estate,DeLand,32720,29.03,-81.30,https://www.estatesales.net/...,"cash, card","furniture, tools","Whole-house sale","2026-12-05 08:00 14:00 0; 2026-12-06 08:00 12:00 50",true\n`;
/** CSV → objects keyed by header (case-insensitive); `days` uses "; " between days. */
export function csvToRecords(text: string): { records: Record<string, string>[]; errors: string[] } {
  const rows = parseCsv(text); if (!rows.length) return { records: [], errors: ["CSV is empty"] };
  const head = rows[0].map((h) => h.trim()); const known = new Map(SALE_CSV_COLUMNS.map((c) => [c.toLowerCase(), c]));
  const cols = head.map((h) => known.get(h.toLowerCase()) ?? null); const errors: string[] = [];
  for (const need of ["title", "city", "days"]) if (!cols.includes(need as never)) errors.push(`missing column "${need}"`);
  const unknown = head.filter((_, i) => !cols[i]); if (unknown.length) errors.push(`ignored unknown columns: ${unknown.join(", ")}`);
  const records = rows.slice(1).map((r) => { const o: Record<string, string> = {}; cols.forEach((c, i) => { if (c) o[c] = (r[i] ?? "").trim(); });
    if (o.days) o.days = o.days.split(/\s*;\s*/).join("\n"); return o; });
  return { records, errors };
}
