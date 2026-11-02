// Generates scripts/supabase-0002.sql: idempotent paste-into-SQL-Editor version of drizzle/0002 + deal-rule seed.
import { writeFileSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const entries = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8")).entries.filter((e: { idx: number }) => e.idx >= 2) as { idx: number; tag: string; when: number }[];
const marks = entries.map((j) => { const hash = createHash("sha256").update(readFileSync(`drizzle/${j.tag}.sql`, "utf8")).digest("hex");
  return `INSERT INTO drizzle.__drizzle_migrations (hash, created_at) SELECT '${hash}', ${j.when} WHERE NOT EXISTS (SELECT 1 FROM drizzle.__drizzle_migrations WHERE hash = '${hash}'); -- ${j.tag}`; }).join("\n");
import { dealRules, ruleId } from "../src/lib/deal-rules";
import { seedVenues } from "../src/lib/seed-data";
const q = (s: string | null | undefined) => (s == null ? "NULL" : `'${s.replace(/'/g, "''")}'`);
const rules = dealRules.map((r) => `  (${q(ruleId(r))}, ${q(r.venue)}, ${q(r.kind)}, ${r.day}, ${r.time ? q(r.time) : "NULL"}, ${q(r.color)}, ${r.discountPct ?? "NULL"}, ${q(r.label)}, ${r.verified})`).join(",\n");
const venues = seedVenues.map((v) => `  (${q(v.slug)}, ${q(v.name)}, ${q(v.type)}::venue_type, ${q(v.address)}, ${q(v.city)}, ${q(v.zip)}, ${v.lat || "NULL"}, ${v.lng || "NULL"}, ${q(v.phone)}, ${v.hoursJson ? q(JSON.stringify(v.hoursJson)) + "::jsonb" : "NULL"}, ${q(v.notes)})`).join(",\n");
writeFileSync("scripts/supabase-0002.sql", `-- ThriftRadarFL migrations 0002–0004 (publish flag, sale tags, audit log, editable deal rules, submissions, contact messages)
-- Safe to run more than once. Paste into Supabase → SQL Editor → Run.
BEGIN;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS published boolean DEFAULT true NOT NULL;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS tags text[]; -- 0003
ALTER TABLE deal_rules ADD COLUMN IF NOT EXISTS rule_key text;
ALTER TABLE deal_rules ADD COLUMN IF NOT EXISTS label text;
ALTER TABLE deal_rules ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false NOT NULL;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'deal_rules_rule_key_unique') THEN
    ALTER TABLE deal_rules ADD CONSTRAINT deal_rules_rule_key_unique UNIQUE (rule_key);
  END IF;
END $$;
CREATE TABLE IF NOT EXISTS submissions (
  id text PRIMARY KEY NOT NULL, email text NOT NULL, sale jsonb NOT NULL, created_at timestamptz DEFAULT now() NOT NULL);
CREATE TABLE IF NOT EXISTS contact_messages (
  id text PRIMARY KEY NOT NULL, name text NOT NULL, email text NOT NULL, message text NOT NULL, created_at timestamptz DEFAULT now() NOT NULL);
-- Private tables: no anon/authenticated access via the Supabase Data API (the app connects as the postgres role).
CREATE TABLE IF NOT EXISTS audit_log ( -- 0004
  id serial PRIMARY KEY NOT NULL, at timestamptz DEFAULT now() NOT NULL, action text NOT NULL, target text, detail text);
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Seed/refresh venues (new stores added 2026-11-02 with sources in notes)
INSERT INTO venues (slug, name, type, address, city, zip, lat, lng, phone, hours_json, notes) VALUES
${venues}
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address, city = EXCLUDED.city, zip = EXCLUDED.zip, lat = EXCLUDED.lat, lng = EXCLUDED.lng, phone = EXCLUDED.phone, hours_json = EXCLUDED.hours_json, notes = EXCLUDED.notes;

-- Seed deal rules (upsert by rule_key; skips venues that don't exist yet)
INSERT INTO deal_rules (rule_key, venue_id, kind, day_of_week, start_time, color, discount_pct, label, description, verified)
SELECT v.rule_key, ve.id, v.kind::deal_kind, v.day, v.t::time, v.color, v.pct, v.label, v.label, v.verified
FROM (VALUES
${rules}
) AS v(rule_key, venue, kind, day, t, color, pct, label, verified)
JOIN venues ve ON ve.slug = v.venue
ON CONFLICT (rule_key) DO UPDATE SET kind = EXCLUDED.kind, day_of_week = EXCLUDED.day_of_week, start_time = EXCLUDED.start_time, color = EXCLUDED.color,
  discount_pct = EXCLUDED.discount_pct, label = EXCLUDED.label, description = EXCLUDED.description, verified = EXCLUDED.verified;

-- Record in Drizzle's journal so a later \`npm run db:migrate\` doesn't re-apply these
CREATE SCHEMA IF NOT EXISTS drizzle;
CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (id serial PRIMARY KEY, hash text NOT NULL, created_at bigint);
${marks}
COMMIT;
`);
console.log("wrote scripts/supabase-0002.sql", dealRules.length, "rules");
