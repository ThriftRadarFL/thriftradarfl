
## 2026-11-03 ~12:15 AM ET — Keel QA fixes + Minte store data
- P1 sitemap now `force-dynamic` from live data (no dead demo sale / removed store URLs).
- P1 map: tapping a pin opens a popup (name, dates/hours, "View details →") instead of navigating; pins are a clustered MapLibre GeoJSON source (bigger 11px-radius dots, tap a cluster to zoom).
- P2 390px overflow on home and /city/orlando came from long sale titles in grid cards (not the nav): `.panel` is now `min-w-0` + `overflow-wrap:anywhere`; nav strip also scrolls within itself.
- P2 /plan defaults to "Any day"; search loading is a results-shaped skeleton; saved list skeleton.
- P3 global ≥40px min height for selects/inputs and checkbox labels; aria-labels on share, directions, call and compare links and FAQ links.
- Data: store-hours-addresses-nov3.csv merged. Goodwill Casselberry/Oviedo/Apopka pinned (OSM) and open daily 9–9; SA #4 pinned; hours copied from notes into hoursJson for 20 stores (West Volusia ReStore conflict noted). Savers Orlando / SVdP Longwood rows skipped (not venues). Two stores still have no hours (City Thrift Semoran, SA #2/#4 unknown).
- Price tracker + calculator: est. thrift cost (low confidence) from resale-margins.csv for 17 items; calculator prefills buy cost with the midpoint, labelled.

## 2026-11-03 ~12:11 AM ET — Grok Bot overnight session (keyword alerts)
- Live sweep (no admin writes): 1,318 pass / 3 fail → fixed: duplicate <title> on recurring Berner's weekly auctions (sale titles now append first date); sweep now accepts Vercel edge 403 for `/stores/../../etc/passwd`. Post-deploy live sweep: 1,319 pass, 0 fail, 107 sitemap URLs. data:check 0 errors, 4 warnings (Sharing Center no coords; City Thrift Semoran + SA #2/#4 no hours).
- Feature: estate-sale keyword alerts. /digest form takes up to 5 comma-separated keywords (stored in existing `subscribers.interests`, no migration; re-subscribing updates them). New daily cron `/api/cron/alerts` (12:00 UTC, CRON_SECRET, dry-run without RESEND_API_KEY or ?dry=1, ?hours=) emails sales first listed in the last 24h whose title/description/tags mention a keyword (whole word, simple plurals). Weekly digest adds a per-subscriber "Your keyword matches" block. Matches use listing text only.
- Data: estate-sales-new-nov3.csv is header-only (nothing to merge); other asset CSVs already merged.
- Tests 125 (121 pass, 4 PG skipped). Deployed to https://thriftradarfl.vercel.app and checked live.

## 2026-11-03 ~12:45 AM ET — Keel QA round 2
- 390px overflow on sale pages was the PageHead h1 (slash-joined titles like "Vintage/MCM/Antiques/…"), not the nav: h1/h2 now `overflow-wrap:anywhere`, `main` min-w-0. Headless scan of all 18 sale + 44 store pages + key pages at 390px: scrollWidth 390 everywhere.
- Store badge now "Today 9 AM–9 PM" + "Open now"/"Closed now" computed in America/New_York (store page, compare, embed).
- Unverified notes deduped (`cleanNotes` applied to all seed venues, so future merges can't stack warnings).
- Map: list beside/below the map mirrors pins with a 📍 "Show on map" button per row (opens the popup and focuses its link); zoom controls 40px; planner checkboxes larger.
- Hours: City Thrift Semoran Mon–Sat 9–9, Sun 10–7; Salvation Army #2 and #4 Mon–Sat 10–6, Sun closed (unverified). Sharing Center Longwood still unpinned (no OSM/Census match), flagged "Not on the map yet".

## 2026-11-03 ~1:20 AM ET — Grok Bot overnight session (color-tag board)
- Live sweep before: 1,319 pass / 0 fail. Local admin sweep (scratch JSON) found a real bug: `PUT /api/sales/{slug}` silently ignored `published:false` (sale stayed public; parseSale drops the flag) and edits could re-publish. Fixed: PUT honours/keeps `published`, admins can edit/delete unpublished sales via API, POST 409s on a hidden slug too. Local sweep now 1,346 pass / 0 fail; admin UI sweep OK.
- Feature: **Color Tag Board** (`/color-tags`, nav "Color Tags"). Shoppers report store + tag color + optional % off + short note (no links; honeypot; 6/hr/IP). Reports are `pending` until approved in `/admin#tags` (approve / reject / unapprove / delete, audited). Approved reports show for the Sun–Sat week (ET) they were made in, grouped by store+color with report counts; % shown only if all reports agree (never a merged/invented number); everything labelled "crowdsourced · unverified". Store pages get a "Color tag this week · crowdsourced" panel; `/deals` links to the board; `GET /api/color-tags` (+ /developers docs).
- Storage: new table `color_tag_reports` (drizzle/0006, also in scripts/supabase-0002.sql + run-me). Box can't reach Postgres directly (HTTP proxy), so the app creates the table itself (`CREATE TABLE IF NOT EXISTS`) on the first 42P01 and retries; tag-table errors don't flip the whole site to JSON fallback. Verified against pglite-server (PG test passes); prod /api/color-tags returns 200 with health still `postgres`.
- Data: store-hours-3-nov3.csv already merged (City Thrift Semoran Mon–Sat 9–9 / Sun 10–7; SA #2/#4 Mon–Sat 10–6, Sun closed) — nothing new in thriftradarfl-assets.
- Tests 140 (135 pass, 5 PG skipped without PG_TEST_URL; all 6 PG pass with pglite). Deployed; live sweep after: 1,329 pass, 0 fail, 108 sitemap URLs.
