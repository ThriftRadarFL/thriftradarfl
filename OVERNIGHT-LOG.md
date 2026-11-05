
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

## 2026-11-03 ~2 AM ET — Grok Bot overnight session (store report cards + flip of the week)
- Live sweep before: 1,329 pass / 0 fail — no bugs found. 390px headless screenshots of /color-tags, /digest, a store page and the new pages look clean (new report-card index uses a card list on mobile instead of a scrolling table).
- Feature: **Store report cards**. Each store page has an "Info report card" panel (`#report-card`); `/stores/report-cards` lists all stores with grade + city filters; `GET /api/report-cards?venue=&grade=` (+ /developers docs). Grades only how complete/fresh *our info* is (explicitly "not the store's quality"): listing confirmed (no "UNVERIFIED listing"), hours on file (partial if directory/aggregator/unverified), deal-day info (verified rule = pass, unverified only = partial, n/a for auction houses), map pin (partial if approximate), valid phone, source freshness from the latest "checked YYYY-MM-DD" in notes (≤30d pass, ≤90d partial). Pass 2 / partial 1 / missing 0 → A ≥90, B ≥75, C ≥60, D ≥40. Color-tag reports this week shown as crowdsourced, never graded. Current: A 5, B 27, C 2, D 10, F 0 (most Bs are just missing deal-day rules).
- Feature: **Flip of the Week** (`/flip-of-the-week`, linked from /prices). Rotates each Sun–Sat ET week through resale-prices items that have a sourced eBay sold median AND an est. thrift-cost range and still profit at the top of that range (13 of 20 items). Shows est. profit range after the calculator's default fees (13.25% + $0.40, buyer pays shipping), all labelled estimates, plus 5 runner-ups. This week: Le Creuset / Lodge cast iron.
- Sweep gained report-card checks (store panel, API shape, 404 for unknown store, filters). Data: no new files in thriftradarfl-assets.
- Tests 153 (148 pass, 5 PG skipped). Deployed; live sweep after: 1,359 pass, 0 fail, 110 sitemap URLs; prod /api/report-cards matches local grades (Postgres mode).
- Next up: bins restock heatmap, 90-day price filter (still not started). Adding verified deal-day rules for Goodwill CFL stores would lift ~15 stores from B to A.

## 2026-11-04 ~11:55 PM ET — Grok Bot overnight session (bins heatmap + 90-day price window)
- Bug crawl: venue `PUT /api/venues/{slug}` overwrote structured hours with `{daily: <first value>}` on every edit (e.g. "Mon–Sat 9:30–5, Sun closed" would become "daily 9:30–5"). Fixed: existing hoursJson kept unless the body sends hours. /prices table letter-wrapped at 390px — now scrolls horizontally with a min width.
- Feature: **Bins & Restock Heatmap** (`/bins`, nav "Bins", linked from /deals and every store page; sitemap). Weekday × store grid built only from existing deal rules of kind restock / bins_rotation / dollar_day / color_tag (verified = 2, unverified = 1); all outlet-bins stores always listed, blank = "nothing on file". Busiest-days strip with today outlined. Every entry labelled ✓ sourced or UNVERIFIED (currently all bins/restock entries are unverified). Admins fill it by adding deal rules in /admin. Mobile shows dots per day + a text list.
- Feature: **90-day price filter** on `/prices` (`?window=90` = whole sold range inside 90 days, `?window=90any` = any sales inside 90 days) + recency badge per item (Recent / Mixed with % of date span inside 90 days / Stale). `GET /api/prices?window=` (+ /developers docs). Medians are never recomputed — filter uses only each item's sourced date range. Today: 8 of 20 fully within 90 days, 20 of 20 with some.
- Data: Sharing Center Longwood pinned at 28.7050, -81.3275 (approx coords from 400 N US 17-92, ~200 numbers south of the real 600 N address, from Minte) — notes say "Map pin approximate and unverified"; report card shows pin as partial. Synced to prod via admin API (hours preserved). No new files in thriftradarfl-assets since Nov 3.
- Tests 156 (151 pass, 5 PG skipped). data:check 0 errors, 0 warnings. Commit 3330f25 deployed; live sweep: 1,369 pass, 0 fail, 111 sitemap URLs; /api/health postgres.

## 2026-11-04 night — verified Goodwill CFL rules
- Verified from goodwillcfl.org/shop: Color of the Week (Sun refresh, 50%), Seniors 55+ 10% Mon, Military 10% Wed. Added verified rules to 13 more GICF retail stores (39 rules, synced to prod via admin API); Port Orange senior rule gets discountPct 10 in seed. Outlets + Winter Park Boutique left unverified/untouched.
- Live crawl: /, /bins, /prices, /map, /stores all 200; /bins already has empty states. No new files in thriftradarfl-assets.
- Bug fixed: page lambdas fell back to stale seed JSON for 5 min after one cold-start DB timeout (1.5s), so admin edits/new rules didn't show on pages (sweep: 4 read-after-write fails). DB timeout → 4s, backoff → 30s. Sweep now restores Port Orange notes instead of leaving "Sweep note" on prod (restored).
- /feed.xml now references /feed.xsl (BoA-styled, viewport meta, overflow-wrap) so phones render a readable, wrapping list instead of raw XML; feed readers unaffected. XSLT verified on live feed (18 entries).
- Open: live sweep 1,381 pass / 4 fail — read-after-write checks fail only under sweep load (manual probe: new rule visible on /deals within 5s, every poll). Likely DB pool/timeouts under concurrency → seed fallback on some instances; needs pool-size/connection investigation next session.

## 2026-11-05 ~12:30 AM ET — Grok Bot overnight session (read-after-write sweep fails)
- Root cause (from Vercel logs): page lambdas logged `[data] database unreachable (db timeout)` on cold/warm instances (cold Supabase pooler connects >4s, and a warm instance's pooled sockets could hang on every query). One timeout put the instance into seed-JSON fallback for the backoff window, so pages on that instance showed stale seed data (no new sale → 404, old title, no new rule, old notes). /api/health ran on a different, healthy instance, so it always said postgres. Not load-flaky: deterministic once an instance went bad.
- Fixes: 29670f6 (retry read on fresh pool, /sales/[slug] force-dynamic), eb02656 (longer retry, backoff only after 2 consecutive failures; refused/unknown-host/auth back off immediately). A concurrent agent session also pushed ff94ab7 (reset pool on every timeout, max:1, targeted getSale/getVenue) and f2f1f16 (timeout 8s, connect 5s).
- Live sweep on ff94ab7: 1,373 pass, 0 fail. A later run overlapped with the other session's sweep and failed on leftover state (`sweep-test-sale` 409 on create / 404 on delete; Port Orange notes left as "Sweep note"). Notes restored from seed via admin API (hours kept).
- Remaining sweep hazards: GET /api/venues/{slug} and /api/deal-rules send `cache-control: public, max-age=60`, so the sweep's "origNotes" read can be a stale CDN copy (likely how "Sweep note" got stuck). Sweep should read with a cache-busting query / admin auth, and two sweeps must not run at once (fixed slug `sweep-test-sale`).
- Data: Port Orange senior Monday rule synced to prod with discountPct 10 (verified Goodwill CFL rule, matches seed). Winter Park Boutique untouched.
- Tests 151 pass / 5 PG skipped.

## 2026-11-05 ~12:40 AM ET — cleanup: CDN stale notes, unique sweep slug, admin sale lookup
- Single-owner session (Nov 5 overnight routine paused). Prior commits on master: ff94ab7/f2f1f16 + 29670f6/eb02656/b855f3d.
- **CDN stale notes:** GET `/api/venues/{slug}` and `/api/deal-rules` now return `Cache-Control: no-store` for admin Bearer/cookie requests; public GETs keep `cachedJson` (max-age=60 / s-maxage=300). Sweep captures + verifies Port Orange notes via admin GET so restore cannot latch onto a CDN "Sweep note".
- **Parallel sweep 409:** admin write slug is now `sweep-test-sale-<time>-<rand>` per run (duplicate POST still checked against the same slug).
- **DELETE/PUT 404 on real Postgres sales:** admin write paths use new `getSaleAdmin` (targeted `dbGetSale`, includes unpublished). No more `getAllSales()` full-table read that could seed-fallback and 404. Strict/prod: DB-down → 503 instead of a false miss. POST 409 check uses the same helper.
- Leftover cleanup: prod `sweep-test-sale` already gone (DELETE 404); Port Orange notes already real Goodwill CFL text (not "Sweep note").
- Tests: 152 pass / 5 PG skipped. Deployed b931874 to https://thriftradarfl.vercel.app.
- Live verify: admin venue/deal-rules GET → `no-store`; public still `public, max-age=60`. Port Orange notes OK (not Sweep note). Fixed-slug `sweep-test-sale` DELETE 404 (already gone).
- **ONE clean live sweep: 1,377 pass / 0 fail**, 110 sitemap URLs. PASS.

## 2026-11-05 ~12:00–12:35 AM ET — Grok Bot overnight session (read-after-write + Berner)
- Confirmed 29670f6 (+ follow-ups) deployed; live `/api/health` postgres, 44 venues.
- Assets: thriftradarfl-assets unchanged since Nov 3 (nothing to merge). Sharing Center Longwood pin left as approx.
- Bug: live sweep still 1,369/4 on read-after-write under sitemap load (seed fallback after DB timeout). Shipped: always `resetDb()` before retrying timed-out reads; default timeout 8s / connect_timeout 5s; hard backoff on ECONNREFUSED/ENOTFOUND/auth; `dbGetSale`/`dbGetVenue` targeted lookups; in-flight dedupe so `generateMetadata`+page share one query; pool `max:3` (max:1 raced with parallel RSC fetches and caused 8–24s pages). Sweep now polls the four admin visibility checks. Post-deploy live sweep: **1,373 pass, 0 fail**, 110 sitemap URLs.
- Polish: Berner's Auction phone `(386) 738-8848` + source `bernersauction.com` (checked 2026-11-05) synced via admin API — report card C→A (grades now A19 B15 C0 D10). `/bins` `force-dynamic`. Habitat ReStore sites only point to Facebook for weekly specials — no verified deal-day rules added.
- Tests 156 (151 pass, 5 PG skipped). data:check 0 errors / 0 warnings. Commits ff94ab7..9ed02ac pushed + prod deployed.
- Next: homepage still intermittently ~8s on cold isolates (Promise.all sales+venues+rules); further pooler/timeout tuning. Verified deal rules for Habitat/Salvation Army only if their own sites publish them.

## 2026-11-05 ~1:00 AM ET — Grok Bot overnight session (Goodwill CFL explainer)
- Assets: thriftradarfl-assets unchanged since Nov 3 (nothing to merge). Winter Park Boutique still unverified — no invented rules.
- Bug/polish: Port Orange senior deal label aligned to verified **Seniors 55+ 10% off** (was “ask in store for amount”); seed + SQL + prod rule id swapped via admin API. `/bins` empty cells + admin how-to for `restock` / `bins_rotation` / `dollar_day` kinds.
- Feature: **Goodwill CFL deals** (`/goodwill-cfl`, nav “GWCFL”, sitemap). Explains Color of the Week (50% most tagged textiles/shoes/wares, refreshes Sundays, color in-store only), seniors 55+ 10% Mondays, military 10% Wednesdays, no stacking — **only** facts from https://www.goodwillcfl.org/shop/. Lists retail stores that already have a verified Sunday color_tag rule; separately lists outlets + Winter Park Boutique as **not confirmed**. Links from /deals, /color-tags, GWCFL store pages, FAQ.
- Admin UX: one-click **verify / unverify** on each deal rule (no re-open form); rules list shows kind + restock→/bins hint.
- Tests 160 (155 pass, 5 PG skipped). data:check 0 errors / 0 warnings. Commit b0ded30 pushed + prod deployed.
- **ONE live sweep: 1,391 pass / 0 fail**, 111 sitemap URLs. PASS.

## 2026-11-05 ~1:00 AM ET — Grok Bot overnight session (/deals GWCFL collapse)
- Assets: thriftradarfl-assets unchanged since Nov 3 (nothing to merge). Winter Park Boutique + Pine Hills/Taft outlets still unconfirmed — no invented rules.
- Bug crawl: no new live bugs (prior sweep 1,391/0). Forms already have Notice empty/error states; skipped inventing form work.
- Feature: **Clearer /deals deal-day display**. Verified Goodwill CFL chain offers (Color of the Week / Seniors 55+ / Military) collapse into **one pill per weekday** ("Goodwill CFL · … · N retail stores · ✓ sourced") instead of ~14 identical pills. Today panel shows the active chain offer. Covered GWCFL retail listed in their own section with compact chain summary + any store-only extras (e.g. Port Orange restock). Outlets, boutique, and non-GWCFL rules stay individual. OpenGraph + `/deals/opengraph-image`.
- Helpers: `gwcflChainOfferKey` / `isGwcflChainRule` / `collapseDayRules` in `src/lib/goodwill-cfl.ts` (collapse only when ≥2 covered stores share a verified chain offer).
- Tests 163 (158 pass, 5 PG skipped). data:check 0 errors / 0 warnings. Commit a068d5b pushed + prod deployed.
- **ONE live sweep: 1,391 pass / 0 fail**, 111 sitemap URLs. PASS.

## 2026-11-05 ~1:00–1:15 AM ET — Grok Bot overnight session (crawl + 404 polish)
- Assets: thriftradarfl-assets unchanged since Nov 3 (nothing to merge). Winter Park Boutique + outlets still unconfirmed.
- Live crawl: all main pages, /prices window filters, /feed.xml (valid Atom), sitemap, 404 routes — all 200/404 as expected, ~0.3–0.9s. No bugs found.
- Polish: 404 page now also links Goodwill CFL deals, bins & outlets, and all stores.
- Tests 163 (158 pass, 5 PG skipped). Commit 769e382 pushed + prod deployed.
- **ONE live sweep: 1,391 pass / 0 fail**, 111 sitemap URLs. PASS.

## 2026-11-05 ~1:10–1:30 AM ET — Grok Bot overnight session (390px verification, no code changes)
- Assets: thriftradarfl-assets unchanged since Nov 3 (nothing to merge).
- Headless 390px checks on live (Playwright): /map clusters render, 61/62 pins, store pin popup opens with hours + "View details"; /digest email field rejects invalid input in the browser and `POST /api/subscribers` with a bad email returns 400 (no real signups made); /color-tags empty submit is blocked by required store/color fields; /admin wrong password shows "Wrong password.", real login → dashboard (no horizontal overflow) → logout works, and no data was changed; `/api/subscribers` 401 without auth / 200 with Bearer; /bins, /goodwill-cfl, /prices?window=90 and 90any all return 200 with no overflow and no JS page errors.
- Nothing was broken, so this session made no feature changes. The product looks finished for now.
- Tests 163 (158 pass, 5 PG skipped). data:check 0 errors / 0 warnings.
- **ONE live sweep: 1,371 pass / 0 fail**, 111 sitemap URLs. PASS. The 20 admin write checks were skipped because ADMIN_PASSWORD wasn't exported to the sweep; admin login/logout was checked by hand above instead.
- No deploy, because only the log changed.

## 2026-11-05 ~1:15–1:45 AM ET — Grok Bot overnight session (/stores Open now filter)
- Assets: thriftradarfl-assets unchanged since Nov 3 (nothing to merge). Winter Park Boutique + GWCFL outlets still unconfirmed.
- Feature: **/stores "Open now (N)" filter** (`/stores?open=1`) using existing hoursJson + `openState` in Eastern time. Shows "N open right now · Show all", plus an empty state linking all stores and /deals when nothing is open (verified live at ~1:30 AM ET: 0 open). No new data invented.
- Tests 163 (158 pass, 5 PG skipped). tsc + eslint clean. Commit 238faef pushed + prod deployed.
- **Full live sweep WITH ADMIN_PASSWORD (admin write checks included): 1,391 pass / 0 fail**, 111 sitemap URLs, before and after deploy. Sweep test sale/rule deleted and Port Orange notes restored by the sweep itself.

## 2026-11-05 ~1:30–1:40 AM ET — Grok Bot overnight session (verify only, no code changes)
- Live checks: /api/health, /deals, /goodwill-cfl, /stores?open=1, /bins all 200 in 0.45–0.70s.
- No bugs found, and no polish was worth shipping without making things up, so no code changed.
- Assets: thriftradarfl-assets unchanged since Nov 3 (nothing to merge). Winter Park Boutique + GWCFL outlets still unconfirmed.
- Tests (npm test): 158 pass, 5 PG skipped, 0 fail.
- **Full live sweep WITH ADMIN_PASSWORD (admin write checks included): 1,391 pass / 0 fail**, 111 sitemap URLs.
- No deploy, because only the log changed.

## 2026-11-05 1:36 PM ET — Grok Bot overnight session (motion polish + Minte Nov 5 data)
- **Motion polish (CSS-first, late-2000s BoA feel):** panel/card enter fade+6px rise (~180ms, light stagger); glossy red CTA + `.btn-red` hover lift/shine + active press; `.tile` + nav-tab hover (no layout jump); BoA shimmer skeletons (replaced `animate-pulse`); homepage hero + Today panel entrance; map list-row focus highlight + MapLibre `.trfl-popup` soft enter. `prefers-reduced-motion: reduce` still disables animations/transitions. Tests in `tests/motion-polish.test.ts`.
- **Minte data merge (no invented deal rules):**
  - Sharing Center Longwood pin → **28.706466, -81.327064** (Google Maps address pin CSV); notes updated; synced via admin API.
  - GWCFL Boutique/Pine Hills/Taft hours already matched CSV; Color/Senior/Military stay **UNKNOWN** — `/goodwill-cfl` still lists them unconfirmed; no new rules.
  - SA Casselberry (#4) + W Colonial → Mon–Sat **10–6** (satruck); Habitat open ReStores annotated **no deal days published**; Sanford Habitat flagged **CLOSED** in notes; Orlando/Osceola ReStores not in seed (closed 2019). RESEARCH-DEALDAYS.md updated.
- **390px:** live Playwright overflow check on /, /today, /map, /stores, /deals, /goodwill-cfl, /sales, /weekend, Sharing Center store page — all scrollWidth 390, no overflow from transforms.
- Tests 168 (163 pass, 5 PG skipped). Commits: e829090 (motion), e36471e (Sharing Center), 94f4470 (SA/Habitat notes), 8435ded (test fix). Deployed prod https://thriftradarfl.vercel.app.
- **ONE live sweep WITH ADMIN_PASSWORD: 1,391 pass / 0 fail**, 111 sitemap URLs. PASS.

## 2026-11-05 ~1:40–2:20 PM ET — Grok Bot (Keel P1 + P3, Minte Nov 5 merge)
- **P1 root cause:** `viaDb` read timeout was 8s with a 16s retry, so a hung pooled socket held TTFB 8–24s before falling back. The city and store pages are `force-dynamic` and call getSales/getVenues/getDealRules twice (generateMetadata + page), and those reads weren't deduped or cached, so up to 6 queries queued on a max:3 pool. **Fix:** read timeout 2.5s (+4s retry on a fresh pool). Sales/venues/rules now go through in-flight dedupe plus a last-good cache: the DB is always asked first, but if it hasn't answered in 1.2s, the instance serves its last-good value while the query finishes in the background. Writes stay visible on every instance. (A first try with a 60s TTL cache broke the sweep's "new rule on /deals" check across instances, so it was replaced.)
- **P3:** /bins store links and /prices window filters now `min-h-[40px]`.
- **Minte Nov 5:** added 2 estatesales.org sales (9 Deerwood St Palm Coast Nov 6–7 9–1; 4701 Brenda Dr Orlando Nov 7 8–1). Pins are ZIP centers; no prices. Sharing Center pin set to ArcGIS Subaddress 28.706418, -81.327891. West Volusia ReStore set to Tue–Sat 8:30–5, Sun–Mon closed (the Mon–Sat listing is the admin office). The other CSV rows already matched. Synced via admin API (201/201/200/200).
- Commits 54556e8, 4c46e3a, 0a83c1a; deployed prod. Tests 163 pass / 5 skipped / 0 fail.
- Live /city/orlando TTFB: 0.89, 0.41, 0.38, 0.36, 0.38s. Store page 0.40s.
- **Live sweep WITH ADMIN_PASSWORD: 1,415 pass / 0 fail**, 113 sitemap URLs.

## 2026-11-05 ~2:07 PM ET — Grok Bot (Minte estate-sales batch2: 408 Knot Way)
- Added 1 estatesales.org sale from thriftradarfl-assets/estate-sales-nov5-batch2.csv:
  - **408 Knot Way, DeLand (Volusia)** — starts Fri Nov 6 8:30 AM ET. Company not shown; end date/hours not shown (did not invent a second day or company). Schema requires an end time → **17:00 placeholder** with description disclaimer (not from listing). Pin **29.0230, -81.2714** from OSM Nominatim house node (street-precise, not approximate). No prices.
  - slug: `estate-sale-408-knot-way-deland-2472137`
  - live: https://thriftradarfl.vercel.app/sales/estate-sale-408-knot-way-deland-2472137
- GWCFL Color of the Week: asset still says color not shown — left as in-store; no color invented.
- Synced via admin API POST `/api/sales` → 201. data:check 0 errors / 0 warnings. Test count 20→21.
- Commit 292f137 pushed; prod deployed (NEXT_DIST_DIR=.next-build). Live sale page **200**.
