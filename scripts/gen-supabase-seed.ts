/* eslint-disable @typescript-eslint/no-explicit-any */
import { writeFileSync } from "fs";
import { seedOrgs, seedVenues, seedTags, mockSales } from "../src/lib/seed-data";
import { dealRules } from "../src/lib/deal-rules";

const esc = (s: unknown) => (s == null ? "NULL" : `'${String(s).replace(/'/g, "''")}'`);
const arr = (a?: string[]) => (!a?.length ? "NULL" : `ARRAY[${a.map(esc).join(",")}]::text[]`);

const sql: string[] = ["BEGIN;"];

for (const o of seedOrgs as any[]) {
  sql.push(`INSERT INTO organizations (name, type, website, phone, source_url, is_featured)
    SELECT ${esc(o.name)}, ${esc(o.type)}, ${esc(o.website ?? null)}, ${esc(o.phone ?? null)}, ${esc(o.sourceUrl ?? null)}, false
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = ${esc(o.name)});`);
}

for (const v of seedVenues as any[]) {
  const orgName = (seedOrgs as any[]).find((o) => o.key === v.org)?.name || "";
  sql.push(`INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT ${esc(v.slug)}, (SELECT id FROM organizations WHERE name = ${esc(orgName)} LIMIT 1),
      ${esc(v.name)}, ${esc(v.type)}, ${esc(v.address)}, ${esc(v.city)}, ${esc(v.zip)}, ${v.lat ?? "NULL"}, ${v.lng ?? "NULL"}, ${esc(v.phone ?? null)},
      ${v.hoursJson ? esc(JSON.stringify(v.hoursJson)) + "::jsonb" : "NULL"}, ${esc(v.notes ?? null)}, true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = ${esc(v.slug)});`);
}

for (const name of seedTags as any[]) {
  const n = typeof name === "string" ? name : name.name;
  sql.push(`INSERT INTO tags (name) SELECT ${esc(n)} WHERE NOT EXISTS (SELECT 1 FROM tags WHERE name = ${esc(n)});`);
}

for (const d of dealRules as any[]) {
  sql.push(`INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, ${esc(d.kind)}, ${d.day ?? "NULL"}, ${esc(d.time ?? null)}, ${d.discountPct ?? "NULL"}, ${esc(d.label)},
      ${d.verified ? "now()" : "NULL"}, ${esc(d.verified ? "estatesales.net" : "UNVERIFIED demo")}
    FROM venues v WHERE v.slug = ${esc(d.venue)}
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = ${esc(d.kind)} AND dr.day_of_week IS NOT DISTINCT FROM ${d.day ?? "NULL"} AND dr.description = ${esc(d.label)}
    );`);
}

for (const m of mockSales as any[]) {
  sql.push(`INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT ${esc(m.slug)}, ${esc(m.title)}, ${esc(m.type)}, ${esc(m.address ?? null)}, ${esc(m.city)}, ${esc(m.zip ?? null)},
      ${m.lat ?? "NULL"}, ${m.lng ?? "NULL"}, ${arr(m.paymentMethods)}, 'estatesales_net', ${esc(m.sourceUrl ?? null)}, 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = ${esc(m.slug)});`);
  for (const d of m.days || []) {
    sql.push(`INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, ${esc(d.date)}, ${esc(d.start)}, ${esc(d.end)}, ${d.discountPct ?? 0}
      FROM sales s WHERE s.slug = ${esc(m.slug)}
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = ${esc(d.date)});`);
  }
}

sql.push("COMMIT;");
writeFileSync("./scripts/supabase-seed.sql", sql.join("\n"));
console.log("wrote", sql.length, "lines");
