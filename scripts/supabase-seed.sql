BEGIN;
INSERT INTO organizations (name, type, website, phone, source_url, is_featured)
    SELECT 'Goodwill Industries of Central Florida', 'thrift_chain', 'https://www.goodwillcfl.org/locations/', NULL, NULL, false
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Goodwill Industries of Central Florida');
INSERT INTO organizations (name, type, website, phone, source_url, is_featured)
    SELECT 'Berner''s Auction, Inc', 'auction_house', 'https://www.estatesales.net/FL/Daytona-Beach', NULL, NULL, false
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Berner''s Auction, Inc');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'goodwill-port-orange', (SELECT id FROM organizations WHERE name = 'Goodwill Industries of Central Florida' LIMIT 1),
      'Goodwill Port Orange', 'thrift', '1752 Dunlawton Ave', 'Port Orange', '32129', 29.1385, -81.0175, '(386) 898-0308',
      '{"daily":"9:00-21:00"}'::jsonb, 'Tag-color schedule TBD (verify with store).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'goodwill-port-orange');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'goodwill-daytona-isb', (SELECT id FROM organizations WHERE name = 'Goodwill Industries of Central Florida' LIMIT 1),
      'Goodwill Daytona Beach (Intl Speedway)', 'thrift', '141 W International Speedway Blvd', 'Daytona Beach', '32114', 29.2108, -81.0235, NULL,
      NULL, 'Hours unverified.', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'goodwill-daytona-isb');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'goodwill-pine-hills-outlet', (SELECT id FROM organizations WHERE name = 'Goodwill Industries of Central Florida' LIMIT 1),
      'Goodwill Pine Hills Outlet (Bins)', 'outlet_bins', '2633 N Hiawassee Rd', 'Orlando', '32818', 28.5785, -81.4565, '(407) 203-8981',
      '{"daily":"8:00-17:00"}'::jsonb, 'Sources disagree on open time (8 vs 9 AM). Restock times unverified.', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'goodwill-pine-hills-outlet');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'goodwill-taft-outlet', (SELECT id FROM organizations WHERE name = 'Goodwill Industries of Central Florida' LIMIT 1),
      'Goodwill Taft Outlet (Bins)', 'outlet_bins', '1030 Crews Commerce Dr', 'Orlando', '32837', 28.414, -81.3935, '(407) 652-6787',
      '{"daily":"8:00-18:00"}'::jsonb, 'Restock times unverified.', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'goodwill-taft-outlet');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'berners-auction-deland', (SELECT id FROM organizations WHERE name = 'Berner''s Auction, Inc' LIMIT 1),
      'Berner''s Auction', 'auction_house', '1500 Jacobs Rd', 'DeLand', '32724', 29.0065, -81.287, NULL,
      '{"wed":"18:30-22:00"}'::jsonb, 'Weekly Wednesday auction.', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'berners-auction-deland');
INSERT INTO tags (name) SELECT 'furniture' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE name = 'furniture');
INSERT INTO tags (name) SELECT 'mid-century' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE name = 'mid-century');
INSERT INTO tags (name) SELECT 'tools' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE name = 'tools');
INSERT INTO tags (name) SELECT 'jewelry' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE name = 'jewelry');
INSERT INTO tags (name) SELECT 'vinyl' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE name = 'vinyl');
INSERT INTO tags (name) SELECT 'art' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE name = 'art');
INSERT INTO tags (name) SELECT 'collectibles' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE name = 'collectibles');
INSERT INTO tags (name) SELECT 'clothing' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE name = 'clothing');
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'color_tag', 0, NULL, 50, 'Color-of-week tag 50% off',
      NULL, 'UNVERIFIED demo'
    FROM venues v WHERE v.slug = 'goodwill-port-orange'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'color_tag' AND dr.day_of_week IS NOT DISTINCT FROM 0 AND dr.description = 'Color-of-week tag 50% off'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'restock', 2, '09:00', NULL, 'Fresh housewares floor (AM)',
      NULL, 'UNVERIFIED demo'
    FROM venues v WHERE v.slug = 'goodwill-port-orange'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'restock' AND dr.day_of_week IS NOT DISTINCT FROM 2 AND dr.description = 'Fresh housewares floor (AM)'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'senior_day', 3, NULL, 10, 'Senior/Military 10% off',
      NULL, 'UNVERIFIED demo'
    FROM venues v WHERE v.slug = 'goodwill-port-orange'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'senior_day' AND dr.day_of_week IS NOT DISTINCT FROM 3 AND dr.description = 'Senior/Military 10% off'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'color_tag', 6, NULL, 50, 'Rotating tag color 50% off',
      NULL, 'UNVERIFIED demo'
    FROM venues v WHERE v.slug = 'goodwill-port-orange'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'color_tag' AND dr.day_of_week IS NOT DISTINCT FROM 6 AND dr.description = 'Rotating tag color 50% off'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'color_tag', 1, NULL, 50, 'Color-tag 50% off',
      NULL, 'UNVERIFIED demo'
    FROM venues v WHERE v.slug = 'goodwill-daytona-isb'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'color_tag' AND dr.day_of_week IS NOT DISTINCT FROM 1 AND dr.description = 'Color-tag 50% off'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'senior_day', 3, NULL, 10, 'Senior day 10% off (55+)',
      NULL, 'UNVERIFIED demo'
    FROM venues v WHERE v.slug = 'goodwill-daytona-isb'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'senior_day' AND dr.day_of_week IS NOT DISTINCT FROM 3 AND dr.description = 'Senior day 10% off (55+)'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'half_off', 5, NULL, 50, 'Half-off clothing',
      NULL, 'UNVERIFIED demo'
    FROM venues v WHERE v.slug = 'goodwill-daytona-isb'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'half_off' AND dr.day_of_week IS NOT DISTINCT FROM 5 AND dr.description = 'Half-off clothing'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'restock', 1, '08:00', NULL, 'Heavy bin restock (AM)',
      NULL, 'UNVERIFIED demo'
    FROM venues v WHERE v.slug = 'goodwill-pine-hills-outlet'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'restock' AND dr.day_of_week IS NOT DISTINCT FROM 1 AND dr.description = 'Heavy bin restock (AM)'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'dollar_day', 4, NULL, NULL, 'Bins $/lb discount day',
      NULL, 'UNVERIFIED demo'
    FROM venues v WHERE v.slug = 'goodwill-pine-hills-outlet'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'dollar_day' AND dr.day_of_week IS NOT DISTINCT FROM 4 AND dr.description = 'Bins $/lb discount day'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'bins_rotation', 6, NULL, NULL, 'Saturday bin rotations hourly',
      NULL, 'UNVERIFIED demo'
    FROM venues v WHERE v.slug = 'goodwill-pine-hills-outlet'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'bins_rotation' AND dr.day_of_week IS NOT DISTINCT FROM 6 AND dr.description = 'Saturday bin rotations hourly'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'restock', 2, '08:00', NULL, 'Heavy bin restock (AM)',
      NULL, 'UNVERIFIED demo'
    FROM venues v WHERE v.slug = 'goodwill-taft-outlet'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'restock' AND dr.day_of_week IS NOT DISTINCT FROM 2 AND dr.description = 'Heavy bin restock (AM)'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'dollar_day', 4, NULL, NULL, 'Select bins $1 items',
      NULL, 'UNVERIFIED demo'
    FROM venues v WHERE v.slug = 'goodwill-taft-outlet'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'dollar_day' AND dr.day_of_week IS NOT DISTINCT FROM 4 AND dr.description = 'Select bins $1 items'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'bins_rotation', 6, '10:00', NULL, 'Furniture rotation',
      NULL, 'UNVERIFIED demo'
    FROM venues v WHERE v.slug = 'goodwill-taft-outlet'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'bins_rotation' AND dr.day_of_week IS NOT DISTINCT FROM 6 AND dr.description = 'Furniture rotation'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'restock', 2, NULL, NULL, 'Preview day',
      NULL, 'UNVERIFIED demo'
    FROM venues v WHERE v.slug = 'berners-auction-deland'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'restock' AND dr.day_of_week IS NOT DISTINCT FROM 2 AND dr.description = 'Preview day'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'restock', 3, '18:30', NULL, 'Weekly auction 6:30pm',
      now(), 'estatesales.net'
    FROM venues v WHERE v.slug = 'berners-auction-deland'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'restock' AND dr.day_of_week IS NOT DISTINCT FROM 3 AND dr.description = 'Weekly auction 6:30pm'
    );
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'precious-finds-port-orange-2026-11', 'Precious Finds in Port Orange', 'estate', NULL, 'Port Orange', '32127',
      29.115, -81.03, ARRAY['cash','venmo','zelle']::text[], 'estatesales_net', 'https://www.estatesales.net/FL/Port-Orange/32127/5139969', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'precious-finds-port-orange-2026-11');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-12', '09:00', '15:00', 0
      FROM sales s WHERE s.slug = 'precious-finds-port-orange-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-12');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-13', '09:00', '15:00', 20
      FROM sales s WHERE s.slug = 'precious-finds-port-orange-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-13');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-14', '09:00', '15:00', 50
      FROM sales s WHERE s.slug = 'precious-finds-port-orange-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-14');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'riverside-estate-daytona-2026-11', 'Riverside Drive Estate — Full House', 'estate', NULL, 'Daytona Beach', '32118',
      29.22, -81, ARRAY['cash','card']::text[], 'estatesales_net', 'https://www.estatesales.net/FL/Daytona-Beach', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'riverside-estate-daytona-2026-11');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-06', '08:00', '14:00', 0
      FROM sales s WHERE s.slug = 'riverside-estate-daytona-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-06');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-07', '08:00', '14:00', 25
      FROM sales s WHERE s.slug = 'riverside-estate-daytona-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-07');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-08', '09:00', '13:00', 50
      FROM sales s WHERE s.slug = 'riverside-estate-daytona-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-08');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'berners-auction-week-deland-2026-11', 'Berner''s Auction Week — Furniture & Tools', 'auction', NULL, 'DeLand', '32724',
      29.0065, -81.287, ARRAY['cash','card']::text[], 'estatesales_net', 'https://www.estatesales.net/FL/Daytona-Beach', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'berners-auction-week-deland-2026-11');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-04', '18:30', '22:00', 0
      FROM sales s WHERE s.slug = 'berners-auction-week-deland-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-04');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-11', '18:30', '22:00', 0
      FROM sales s WHERE s.slug = 'berners-auction-week-deland-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-11');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'ormond-thrift-half-off-2026-11', 'Ormond Beach Thrift — Half-Off Saturday', 'thrift', NULL, 'Ormond Beach', '32174',
      29.285, -81.056, ARRAY['cash','card']::text[], 'estatesales_net', 'https://www.goodwillcfl.org/locations/', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'ormond-thrift-half-off-2026-11');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-07', '09:00', '21:00', 50
      FROM sales s WHERE s.slug = 'ormond-thrift-half-off-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-07');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'nsb-multi-family-yard-2026-11', 'New Smyrna Multi-Family Yard Sale', 'yard', NULL, 'New Smyrna Beach', '32169',
      29.025, -80.927, ARRAY['cash']::text[], 'estatesales_net', 'https://www.estatesales.net/FL/New-Smyrna-Beach', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'nsb-multi-family-yard-2026-11');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-07', '07:00', '12:00', 0
      FROM sales s WHERE s.slug = 'nsb-multi-family-yard-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-07');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-08', '07:00', '11:00', 30
      FROM sales s WHERE s.slug = 'nsb-multi-family-yard-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-08');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'spruce-creek-estate-port-orange-2026-11', 'Spruce Creek Fly-In Estate — Mid-Century & Art', 'estate', NULL, 'Port Orange', '32128',
      29.08, -81.05, ARRAY['cash','venmo']::text[], 'estatesales_net', 'https://www.estatesales.net/FL/Port-Orange', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'spruce-creek-estate-port-orange-2026-11');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-13', '09:00', '15:00', 0
      FROM sales s WHERE s.slug = 'spruce-creek-estate-port-orange-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-13');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-14', '09:00', '15:00', 30
      FROM sales s WHERE s.slug = 'spruce-creek-estate-port-orange-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-14');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-15', '10:00', '14:00', 50
      FROM sales s WHERE s.slug = 'spruce-creek-estate-port-orange-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-15');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'pine-hills-bins-restock-2026-11', 'Pine Hills Outlet — Fresh Bins Monday', 'outlet_bins', NULL, 'Orlando', '32818',
      28.5785, -81.4565, ARRAY['cash','card']::text[], 'estatesales_net', 'https://www.goodwillcfl.org/locations/', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'pine-hills-bins-restock-2026-11');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-09', '08:00', '17:00', 0
      FROM sales s WHERE s.slug = 'pine-hills-bins-restock-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-09');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'ormond-beach-mid-century-estate-2026-11', 'Ormond Beach Mid-Century Estate — Teak & Barware', 'estate', NULL, 'Ormond Beach', '32176',
      29.3, -81.06, ARRAY['cash','card']::text[], 'estatesales_net', 'https://www.estatesales.net/FL/Ormond-Beach', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'ormond-beach-mid-century-estate-2026-11');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-19', '09:00', '15:00', 0
      FROM sales s WHERE s.slug = 'ormond-beach-mid-century-estate-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-19');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-20', '09:00', '15:00', 25
      FROM sales s WHERE s.slug = 'ormond-beach-mid-century-estate-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-20');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-21', '09:00', '13:00', 50
      FROM sales s WHERE s.slug = 'ormond-beach-mid-century-estate-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-21');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'nsb-coastal-cottage-estate-2026-11', 'New Smyrna Coastal Cottage Estate — Nautical & Art', 'estate', NULL, 'New Smyrna Beach', '32168',
      29.03, -80.93, ARRAY['cash','venmo']::text[], 'estatesales_net', 'https://www.estatesales.net/FL/New-Smyrna-Beach', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'nsb-coastal-cottage-estate-2026-11');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-20', '08:00', '14:00', 0
      FROM sales s WHERE s.slug = 'nsb-coastal-cottage-estate-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-20');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-21', '08:00', '14:00', 30
      FROM sales s WHERE s.slug = 'nsb-coastal-cottage-estate-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-21');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'deland-downtown-moving-sale-2026-11', 'DeLand Historic District Moving Sale — Antiques & Books', 'yard', NULL, 'DeLand', '32720',
      29.03, -81.3, ARRAY['cash']::text[], 'estatesales_net', 'https://www.estatesales.net/FL/DeLand', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'deland-downtown-moving-sale-2026-11');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-14', '07:30', '13:00', 0
      FROM sales s WHERE s.slug = 'deland-downtown-moving-sale-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-14');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'daytona-beachside-condo-estate-2026-11', 'Daytona Beachside Condo Estate — Furniture & Jewelry', 'estate', NULL, 'Daytona Beach', '32118',
      29.21, -81.01, ARRAY['cash','card','zelle']::text[], 'estatesales_net', 'https://www.estatesales.net/FL/Daytona-Beach', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'daytona-beachside-condo-estate-2026-11');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-20', '09:00', '15:00', 0
      FROM sales s WHERE s.slug = 'daytona-beachside-condo-estate-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-20');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-21', '09:00', '15:00', 50
      FROM sales s WHERE s.slug = 'daytona-beachside-condo-estate-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-21');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'port-orange-garage-tools-2026-11', 'Port Orange Garage Sale — Tools & Fishing Gear', 'yard', NULL, 'Port Orange', '32127',
      29.12, -80.99, ARRAY['cash']::text[], 'estatesales_net', 'https://www.estatesales.net/FL/Port-Orange', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'port-orange-garage-tools-2026-11');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-21', '07:00', '12:00', 0
      FROM sales s WHERE s.slug = 'port-orange-garage-tools-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-21');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'berners-auction-thanksgiving-week-deland-2026-11', 'Berner''s Auction — Pre-Holiday Collectibles Night', 'auction', NULL, 'DeLand', '32724',
      29.0065, -81.287, ARRAY['cash','card']::text[], 'estatesales_net', 'https://www.estatesales.net/FL/Daytona-Beach', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'berners-auction-thanksgiving-week-deland-2026-11');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-18', '18:30', '22:00', 0
      FROM sales s WHERE s.slug = 'berners-auction-thanksgiving-week-deland-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-18');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-25', '18:30', '22:00', 0
      FROM sales s WHERE s.slug = 'berners-auction-thanksgiving-week-deland-2026-11'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-25');
COMMIT;