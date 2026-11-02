-- ThriftRadarFL migrations 0002–0004 (publish flag, sale tags, audit log, editable deal rules, submissions, contact messages)
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

-- Seed deal rules (upsert by rule_key; skips venues that don't exist yet)
INSERT INTO deal_rules (rule_key, venue_id, kind, day_of_week, start_time, color, discount_pct, label, description, verified)
SELECT v.rule_key, ve.id, v.kind::deal_kind, v.day, v.t::time, v.color, v.pct, v.label, v.label, v.verified
FROM (VALUES
  ('goodwill-port-orange-0-color-of-week-tag-50-off', 'goodwill-port-orange', 'color_tag', 0, NULL, 'bg-teal', 50, 'Color-of-week tag 50% off', false),
  ('goodwill-port-orange-2-fresh-housewares-floor-am', 'goodwill-port-orange', 'restock', 2, '09:00', 'bg-royal', NULL, 'Fresh housewares floor (AM)', false),
  ('goodwill-port-orange-3-senior-military-10-off', 'goodwill-port-orange', 'senior_day', 3, NULL, 'bg-gray-500', 10, 'Senior/Military 10% off', false),
  ('goodwill-port-orange-6-rotating-tag-color-50-off', 'goodwill-port-orange', 'color_tag', 6, NULL, 'bg-teal', 50, 'Rotating tag color 50% off', false),
  ('goodwill-daytona-isb-1-color-tag-50-off', 'goodwill-daytona-isb', 'color_tag', 1, NULL, 'bg-teal', 50, 'Color-tag 50% off', false),
  ('goodwill-daytona-isb-3-senior-day-10-off-55', 'goodwill-daytona-isb', 'senior_day', 3, NULL, 'bg-gray-500', 10, 'Senior day 10% off (55+)', false),
  ('goodwill-daytona-isb-5-half-off-clothing', 'goodwill-daytona-isb', 'half_off', 5, NULL, 'bg-coral', 50, 'Half-off clothing', false),
  ('goodwill-pine-hills-outlet-1-heavy-bin-restock-am', 'goodwill-pine-hills-outlet', 'restock', 1, '08:00', 'bg-royal', NULL, 'Heavy bin restock (AM)', false),
  ('goodwill-pine-hills-outlet-4-bins-lb-discount-day', 'goodwill-pine-hills-outlet', 'dollar_day', 4, NULL, 'bg-coral', NULL, 'Bins $/lb discount day', false),
  ('goodwill-pine-hills-outlet-6-saturday-bin-rotations-hourly', 'goodwill-pine-hills-outlet', 'bins_rotation', 6, NULL, 'bg-royal', NULL, 'Saturday bin rotations hourly', false),
  ('goodwill-taft-outlet-2-heavy-bin-restock-am', 'goodwill-taft-outlet', 'restock', 2, '08:00', 'bg-royal', NULL, 'Heavy bin restock (AM)', false),
  ('goodwill-taft-outlet-4-select-bins-1-items', 'goodwill-taft-outlet', 'dollar_day', 4, NULL, 'bg-coral', NULL, 'Select bins $1 items', false),
  ('goodwill-taft-outlet-6-furniture-rotation', 'goodwill-taft-outlet', 'bins_rotation', 6, '10:00', 'bg-royal', NULL, 'Furniture rotation', false),
  ('berners-auction-deland-2-preview-day', 'berners-auction-deland', 'restock', 2, NULL, 'bg-gray-500', NULL, 'Preview day', false),
  ('berners-auction-deland-3-weekly-auction-6-30pm', 'berners-auction-deland', 'restock', 3, '18:30', 'bg-royal', NULL, 'Weekly auction 6:30pm', true)
) AS v(rule_key, venue, kind, day, t, color, pct, label, verified)
JOIN venues ve ON ve.slug = v.venue
ON CONFLICT (rule_key) DO UPDATE SET kind = EXCLUDED.kind, day_of_week = EXCLUDED.day_of_week, start_time = EXCLUDED.start_time, color = EXCLUDED.color,
  discount_pct = EXCLUDED.discount_pct, label = EXCLUDED.label, description = EXCLUDED.description, verified = EXCLUDED.verified;

-- Record in Drizzle's journal so a later `npm run db:migrate` doesn't re-apply these
CREATE SCHEMA IF NOT EXISTS drizzle;
CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (id serial PRIMARY KEY, hash text NOT NULL, created_at bigint);
INSERT INTO drizzle.__drizzle_migrations (hash, created_at) SELECT '0d94fd5a7ef88472f12ac8682b9ba62891a97240a409430523fe335a0089ac17', 1793648144403 WHERE NOT EXISTS (SELECT 1 FROM drizzle.__drizzle_migrations WHERE hash = '0d94fd5a7ef88472f12ac8682b9ba62891a97240a409430523fe335a0089ac17'); -- 0002_publish_rules_submissions_contact
INSERT INTO drizzle.__drizzle_migrations (hash, created_at) SELECT '76d3b8b402be3fae2c50a786d723deada6b99b812aeb796dd7ba671da1432453', 1793649227644 WHERE NOT EXISTS (SELECT 1 FROM drizzle.__drizzle_migrations WHERE hash = '76d3b8b402be3fae2c50a786d723deada6b99b812aeb796dd7ba671da1432453'); -- 0003_sale_tags
INSERT INTO drizzle.__drizzle_migrations (hash, created_at) SELECT '010aad04d4073afd808e34d68e9241ec33cfb3e06272397a1e557817d9223259', 1793649333851 WHERE NOT EXISTS (SELECT 1 FROM drizzle.__drizzle_migrations WHERE hash = '010aad04d4073afd808e34d68e9241ec33cfb3e06272397a1e557817d9223259'); -- 0004_audit_log
COMMIT;
