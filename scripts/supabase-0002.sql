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

-- Seed/refresh venues (new stores added 2026-11-02 with sources in notes)
INSERT INTO venues (slug, name, type, address, city, zip, lat, lng, phone, hours_json, notes) VALUES
  ('goodwill-port-orange', 'Goodwill Port Orange', 'thrift'::venue_type, '1752 Dunlawton Ave', 'Port Orange', '32129', 29.1385, -81.0175, '(386) 898-0308', '{"daily":"9:00-21:00"}'::jsonb, 'Tag-color schedule TBD (verify with store).'),
  ('goodwill-daytona-isb', 'Goodwill Daytona Beach (Intl Speedway)', 'thrift'::venue_type, '141 W International Speedway Blvd', 'Daytona Beach', '32114', 29.2108, -81.0235, NULL, NULL, 'Not listed on goodwillcfl.org/locations as of 2026-11-02 — may be closed or mislabeled; verify before publishing.'),
  ('goodwill-pine-hills-outlet', 'Goodwill Pine Hills Outlet (Bins)', 'outlet_bins'::venue_type, '2633 N Hiawassee Rd', 'Orlando', '32818', 28.5785, -81.4565, '(407) 203-8981', '{"daily":"8:00-17:00"}'::jsonb, 'goodwillcfl.org lists Mon–Sun 8 A.M.–5 P.M. (checked 2026-11-02). Restock times unverified.'),
  ('goodwill-taft-outlet', 'Goodwill Taft Outlet (Bins)', 'outlet_bins'::venue_type, '1030 Crews Commerce Dr', 'Orlando', '32837', 28.414, -81.3935, '(407) 652-6787', '{"daily":"8:00-18:00"}'::jsonb, 'goodwillcfl.org lists Mon–Sun 8 A.M.–6 P.M. (checked 2026-11-02). Restock times unverified.'),
  ('berners-auction-deland', 'Berner''s Auction', 'auction_house'::venue_type, '1500 Jacobs Rd', 'DeLand', '32724', 29.0065, -81.287, NULL, '{"wed":"18:30-22:00"}'::jsonb, 'Weekly Wednesday auction.'),
  ('goodwill-deland', 'Goodwill DeLand', 'thrift'::venue_type, '1600 North Woodland Boulevard', 'DeLand', '32720', 29.05991, -81.30462, '(386) 265-0975', '{"daily":"9:00-21:00"}'::jsonb, 'Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).'),
  ('goodwill-holly-hill', 'Goodwill Holly Hill', 'thrift'::venue_type, '1577 North Nova Rd.', 'Holly Hill', '32117', 29.23831, -81.0573, '(386) 257-3247', '{"daily":"9:00-21:00"}'::jsonb, 'Map pin approximate (geocoder matched S Nova Rd). Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).'),
  ('goodwill-orange-city', 'Goodwill Orange City', 'thrift'::venue_type, '891 Harley Strickland Blvd.', 'Orange City', '32763', 28.91685, -81.28839, '(386) 774-5533', '{"daily":"9:00-21:00"}'::jsonb, 'Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).'),
  ('goodwill-sanford', 'Goodwill Sanford', 'thrift'::venue_type, '300 East 3rd Street', 'Sanford', '32771', 28.80997, -81.2659, '(407) 323-2272', '{"daily":"9:00-21:00"}'::jsonb, 'Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).'),
  ('goodwill-west-sanford', 'Goodwill West Sanford', 'thrift'::venue_type, '4516 FL-46', 'Sanford', '32771', 28.78691, -81.20577, '(407) 878-1741', '{"daily":"9:00-21:00"}'::jsonb, 'Map pin approximate (geocoded). Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).'),
  ('goodwill-fern-park', 'Goodwill Fern Park', 'thrift'::venue_type, '7800 S. U.S. Hwy 17-92', 'Fern Park', '32730', 28.65257, -81.34817, '(407) 478-1000', '{"daily":"9:00-21:00"}'::jsonb, 'Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).'),
  ('goodwill-casselberry', 'Goodwill Longwood/Casselberry', 'thrift'::venue_type, '1795 Sunshadow Drive', 'Casselberry', '32707', NULL, NULL, '(407) 695-3800', '{"daily":"9:00-21:00"}'::jsonb, 'Not on the map yet (address didn''t geocode). Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).'),
  ('goodwill-oviedo', 'Goodwill Oviedo', 'thrift'::venue_type, '1819 Alafaya Trail', 'Oviedo', '32765', NULL, NULL, '(407) 706-0800', '{"daily":"9:00-21:00"}'::jsonb, 'Not on the map yet (address didn''t geocode). Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).'),
  ('goodwill-curry-ford', 'Goodwill Curry Ford', 'thrift'::venue_type, '7390 Curry Ford Rd', 'Orlando', '32822', 28.51326, -81.28576, '(407) 447-0026', '{"daily":"9:00-21:00"}'::jsonb, 'Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).'),
  ('goodwill-goldenrod', 'Goodwill Goldenrod', 'thrift'::venue_type, '4780 South Goldenrod Road', 'Orlando', '32822', 28.47812, -81.28548, '(407) 720-3313', '{"daily":"9:00-21:00"}'::jsonb, 'Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).'),
  ('goodwill-south-obt', 'Goodwill S. OBT', 'thrift'::venue_type, '7531 South Orange Blossom Trail', 'Orlando', '32809', 28.4569, -81.39887, '(407) 859-4750', '{"daily":"9:00-21:00"}'::jsonb, 'Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).'),
  ('goodwill-waterford-lakes', 'Goodwill Waterford Lakes', 'thrift'::venue_type, '12170 Lake Underhill Road', 'Orlando', '32825', 28.54668, -81.20888, '(407) 277-4999', '{"daily":"9:00-21:00"}'::jsonb, 'Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).'),
  ('goodwill-winter-park-boutique', 'Goodwill Winter Park Boutique', 'thrift'::venue_type, '750 Orange Avenue', 'Winter Park', '32789', 28.59163, -81.35815, '(407) 628-5553', '{"daily":"9:00-21:00"}'::jsonb, 'Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).'),
  ('goodwill-apopka', 'Goodwill Apopka', 'thrift'::venue_type, '1312 East Semoran Boulevard', 'Apopka', '32703', NULL, NULL, '(407) 889-2965', '{"daily":"9:00-21:00"}'::jsonb, 'Not on the map yet (address didn''t geocode). Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).'),
  ('restore-west-volusia-deland', 'West Volusia Habitat ReStore', 'thrift'::venue_type, '604 S. Spring Garden Avenue', 'DeLand', '32720', 29.01882, -81.32401, '(386) 734-7268', NULL, 'Habitat for Humanity ReStore: furniture, appliances, building materials. The store''s site lists conflicting hours (Tue–Sat vs Mon–Sat 8:30–5) — call ahead. Address, phone and hours from https://wvhabitat.org/the-restore/ (checked 2026-11-02).'),
  ('restore-greater-volusia-port-orange', 'Habitat ReStore (Greater Volusia)', 'thrift'::venue_type, '3813 S. Nova Road #103 (Dunlawton Square)', 'Port Orange', '32127', 29.12732, -81.00489, '(386) 257-9950', '{"tue-sat":"9:00-16:30","sun-mon":"closed"}'::jsonb, 'Habitat for Humanity ReStore: furniture, appliances, building materials, home goods. Address, phone and hours from https://www.habitatgvc.org/restore (checked 2026-11-02).')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address, city = EXCLUDED.city, zip = EXCLUDED.zip, lat = EXCLUDED.lat, lng = EXCLUDED.lng, phone = EXCLUDED.phone, hours_json = EXCLUDED.hours_json, notes = EXCLUDED.notes;

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
