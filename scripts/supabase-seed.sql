BEGIN;
INSERT INTO organizations (name, type, website, phone, source_url, is_featured)
    SELECT 'Goodwill Industries of Central Florida', 'thrift_chain', 'https://www.goodwillcfl.org/locations/', NULL, NULL, false
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Goodwill Industries of Central Florida');
INSERT INTO organizations (name, type, website, phone, source_url, is_featured)
    SELECT 'Habitat for Humanity ReStore', 'thrift_chain', 'https://www.habitat.org/restores', NULL, NULL, false
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Habitat for Humanity ReStore');
INSERT INTO organizations (name, type, website, phone, source_url, is_featured)
    SELECT 'Berner''s Auction, Inc', 'auction_house', 'https://www.estatesales.net/FL/Daytona-Beach', NULL, NULL, false
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Berner''s Auction, Inc');
INSERT INTO organizations (name, type, website, phone, source_url, is_featured)
    SELECT 'The Salvation Army', 'thrift_chain', 'https://www.salvationarmyusa.org/fl/orlando/', NULL, NULL, false
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'The Salvation Army');
INSERT INTO organizations (name, type, website, phone, source_url, is_featured)
    SELECT 'Halifax Health - Hospice', 'independent', 'https://211live.org/index.php/component/cpx/?id=3883585&task=resource.view', NULL, NULL, false
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Halifax Health - Hospice');
INSERT INTO organizations (name, type, website, phone, source_url, is_featured)
    SELECT 'Halifax Humane Society', 'independent', 'https://www.halifaxhumanesociety.org/thrift-store/', NULL, NULL, false
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Halifax Humane Society');
INSERT INTO organizations (name, type, website, phone, source_url, is_featured)
    SELECT 'Flagler Humane Society', 'independent', 'https://flaglerhumanesociety.org/thrift-store/', NULL, NULL, false
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Flagler Humane Society');
INSERT INTO organizations (name, type, website, phone, source_url, is_featured)
    SELECT 'OMG Thrift (independent)', 'independent', 'https://omgthrift.com/contact/', NULL, NULL, false
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'OMG Thrift (independent)');
INSERT INTO organizations (name, type, website, phone, source_url, is_featured)
    SELECT 'HOPE Helps, Inc.', 'independent', 'https://www.hopehelps.org/the-hope-chest/', NULL, NULL, false
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'HOPE Helps, Inc.');
INSERT INTO organizations (name, type, website, phone, source_url, is_featured)
    SELECT 'City Thrift (independent)', 'independent', 'https://thriftnearby.com/fl/orlando/city-thrift-1803/', NULL, NULL, false
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'City Thrift (independent)');
INSERT INTO organizations (name, type, website, phone, source_url, is_featured)
    SELECT 'Society of St. Vincent de Paul', 'independent', 'https://findthrift.com/store-list/FL/Longwood', NULL, NULL, false
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Society of St. Vincent de Paul');
INSERT INTO organizations (name, type, website, phone, source_url, is_featured)
    SELECT 'The Sharing Center', 'independent', 'https://thesharingcenter.org/shopwithus/', NULL, NULL, false
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'The Sharing Center');
INSERT INTO organizations (name, type, website, phone, source_url, is_featured)
    SELECT 'Prince of Peace Catholic Church', 'independent', 'https://www.princeofpeaceormond.com/like-new-shop', NULL, NULL, false
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Prince of Peace Catholic Church');
INSERT INTO organizations (name, type, website, phone, source_url, is_featured)
    SELECT 'Pierson Methodist Church', 'independent', 'https://www.beacononlinenews.com/churches/pierson-methodist-church/', NULL, NULL, false
    WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE name = 'Pierson Methodist Church');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'goodwill-port-orange', (SELECT id FROM organizations WHERE name = 'Goodwill Industries of Central Florida' LIMIT 1),
      'Goodwill Port Orange', 'thrift', '1752 Dunlawton Ave', 'Port Orange', '32129', 29.1385, -81.0175, '(386) 898-0308',
      '{"daily":"9:00-21:00"}'::jsonb, 'Goodwill CFL: Color of the Week 50% off (rotates Sundays), seniors 55+ Mondays, military 10% Wednesdays; discounts don''t stack (goodwillcfl.org, checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'goodwill-port-orange');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'goodwill-pine-hills-outlet', (SELECT id FROM organizations WHERE name = 'Goodwill Industries of Central Florida' LIMIT 1),
      'Goodwill Pine Hills Outlet (Bins)', 'outlet_bins', '2633 N Hiawassee Rd', 'Orlando', '32818', 28.5785, -81.4565, '(407) 203-8981',
      '{"daily":"8:00-17:00"}'::jsonb, 'goodwillcfl.org lists Mon–Sun 8 A.M.–5 P.M. (checked 2026-11-02). Restock times unverified.', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'goodwill-pine-hills-outlet');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'goodwill-taft-outlet', (SELECT id FROM organizations WHERE name = 'Goodwill Industries of Central Florida' LIMIT 1),
      'Goodwill Taft Outlet (Bins)', 'outlet_bins', '1030 Crews Commerce Dr', 'Orlando', '32837', 28.414, -81.3935, '(407) 652-6787',
      '{"daily":"8:00-18:00"}'::jsonb, 'goodwillcfl.org lists Mon–Sun 8 A.M.–6 P.M. (checked 2026-11-02). Restock times unverified.', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'goodwill-taft-outlet');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'berners-auction-deland', (SELECT id FROM organizations WHERE name = 'Berner''s Auction, Inc' LIMIT 1),
      'Berner''s Auction', 'auction_house', '1500 Jacobs Rd', 'DeLand', '32724', 29.0065, -81.287, NULL,
      '{"wed":"18:30-22:00"}'::jsonb, 'Weekly Wednesday auction.', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'berners-auction-deland');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'goodwill-deland', (SELECT id FROM organizations WHERE name = 'Goodwill Industries of Central Florida' LIMIT 1),
      'Goodwill DeLand', 'thrift', '1600 North Woodland Boulevard', 'DeLand', '32720', 29.05991, -81.30462, '(386) 265-0975',
      '{"daily":"9:00-21:00"}'::jsonb, 'Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'goodwill-deland');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'goodwill-holly-hill', (SELECT id FROM organizations WHERE name = 'Goodwill Industries of Central Florida' LIMIT 1),
      'Goodwill Holly Hill', 'thrift', '1577 North Nova Rd.', 'Holly Hill', '32117', 29.23831, -81.0573, '(386) 257-3247',
      '{"daily":"9:00-21:00"}'::jsonb, 'Map pin approximate (geocoder matched S Nova Rd). Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'goodwill-holly-hill');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'goodwill-orange-city', (SELECT id FROM organizations WHERE name = 'Goodwill Industries of Central Florida' LIMIT 1),
      'Goodwill Orange City', 'thrift', '891 Harley Strickland Blvd.', 'Orange City', '32763', 28.91685, -81.28839, '(386) 774-5533',
      '{"daily":"9:00-21:00"}'::jsonb, 'Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'goodwill-orange-city');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'goodwill-sanford', (SELECT id FROM organizations WHERE name = 'Goodwill Industries of Central Florida' LIMIT 1),
      'Goodwill Sanford', 'thrift', '300 East 3rd Street', 'Sanford', '32771', 28.80997, -81.2659, '(407) 323-2272',
      '{"daily":"9:00-21:00"}'::jsonb, 'Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'goodwill-sanford');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'goodwill-west-sanford', (SELECT id FROM organizations WHERE name = 'Goodwill Industries of Central Florida' LIMIT 1),
      'Goodwill West Sanford', 'thrift', '4516 FL-46', 'Sanford', '32771', 28.78691, -81.20577, '(407) 878-1741',
      '{"daily":"9:00-21:00"}'::jsonb, 'Map pin approximate (geocoded). Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'goodwill-west-sanford');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'goodwill-fern-park', (SELECT id FROM organizations WHERE name = 'Goodwill Industries of Central Florida' LIMIT 1),
      'Goodwill Fern Park', 'thrift', '7800 S. U.S. Hwy 17-92', 'Fern Park', '32730', 28.65257, -81.34817, '(407) 478-1000',
      '{"daily":"9:00-21:00"}'::jsonb, 'Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'goodwill-fern-park');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'goodwill-casselberry', (SELECT id FROM organizations WHERE name = 'Goodwill Industries of Central Florida' LIMIT 1),
      'Goodwill Longwood/Casselberry', 'thrift', '1795 Sunshadow Drive', 'Casselberry', '32707', 28.69771, -81.32165, '(407) 695-3800',
      '{"daily":"9:00-21:00"}'::jsonb, 'Map pin from OpenStreetMap Nominatim. Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'goodwill-casselberry');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'goodwill-oviedo', (SELECT id FROM organizations WHERE name = 'Goodwill Industries of Central Florida' LIMIT 1),
      'Goodwill Oviedo', 'thrift', '1819 Alafaya Trail', 'Oviedo', '32765', 28.64422, -81.20738, '(407) 706-0800',
      '{"daily":"9:00-21:00"}'::jsonb, 'Map pin from OpenStreetMap Nominatim. Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'goodwill-oviedo');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'goodwill-curry-ford', (SELECT id FROM organizations WHERE name = 'Goodwill Industries of Central Florida' LIMIT 1),
      'Goodwill Curry Ford', 'thrift', '7390 Curry Ford Rd', 'Orlando', '32822', 28.51326, -81.28576, '(407) 447-0026',
      '{"daily":"9:00-21:00"}'::jsonb, 'Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'goodwill-curry-ford');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'goodwill-goldenrod', (SELECT id FROM organizations WHERE name = 'Goodwill Industries of Central Florida' LIMIT 1),
      'Goodwill Goldenrod', 'thrift', '4780 South Goldenrod Road', 'Orlando', '32822', 28.47812, -81.28548, '(407) 720-3313',
      '{"daily":"9:00-21:00"}'::jsonb, 'Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'goodwill-goldenrod');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'goodwill-south-obt', (SELECT id FROM organizations WHERE name = 'Goodwill Industries of Central Florida' LIMIT 1),
      'Goodwill S. OBT', 'thrift', '7531 South Orange Blossom Trail', 'Orlando', '32809', 28.4569, -81.39887, '(407) 859-4750',
      '{"daily":"9:00-21:00"}'::jsonb, 'Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'goodwill-south-obt');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'goodwill-waterford-lakes', (SELECT id FROM organizations WHERE name = 'Goodwill Industries of Central Florida' LIMIT 1),
      'Goodwill Waterford Lakes', 'thrift', '12170 Lake Underhill Road', 'Orlando', '32825', 28.54668, -81.20888, '(407) 277-4999',
      '{"daily":"9:00-21:00"}'::jsonb, 'Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'goodwill-waterford-lakes');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'goodwill-winter-park-boutique', (SELECT id FROM organizations WHERE name = 'Goodwill Industries of Central Florida' LIMIT 1),
      'Goodwill Winter Park Boutique', 'thrift', '750 Orange Avenue', 'Winter Park', '32789', 28.59163, -81.35815, '(407) 628-5553',
      '{"daily":"9:00-21:00"}'::jsonb, 'Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'goodwill-winter-park-boutique');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'goodwill-apopka', (SELECT id FROM organizations WHERE name = 'Goodwill Industries of Central Florida' LIMIT 1),
      'Goodwill Apopka', 'thrift', '1312 East Semoran Boulevard', 'Apopka', '32703', 28.67319, -81.48578, '(407) 889-2965',
      '{"daily":"9:00-21:00"}'::jsonb, 'Map pin from OpenStreetMap Nominatim. Address, phone and hours from https://www.goodwillcfl.org/locations/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'goodwill-apopka');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'restore-west-volusia-deland', (SELECT id FROM organizations WHERE name = 'Habitat for Humanity ReStore' LIMIT 1),
      'West Volusia Habitat ReStore', 'thrift', '604 S. Spring Garden Avenue', 'DeLand', '32720', 29.01882, -81.32401, '(386) 734-7268',
      '{"tue-sat":"8:30-17:00"}'::jsonb, 'Habitat for Humanity ReStore: furniture, appliances, building materials. The store''s site lists conflicting hours (Tue–Sat vs Mon–Sat 8:30–5) — call ahead. Address, phone and hours from https://wvhabitat.org/the-restore/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'restore-west-volusia-deland');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'restore-greater-volusia-port-orange', (SELECT id FROM organizations WHERE name = 'Habitat for Humanity ReStore' LIMIT 1),
      'Habitat ReStore (Greater Volusia)', 'thrift', '3813 S. Nova Road #103 (Dunlawton Square)', 'Port Orange', '32127', 29.12732, -81.00489, '(386) 257-9950',
      '{"tue-sat":"9:00-16:30","sun-mon":"closed"}'::jsonb, 'Habitat for Humanity ReStore: furniture, appliances, building materials, home goods. Address, phone and hours from https://www.habitatgvc.org/restore (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'restore-greater-volusia-port-orange');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'flagler-habitat-restore-palm-coast', (SELECT id FROM organizations WHERE name = 'Habitat for Humanity ReStore' LIMIT 1),
      'Flagler Habitat ReStore - Palm Coast', 'thrift', '5 Hargrove Grade', 'Palm Coast', '32137', 29.55563, -81.26861, '(386) 202-2401',
      '{"daily":"9:00-16:30"}'::jsonb, 'Hours: Daily listed 9am-4:30pm (confirm days). Affiliate office (386) 586-6180. Source: https://flaglerhabitat.org/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'flagler-habitat-restore-palm-coast');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'southeast-volusia-habitat-restore', (SELECT id FROM organizations WHERE name = 'Habitat for Humanity ReStore' LIMIT 1),
      'Southeast Volusia Habitat ReStore', 'thrift', '722 S Dixie Fwy', 'New Smyrna Beach', '32168', 29.01542, -80.92229, '(386) 428-5010 ext 117',
      '{"mon-sat":"9:00-17:00"}'::jsonb, 'Hours: Mon-Sat 9am-5pm; donations 9am-1pm. Source: https://habitatsev.org/restore/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'southeast-volusia-habitat-restore');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'west-orange-habitat-restore', (SELECT id FROM organizations WHERE name = 'Habitat for Humanity ReStore' LIMIT 1),
      'West Orange Habitat ReStore', 'thrift', '13369 W Colonial Dr (behind Taco Bell)', 'Winter Garden', '34787', 28.55114, -81.58071, '(407) 905-0406',
      '{"mon-sat":"9:00-18:00","sun":"closed"}'::jsonb, 'Hours: Mon-Sat 9am-6pm; Sun closed. Source: https://www.westorangehabitat.org/restore (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'west-orange-habitat-restore');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'habitat-seminole-apopka-restore-sanford', (SELECT id FROM organizations WHERE name = 'Habitat for Humanity ReStore' LIMIT 1),
      'Habitat Seminole-Apopka ReStore - Sanford', 'thrift', '1100 Americana Blvd', 'Sanford', '32773', 28.76253, -81.28421, '(407) 215-2000',
      '{"mon-sat":"9:00-18:00"}'::jsonb, 'Hours from a directory listing, unverified. UNVERIFIED listing (third-party directory only; confirm the store is open before visiting). Hours: Mon-Sat 9am-6pm (aggregator). Official site does not list ReStore pages; confirm open. Source: https://findthrift.com/store-information-habitat-for-humanity-of-seminole-apopka-restore-sanford (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'habitat-seminole-apopka-restore-sanford');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'salvation-army-orlando-thrift-store-2', (SELECT id FROM organizations WHERE name = 'The Salvation Army' LIMIT 1),
      'Salvation Army Orlando Thrift Store 2', 'thrift', '4075-A S Goldenrod Rd', 'Orlando', '32822', 28.4886, -81.28524, '(407) 295-9311',
      NULL, 'Hours: Mon-Sat 10am-6pm (aggregator); Sun closed. Hours unverified; Apple Maps lists (689) 986-0780. Source: https://www.salvationarmyusa.org/fl/orlando/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'salvation-army-orlando-thrift-store-2');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'salvation-army-orlando-thrift-store-4', (SELECT id FROM organizations WHERE name = 'The Salvation Army' LIMIT 1),
      'Salvation Army Orlando Thrift Store 4', 'thrift', '1330 N Semoran Blvd', 'Casselberry', '32707', 28.63025, -81.318, '(407) 295-9311',
      NULL, 'Map pin from US Census geocoder (matched 1330 State Hwy 436). Hours not on official page; aggregator store phone 407-671-4419. Source: https://www.salvationarmyusa.org/fl/casselberry/n-semoran-blvd/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'salvation-army-orlando-thrift-store-4');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'salvation-army-daytona-thrift-store', (SELECT id FROM organizations WHERE name = 'The Salvation Army' LIMIT 1),
      'Salvation Army Daytona Thrift Store', 'thrift', '1415 Ridgewood Ave', 'Holly Hill', '32117', 29.25141, -81.04455, '(386) 672-1848',
      '{"tue-sat":"10:00-16:30","sun-mon":"closed"}'::jsonb, 'Hours: Tue-Sat 10am-4:30pm; Sun-Mon closed. Source: https://www.salvationarmyusa.org/usa-southern-territory/florida/thrift-stores/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'salvation-army-daytona-thrift-store');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'halifax-health-hospice-resale-shop-new-smyrna-beach', (SELECT id FROM organizations WHERE name = 'Halifax Health - Hospice' LIMIT 1),
      'Halifax Health Hospice Resale Shop - New Smyrna Beach', 'thrift', '720 S Dixie Fwy Suite B', 'New Smyrna Beach', '32168', 29.01552, -80.92231, '(386) 426-7308',
      '{"mon-sat":"10:00-16:00"}'::jsonb, 'UNVERIFIED listing (third-party directory only; confirm the store is open before visiting). Hours: Mon-Sat 10am-4pm. 2-1-1 directory; Halifax official page not fetched. Source: https://211live.org/index.php/component/cpx/?id=3883585&task=resource.view (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'halifax-health-hospice-resale-shop-new-smyrna-beach');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'halifax-health-hospice-resale-shop-orange-city', (SELECT id FROM organizations WHERE name = 'Halifax Health - Hospice' LIMIT 1),
      'Halifax Health Hospice Resale Shop - Orange City', 'thrift', '876 Saxon Blvd', 'Orange City', '32763', 28.91117, -81.29253, '(386) 456-0240',
      '{"mon-sat":"10:00-16:00"}'::jsonb, 'UNVERIFIED listing (third-party directory only; confirm the store is open before visiting). Hours: Mon-Sat 10am-4pm. Source: https://211live.org/index.php?id=3883586&option=com_cpx&task=resource.view (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'halifax-health-hospice-resale-shop-orange-city');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'halifax-health-hospice-resale-shop-port-orange', (SELECT id FROM organizations WHERE name = 'Halifax Health - Hospice' LIMIT 1),
      'Halifax Health Hospice Resale Shop - Port Orange', 'thrift', '3830 S Nova Rd Unit A', 'Port Orange', '32127', 29.12669, -81.00469, '(386) 761-6045',
      '{"mon-sat":"10:00-16:00"}'::jsonb, 'UNVERIFIED listing (third-party directory only; confirm the store is open before visiting). Hours: Mon-Sat 10am-4pm. Source: https://211live.org/index.php/component/cpx/?id=3883588&task=resource.view (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'halifax-health-hospice-resale-shop-port-orange');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'halifax-health-hospice-resale-shop-ormond-beach', (SELECT id FROM organizations WHERE name = 'Halifax Health - Hospice' LIMIT 1),
      'Halifax Health Hospice Resale Shop - Ormond Beach', 'thrift', '160 N Nova Rd #132', 'Ormond Beach', '32174', 29.28145, -81.08274, '(386) 672-2915',
      '{"mon-sat":"10:00-16:00"}'::jsonb, 'UNVERIFIED listing (third-party directory only; confirm the store is open before visiting). Hours: Mon-Sat 10am-4pm (likely). Sources conflict N vs S Nova Rd; verify. Source: https://211live.org/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'halifax-health-hospice-resale-shop-ormond-beach');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'halifax-health-hospice-resale-shop-palm-coast', (SELECT id FROM organizations WHERE name = 'Halifax Health - Hospice' LIMIT 1),
      'Halifax Health Hospice Resale Shop - Palm Coast', 'thrift', '126 Flagler Plaza Dr', 'Palm Coast', '32137', 29.47516, -81.18135, '(386) 439-0333',
      '{"mon-sat":"10:00-16:00"}'::jsonb, 'UNVERIFIED listing (third-party directory only; confirm the store is open before visiting). Hours: Mon-Sat 10am-4pm. Reopened 2023. Source: https://www.flaglernewsweekly.com/halifax-health-hospice-celebrates-resale-store-reopening-in-palm-coast/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'halifax-health-hospice-resale-shop-palm-coast');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'halifax-humane-society-thrift-store', (SELECT id FROM organizations WHERE name = 'Halifax Humane Society' LIMIT 1),
      'Halifax Humane Society Thrift Store', 'thrift', '385 S Yonge St', 'Ormond Beach', '32174', 29.27311, -81.05677, '(386) 322-7717',
      '{"mon-sat":"9:00-18:00"}'::jsonb, 'Hours: Mon-Sat 9am-6pm. Free donation pickup. Source: https://www.halifaxhumanesociety.org/thrift-store/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'halifax-humane-society-thrift-store');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'flagler-humane-society-thrift-store', (SELECT id FROM organizations WHERE name = 'Flagler Humane Society' LIMIT 1),
      'Flagler Humane Society Thrift Store', 'thrift', '480 Palm Coast Pkwy SW', 'Palm Coast', '32137', 29.55143, -81.24352, '(386) 446-9416',
      '{"mon-sat":"9:00-19:00","sun":"10:00-17:00"}'::jsonb, 'Hours: Mon-Sat 9am-7pm; Sun 10am-5pm. Source: https://flaglerhumanesociety.org/thrift-store/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'flagler-humane-society-thrift-store');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'omg-thrift', (SELECT id FROM organizations WHERE name = 'OMG Thrift (independent)' LIMIT 1),
      'omg! thrift', 'thrift', '1442 State Road 436 Suite 1028', 'Casselberry', '32707', 28.62662, -81.31627, '1-888-6THRIFT',
      '{"mon-sat":"9:00-20:00","sun":"11:00-19:00"}'::jsonb, 'Hours: Mon-Sat 9am-8pm; Sun 11am-7pm. Deal day from aggregator only (unverified); blog says color listed on their site. Source: https://omgthrift.com/contact/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'omg-thrift');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'the-hope-chest', (SELECT id FROM organizations WHERE name = 'HOPE Helps, Inc.' LIMIT 1),
      'The HOPE Chest', 'thrift', '1802 W Broadway St', 'Oviedo', '32765', 28.66212, -81.22434, '407-366-3422',
      '{"mon-fri":"9:00-17:00","sat":"8:00-17:00","sun":"closed"}'::jsonb, 'Hours: Mon-Fri 9am-5pm; Sat 8am-5pm; Sun closed. Hours official; store address from aggregator (org office 812 Eyrie Dr); deal days unverified. Source: https://www.hopehelps.org/the-hope-chest/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'the-hope-chest');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'city-thrift-edgewater', (SELECT id FROM organizations WHERE name = 'City Thrift (independent)' LIMIT 1),
      'City Thrift - Edgewater', 'thrift', '6015 Edgewater Dr', 'Orlando', '32810', 28.61163, -81.41683, NULL,
      '{"mon-sat":"9:00-21:00","sun":"10:00-19:00"}'::jsonb, 'Hours from a directory listing, unverified. UNVERIFIED listing (third-party directory only; confirm the store is open before visiting). Hours: Mon-Sat 9am-9pm; Sun 10am-7pm (aggregator). No official site found. Source: https://thriftnearby.com/fl/orlando/city-thrift-1803/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'city-thrift-edgewater');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'city-thrift-semoran', (SELECT id FROM organizations WHERE name = 'City Thrift (independent)' LIMIT 1),
      'City Thrift - Semoran', 'thrift', '1803 S Semoran Blvd', 'Orlando', '32822', 28.52088, -81.3102, NULL,
      NULL, 'UNVERIFIED listing (third-party directory only; confirm the store is open before visiting). Source: https://www.orlandoweekly.com/orlando-guides/newcomers-guide/everything-old-is-new-again-if-you-shop-orlandos-thrifts-to-decorate-your-home/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'city-thrift-semoran');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'salvation-army-w-colonial-orlando', (SELECT id FROM organizations WHERE name = 'The Salvation Army' LIMIT 1),
      'Salvation Army Thrift Store (W Colonial Dr)', 'thrift', '3899-3955 W Colonial Dr', 'Orlando', '32808', 28.552831, -81.427908, '(321) 398-5520',
      '{"mon-sat":"9:00-18:00","sun":"closed"}'::jsonb, 'Hours Mon–Sat 9 AM–6 PM, closed Sun. Wednesday Customer Appreciation Day (50% off all tag colors but one) and rotating color-tag sales are store-specific and come from a business-owner reply on Yelp — unverified with the store. Source: https://www.salvationarmyusa.org/fl/orlando/w-colonial-dr-1/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'salvation-army-w-colonial-orlando');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'st-vincent-de-paul-thrift-store-apopka', (SELECT id FROM organizations WHERE name = 'Society of St. Vincent de Paul' LIMIT 1),
      'St. Vincent de Paul Thrift Store - Apopka', 'thrift', '770 S Orange Blossom Trail', 'Apopka', '32703', 28.66856, -81.4907, '(407) 886-0940',
      '{"daily":"9:00-19:00"}'::jsonb, 'Map pin from US Census geocoder. Hours: Mon-Sun 9am-7pm. Source: https://svdporlando.org/svdp-thrift-stores-1 (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'st-vincent-de-paul-thrift-store-apopka');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'st-vincent-de-paul-nearly-new-flagler-beach', (SELECT id FROM organizations WHERE name = 'Society of St. Vincent de Paul' LIMIT 1),
      'St. Vincent de Paul Nearly New Thrift Store - Flagler Beach', 'thrift', '400 S Daytona Ave', 'Flagler Beach', '32136', 29.47829, -81.1285, '(386) 439-0071',
      '{"mon,wed,fri,sat":"10:00-15:00"}'::jsonb, 'UNVERIFIED listing (third-party directory only; confirm the store is open before visiting). Hours: Mon, Wed, Fri, Sat 10am-3pm (211 listing; another source adds Thu). No official site found, only Facebook. Source: 211live.org (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'st-vincent-de-paul-nearly-new-flagler-beach');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'sharing-center-village-shoppes-longwood', (SELECT id FROM organizations WHERE name = 'The Sharing Center' LIMIT 1),
      'The Sharing Center Village Shoppes (Thrift, Boutique, Furniture)', 'thrift', '600 N Highway 17-92 Suite 130', 'Longwood', '32750', 0, 0, '(407) 260-9155',
      '{"mon-sat":"9:30-17:00","sun":"closed"}'::jsonb, 'Not on the map yet (address didn''t geocode). Hours: Mon-Sat 9:30am-5pm; Sun closed. Site mentions weekly specials but names no days. Source: https://thesharingcenter.org/shopwithus/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'sharing-center-village-shoppes-longwood');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'prince-of-peace-like-new-shop-ormond-beach', (SELECT id FROM organizations WHERE name = 'Prince of Peace Catholic Church' LIMIT 1),
      'Prince of Peace Like New Shop', 'thrift', '1225 Hand Ave', 'Ormond Beach', '32174', 29.25865, -81.09862, '(386) 672-2836',
      '{"tue-fri":"9:30-14:00","1st-3rd-sat":"10:00-13:00"}'::jsonb, 'Parish thrift shop. Map pin from US Census geocoder. Hours: Tue-Fri 9:30am-2pm; 1st & 3rd Sat 10am-1pm. Source: https://www.princeofpeaceormond.com/like-new-shop (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'prince-of-peace-like-new-shop-ormond-beach');
INSERT INTO venues (slug, org_id, name, type, address, city, zip, lat, lng, phone, hours_json, notes, active)
    SELECT 'pierson-methodist-church-thrift-store', (SELECT id FROM organizations WHERE name = 'Pierson Methodist Church' LIMIT 1),
      'Pierson Methodist Church Thrift Store', 'thrift', '136 W Second Ave', 'Pierson', '32180', 29.23962, -81.46435, '(386) 434-2030',
      '{"fri-sat":"10:00-14:00"}'::jsonb, 'UNVERIFIED listing (third-party directory only; confirm the store is open before visiting). Hours: Fri-Sat 10am-2pm (local church directory, not an official church page). Source: https://www.beacononlinenews.com/churches/pierson-methodist-church/ (checked 2026-11-02).', true
    WHERE NOT EXISTS (SELECT 1 FROM venues WHERE slug = 'pierson-methodist-church-thrift-store');
INSERT INTO tags (name) SELECT 'furniture' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE name = 'furniture');
INSERT INTO tags (name) SELECT 'mid-century' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE name = 'mid-century');
INSERT INTO tags (name) SELECT 'tools' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE name = 'tools');
INSERT INTO tags (name) SELECT 'jewelry' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE name = 'jewelry');
INSERT INTO tags (name) SELECT 'vinyl' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE name = 'vinyl');
INSERT INTO tags (name) SELECT 'art' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE name = 'art');
INSERT INTO tags (name) SELECT 'collectibles' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE name = 'collectibles');
INSERT INTO tags (name) SELECT 'clothing' WHERE NOT EXISTS (SELECT 1 FROM tags WHERE name = 'clothing');
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'color_tag', 0, NULL, 50, 'Color of the Week 50% off (color changes Sundays, posted in store)',
      now(), 'estatesales.net'
    FROM venues v WHERE v.slug = 'goodwill-port-orange'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'color_tag' AND dr.day_of_week IS NOT DISTINCT FROM 0 AND dr.description = 'Color of the Week 50% off (color changes Sundays, posted in store)'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'senior_day', 1, NULL, NULL, 'Seniors 55+ discount (ask in store for amount)',
      now(), 'estatesales.net'
    FROM venues v WHERE v.slug = 'goodwill-port-orange'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'senior_day' AND dr.day_of_week IS NOT DISTINCT FROM 1 AND dr.description = 'Seniors 55+ discount (ask in store for amount)'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'senior_day', 3, NULL, 10, 'Military 10% off',
      now(), 'estatesales.net'
    FROM venues v WHERE v.slug = 'goodwill-port-orange'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'senior_day' AND dr.day_of_week IS NOT DISTINCT FROM 3 AND dr.description = 'Military 10% off'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'restock', 2, '09:00', NULL, 'Fresh housewares floor (AM)',
      NULL, 'UNVERIFIED demo'
    FROM venues v WHERE v.slug = 'goodwill-port-orange'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'restock' AND dr.day_of_week IS NOT DISTINCT FROM 2 AND dr.description = 'Fresh housewares floor (AM)'
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
    SELECT v.id, 'restock', 3, '18:30', NULL, 'Weekly auction',
      now(), 'estatesales.net'
    FROM venues v WHERE v.slug = 'berners-auction-deland'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'restock' AND dr.day_of_week IS NOT DISTINCT FROM 3 AND dr.description = 'Weekly auction'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'half_off', 3, NULL, 50, 'Customer Appreciation Day: 50% off all tag colors but one (Yelp)',
      NULL, 'UNVERIFIED demo'
    FROM venues v WHERE v.slug = 'salvation-army-w-colonial-orlando'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'half_off' AND dr.day_of_week IS NOT DISTINCT FROM 3 AND dr.description = 'Customer Appreciation Day: 50% off all tag colors but one (Yelp)'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'color_tag', 1, NULL, 50, 'Color of the Week half price (changes Mondays, per thriftstores.net)',
      NULL, 'UNVERIFIED demo'
    FROM venues v WHERE v.slug = 'omg-thrift'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'color_tag' AND dr.day_of_week IS NOT DISTINCT FROM 1 AND dr.description = 'Color of the Week half price (changes Mondays, per thriftstores.net)'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'dollar_day', 6, NULL, NULL, '$1 clothing, non-boutique (per mylocalnooks.com)',
      NULL, 'UNVERIFIED demo'
    FROM venues v WHERE v.slug = 'the-hope-chest'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'dollar_day' AND dr.day_of_week IS NOT DISTINCT FROM 6 AND dr.description = '$1 clothing, non-boutique (per mylocalnooks.com)'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'senior_day', 2, NULL, 30, 'Seniors 30% off (per uncoveringflorida.com)',
      NULL, 'UNVERIFIED demo'
    FROM venues v WHERE v.slug = 'city-thrift-edgewater'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'senior_day' AND dr.day_of_week IS NOT DISTINCT FROM 2 AND dr.description = 'Seniors 30% off (per uncoveringflorida.com)'
    );
INSERT INTO deal_rules (venue_id, kind, day_of_week, start_time, discount_pct, description, verified_at, source)
    SELECT v.id, 'senior_day', 3, NULL, NULL, 'Military discount (per uncoveringflorida.com)',
      NULL, 'UNVERIFIED demo'
    FROM venues v WHERE v.slug = 'city-thrift-edgewater'
    AND NOT EXISTS (
      SELECT 1 FROM deal_rules dr WHERE dr.venue_id = v.id AND dr.kind = 'senior_day' AND dr.day_of_week IS NOT DISTINCT FROM 3 AND dr.description = 'Military discount (per uncoveringflorida.com)'
    );
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'vintage-mcm-antiques-collectibles-treasure-trove-sale-in-col-5143188', 'Vintage/MCM/Antiques/Collectibles Treasure Trove Sale in College Park!', 'estate', NULL, 'Orlando', '32804',
      28.579, -81.3942, NULL, 'estatesales_net', 'https://www.estatesales.net/FL/Orlando/32804/traditional/5143188', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'vintage-mcm-antiques-collectibles-treasure-trove-sale-in-col-5143188');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-05', '09:00', '15:00', 0
      FROM sales s WHERE s.slug = 'vintage-mcm-antiques-collectibles-treasure-trove-sale-in-col-5143188'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-05');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-06', '09:00', '15:00', 0
      FROM sales s WHERE s.slug = 'vintage-mcm-antiques-collectibles-treasure-trove-sale-in-col-5143188'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-06');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-07', '09:00', '15:00', 0
      FROM sales s WHERE s.slug = 'vintage-mcm-antiques-collectibles-treasure-trove-sale-in-col-5143188'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-07');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'estate-sale-orlando-5144160', 'Estate Sale Orlando', 'estate', NULL, 'Orlando', '32812',
      28.4847, -81.3244, NULL, 'estatesales_net', 'https://www.estatesales.net/FL/Orlando/32812/traditional/5144160', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'estate-sale-orlando-5144160');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-06', '08:30', '14:00', 0
      FROM sales s WHERE s.slug = 'estate-sale-orlando-5144160'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-06');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-07', '08:30', '14:00', 0
      FROM sales s WHERE s.slug = 'estate-sale-orlando-5144160'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-07');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'hathaway-estate-sales-winter-park-5144367', 'Hathaway Estate Sales - Winter Park', 'estate', NULL, 'Winter Park', '32789',
      28.5992, -81.3522, NULL, 'estatesales_net', 'https://www.estatesales.net/FL/Winter%20Park/32789/traditional/5144367', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'hathaway-estate-sales-winter-park-5144367');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-06', '09:00', '14:45', 0
      FROM sales s WHERE s.slug = 'hathaway-estate-sales-winter-park-5144367'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-06');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-07', '09:00', '14:45', 0
      FROM sales s WHERE s.slug = 'hathaway-estate-sales-winter-park-5144367'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-07');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-08', '09:00', '14:45', 0
      FROM sales s WHERE s.slug = 'hathaway-estate-sales-winter-park-5144367'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-08');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'winter-park-estate-sale-on-green-cove-rd-winter-prak-fl-5143062', 'Winter Park Estate Sale on Green Cove Rd Winter Prak FL', 'estate', NULL, 'Winter Park', '32792',
      28.6084, -81.3006, NULL, 'estatesales_net', 'https://www.estatesales.net/FL/Winter%20Park/32792/traditional/5143062', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'winter-park-estate-sale-on-green-cove-rd-winter-prak-fl-5143062');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-06', '09:00', '15:00', 0
      FROM sales s WHERE s.slug = 'winter-park-estate-sale-on-green-cove-rd-winter-prak-fl-5143062'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-06');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-07', '09:00', '15:00', 0
      FROM sales s WHERE s.slug = 'winter-park-estate-sale-on-green-cove-rd-winter-prak-fl-5143062'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-07');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'crafter-s-paradise-sale-in-orlando-5136069', '“Crafter’s Paradise” Sale in Orlando', 'estate', NULL, 'Orlando', '32819',
      28.4537, -81.4724, NULL, 'estatesales_net', 'https://www.estatesales.net/FL/Orlando/32819/traditional/5136069', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'crafter-s-paradise-sale-in-orlando-5136069');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-06', '09:00', '15:00', 0
      FROM sales s WHERE s.slug = 'crafter-s-paradise-sale-in-orlando-5136069'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-06');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-07', '09:00', '15:00', 0
      FROM sales s WHERE s.slug = 'crafter-s-paradise-sale-in-orlando-5136069'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-07');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-08', '09:00', '15:00', 0
      FROM sales s WHERE s.slug = 'crafter-s-paradise-sale-in-orlando-5136069'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-08');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'operation-estate-liquidation-5139666', 'Operation: Estate Liquidation', 'estate', NULL, 'Orlando', '32826',
      28.5797, -81.1886, NULL, 'estatesales_net', 'https://www.estatesales.net/FL/Orlando/32826/traditional/5139666', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'operation-estate-liquidation-5139666');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-13', '09:00', '15:00', 0
      FROM sales s WHERE s.slug = 'operation-estate-liquidation-5139666'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-13');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-14', '09:00', '15:00', 0
      FROM sales s WHERE s.slug = 'operation-estate-liquidation-5139666'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-14');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-15', '09:00', '15:00', 0
      FROM sales s WHERE s.slug = 'operation-estate-liquidation-5139666'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-15');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'let-it-go-lifestyle-in-apopka-5112129', 'Let it Go Lifestyle in Apopka', 'estate', NULL, 'Apopka', '32712',
      28.7361, -81.5476, NULL, 'estatesales_net', 'https://www.estatesales.net/FL/Apopka/32712/traditional/5112129', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'let-it-go-lifestyle-in-apopka-5112129');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-13', '09:00', '14:00', 0
      FROM sales s WHERE s.slug = 'let-it-go-lifestyle-in-apopka-5112129'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-13');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-14', '09:00', '14:00', 0
      FROM sales s WHERE s.slug = 'let-it-go-lifestyle-in-apopka-5112129'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-14');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-15', '09:00', '14:00', 0
      FROM sales s WHERE s.slug = 'let-it-go-lifestyle-in-apopka-5112129'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-15');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'the-eclectic-collective-5143245', 'The Eclectic Collective', 'estate', NULL, 'Orlando', '32803',
      28.5556, -81.3484, NULL, 'estatesales_net', 'https://www.estatesales.net/FL/Orlando/32803/traditional/5143245', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'the-eclectic-collective-5143245');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-13', '09:00', '14:00', 0
      FROM sales s WHERE s.slug = 'the-eclectic-collective-5143245'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-13');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'oviedo-moving-sale-big-house-5130591', 'Oviedo Moving Sale - Big house!', 'estate', NULL, 'Oviedo', '32765',
      28.6651, -81.1963, NULL, 'estatesales_net', 'https://www.estatesales.net/FL/Oviedo/32765/traditional/5130591', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'oviedo-moving-sale-big-house-5130591');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-12', '08:00', '13:00', 0
      FROM sales s WHERE s.slug = 'oviedo-moving-sale-big-house-5130591'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-12');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-13', '08:00', '13:00', 0
      FROM sales s WHERE s.slug = 'oviedo-moving-sale-big-house-5130591'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-13');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-14', '08:00', '13:00', 0
      FROM sales s WHERE s.slug = 'oviedo-moving-sale-big-house-5130591'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-14');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'packed-home-stained-glass-fairy-lamp-vintage-quilts-nostalgi-5139180', 'Packed Home: Stained Glass, Fairy Lamp, Vintage Quilts & Nostalgia', 'estate', NULL, 'Winter Springs', '32708',
      28.6881, -81.27, NULL, 'estatesales_net', 'https://www.estatesales.net/FL/Winter%20Springs/32708/traditional/5139180', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'packed-home-stained-glass-fairy-lamp-vintage-quilts-nostalgi-5139180');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-12', '15:00', '18:00', 0
      FROM sales s WHERE s.slug = 'packed-home-stained-glass-fairy-lamp-vintage-quilts-nostalgi-5139180'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-12');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-13', '09:00', '13:00', 0
      FROM sales s WHERE s.slug = 'packed-home-stained-glass-fairy-lamp-vintage-quilts-nostalgi-5139180'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-13');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-14', '09:00', '13:00', 0
      FROM sales s WHERE s.slug = 'packed-home-stained-glass-fairy-lamp-vintage-quilts-nostalgi-5139180'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-14');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-15', '09:00', '13:00', 0
      FROM sales s WHERE s.slug = 'packed-home-stained-glass-fairy-lamp-vintage-quilts-nostalgi-5139180'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-15');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'berner-s-weekly-auction-5138292', 'Berner''s Weekly Auction', 'auction', NULL, 'DeLand', '32724',
      29.0065, -81.287, NULL, 'estatesales_net', 'https://www.estatesales.net/FL/Deland/32724/traditional/5138292', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'berner-s-weekly-auction-5138292');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-04', '17:30', '22:00', 0
      FROM sales s WHERE s.slug = 'berner-s-weekly-auction-5138292'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-04');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'something-for-everyone-in-pelican-bay-5124612', 'Something for everyone in Pelican Bay', 'estate', NULL, 'Daytona Beach', '32119',
      29.161, -81.0256, NULL, 'estatesales_net', 'https://www.estatesales.net/FL/Daytona%20Beach/32119/traditional/5124612', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'something-for-everyone-in-pelican-bay-5124612');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-06', '09:00', '15:00', 0
      FROM sales s WHERE s.slug = 'something-for-everyone-in-pelican-bay-5124612'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-06');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-07', '09:00', '15:00', 0
      FROM sales s WHERE s.slug = 'something-for-everyone-in-pelican-bay-5124612'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-07');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-08', '09:00', '15:00', 0
      FROM sales s WHERE s.slug = 'something-for-everyone-in-pelican-bay-5124612'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-08');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'sherrington-estate-sale-5136183', 'SHERRINGTON ESTATE SALE', 'estate', NULL, 'Ormond Beach', '32174',
      29.2922, -81.1614, NULL, 'estatesales_net', 'https://www.estatesales.net/FL/Ormond%20Beach/32174/traditional/5136183', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'sherrington-estate-sale-5136183');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-06', '08:00', '14:00', 0
      FROM sales s WHERE s.slug = 'sherrington-estate-sale-5136183'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-06');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-07', '08:00', '14:00', 0
      FROM sales s WHERE s.slug = 'sherrington-estate-sale-5136183'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-07');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'huge-estate-sale-disney-art-hallmark-lionel-trains-waterford-5130090', 'Huge Estate Sale! Disney, Art, Hallmark, Lionel Trains, Waterford, Holiday Décor & More!', 'estate', NULL, 'Ormond Beach', '32174',
      29.2922, -81.1614, NULL, 'estatesales_net', 'https://www.estatesales.net/FL/Ormond%20Beach/32174/traditional/5130090', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'huge-estate-sale-disney-art-hallmark-lionel-trains-waterford-5130090');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-06', '08:30', '14:00', 0
      FROM sales s WHERE s.slug = 'huge-estate-sale-disney-art-hallmark-lionel-trains-waterford-5130090'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-06');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-07', '08:30', '14:00', 0
      FROM sales s WHERE s.slug = 'huge-estate-sale-disney-art-hallmark-lionel-trains-waterford-5130090'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-07');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-08', '08:30', '14:00', 0
      FROM sales s WHERE s.slug = 'huge-estate-sale-disney-art-hallmark-lionel-trains-waterford-5130090'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-08');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'berner-s-weekly-auction-5143836', 'Berner''s Weekly Auction', 'auction', NULL, 'DeLand', '32724',
      29.0065, -81.287, NULL, 'estatesales_net', 'https://www.estatesales.net/FL/Deland/32724/traditional/5143836', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'berner-s-weekly-auction-5143836');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-11', '18:30', '22:00', 0
      FROM sales s WHERE s.slug = 'berner-s-weekly-auction-5143836'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-11');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'sweet-memories-estate-sales-invites-you-to-edgewater-5142384', 'Sweet Memories Estate Sales invites you to Edgewater!', 'estate', NULL, 'Edgewater', '32141',
      28.9288, -80.9191, NULL, 'estatesales_net', 'https://www.estatesales.net/FL/Edgewater/32141/traditional/5142384', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'sweet-memories-estate-sales-invites-you-to-edgewater-5142384');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-12', '09:00', '14:00', 0
      FROM sales s WHERE s.slug = 'sweet-memories-estate-sales-invites-you-to-edgewater-5142384'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-12');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-13', '09:00', '14:00', 0
      FROM sales s WHERE s.slug = 'sweet-memories-estate-sales-invites-you-to-edgewater-5142384'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-13');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-14', '09:00', '14:00', 0
      FROM sales s WHERE s.slug = 'sweet-memories-estate-sales-invites-you-to-edgewater-5142384'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-14');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-15', '09:00', '14:00', 0
      FROM sales s WHERE s.slug = 'sweet-memories-estate-sales-invites-you-to-edgewater-5142384'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-15');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'precious-finds-in-port-orange-5139969', 'Precious finds in Port Orange', 'estate', NULL, 'Port Orange', '32127',
      29.1085, -80.9757, NULL, 'estatesales_net', 'https://www.estatesales.net/FL/Port%20Orange/32127/traditional/5139969', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'precious-finds-in-port-orange-5139969');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-12', '09:00', '15:00', 0
      FROM sales s WHERE s.slug = 'precious-finds-in-port-orange-5139969'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-12');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-13', '09:00', '15:00', 0
      FROM sales s WHERE s.slug = 'precious-finds-in-port-orange-5139969'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-13');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-14', '09:00', '15:00', 0
      FROM sales s WHERE s.slug = 'precious-finds-in-port-orange-5139969'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-14');
INSERT INTO sales (slug, title, type, address, city, zip, lat, lng, payment_methods, source, source_url, status)
    SELECT 'a-fabulous-find-in-deland-5116830', 'A Fabulous Find in Deland', 'estate', NULL, 'DeLand', '32724',
      29.0572, -81.2256, NULL, 'estatesales_net', 'https://www.estatesales.net/FL/Deland/32724/traditional/5116830', 'upcoming'
    WHERE NOT EXISTS (SELECT 1 FROM sales WHERE slug = 'a-fabulous-find-in-deland-5116830');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-13', '09:00', '14:00', 0
      FROM sales s WHERE s.slug = 'a-fabulous-find-in-deland-5116830'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-13');
INSERT INTO sale_days (sale_id, date, start_time, end_time, discount_pct)
      SELECT s.id, '2026-11-14', '09:00', '14:00', 0
      FROM sales s WHERE s.slug = 'a-fabulous-find-in-deland-5116830'
      AND NOT EXISTS (SELECT 1 FROM sale_days sd WHERE sd.sale_id = s.id AND sd.date = '2026-11-14');
COMMIT;