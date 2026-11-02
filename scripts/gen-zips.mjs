// Regenerates src/lib/zips.ts from the Census Gazetteer ZCTA file:
//   curl -LO https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2023_Gazetteer/2023_Gaz_zcta_national.zip && unzip 2023_Gaz_zcta_national.zip
//   node scripts/gen-zips.mjs 2023_Gaz_zcta_national.txt
import fs from "node:fs";
const src = process.argv[2]; if (!src) { console.error("usage: node scripts/gen-zips.mjs <2023_Gaz_zcta_national.txt>"); process.exit(1); }
const rows = fs.readFileSync(src, "utf8").split("\n").slice(1).map((l) => l.trim().split(/\t/)).filter((r) => /^3[234]/.test(r[0]))
  .map((r) => [r[0], +r[5], +r[6]]).filter(([, a, b]) => a > 27.8 && a < 29.8 && b > -82.1 && b < -80.5);
const items = rows.map(([z, a, b]) => `"${z}":[${a.toFixed(4)},${b.toFixed(4)}]`); const lines = []; let cur = "";
for (const it of items) { if ((cur + it).length > 150) { lines.push(cur); cur = ""; } cur += it + ","; } lines.push(cur);
const file = "src/lib/zips.ts"; const old = fs.readFileSync(file, "utf8");
const body = old.replace(/export const ZIPS[^]*?\n};\n/, `export const ZIPS: Record<string, readonly [number, number]> = {\n${lines.join("\n")}\n};\n`).replace(/\d+ ZIPs\./, `${rows.length} ZIPs.`);
fs.writeFileSync(file, body); console.log(`wrote ${rows.length} ZIPs to ${file}`);
