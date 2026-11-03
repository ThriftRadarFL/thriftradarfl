
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
