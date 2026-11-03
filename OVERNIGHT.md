# Overnight — Nov 2, 2026 (local commits only, nothing pushed)

**Your to-dos needing logins → `MONDAY-ACTIONS.md`.** Architecture → `BACKEND.md`.

Shipped:
- Data layer with JSON ↔ Postgres auto-switch (`DATABASE_URL`); migrations + idempotent seed verified on local Postgres (PGlite)
- REST API (sales/venues/deal-rules/subscribers/admin import/CSV), validation, error handling, rate limit, timing-safe admin auth
- `/admin`: password gate, add/edit/delete sales, add/edit venues, paste-URL import from EstateSales.net JSON-LD, subscriber count + CSV, digest preview
- Add-to-Calendar `.ics` (RFC 5545, validated with a parser) + subscribable `/api/calendar` feed
- `/deals` (15 demo rules, flagged unverified), store pages show deal days, `/city/[city]` ×5, home city/type filters, keyless SVG map
- `/calendar`: 14-day grid of estate sales + deal days, links to iCal feed (added 2am)
- Branded 404 page with links back to sales, calendar, deals, map (added 2:40am)
- `/weekend`: Fri–Sun view of estate sales + deal days, in nav and sitemap (added 3am)
- `/sales`: full list of upcoming estate sales, soonest first; in sitemap (added 3:40am)
- `/today`: estate sales open today + today's deal days; in nav and sitemap (added 4am)
- Digest: signup → JSON/DB, email template, `/digest/preview`, Resend cron route (dry-run w/o key), one-click unsubscribe
- SEO: sitemap.xml, robots.txt, OG/Twitter meta, canonical URLs, Event JSON-LD; security headers
- 13 demo sales; `npm test` (6 passing), typecheck, lint, build all green; dev server on :3000

Blocked on your logins: GitHub push, Supabase, Vercel, MapTiler (interactive map), Resend (sending), real deal-day verification.
- `/city`: index of all cities with sale/store counts; in sitemap (added 5:40am)

## What's built (Nov 2, 2026 afternoon pass — local commits only)
- **Pages (all 200 on :3000):** `/`, `/today`, `/weekend`, `/calendar`, `/sales`, `/sales/[slug]`, `/stores`, `/stores/[slug]`, `/deals`, `/map`, `/city`, `/city/[city]`, `/search`, `/saved`, `/digest`, `/submit`, `/contact`, `/about`, `/faq`, `/privacy`, `/terms`, `/admin`, branded 404
- **Map:** MapLibre + MapTiler streets when `NEXT_PUBLIC_MAPTILER_KEY` is set, keyless SVG plot otherwise
- **Search** across sales + stores (all terms, case/accent-insensitive); nav search box on every page; WebSite SearchAction JSON-LD
- **Saved sales** (♡ on cards + sale pages, `/saved`, localStorage, no account); **share** (native share/copy, Facebook, X, email)
- **Submit a sale** → pending queue (honeypot + rate limit, validation, past-date check) → admin approve/reject
- **Contact** form → stored locally (`data/contact.json`, gitignored) → visible/deletable in admin
- **Admin:** sales add/edit/delete + **publish toggle** (drafts hidden from public pages, APIs, sitemap, feeds); venues add/edit/delete (cascades its deal rules); **deal rules** add/edit/delete + verified flag; **subscriber list** + remove + CSV; submissions queue; messages; HTML + server validation; confirm dialog on every destructive action; DB status banner
- **Data layer:** Postgres when reachable, otherwise automatic JSON fallback (6 s timeout, 60 s backoff) — build/runtime never break because the DB is down; serialized atomic JSON writes; `/api/health` reports DB status
- **Digest:** dry run verified end-to-end with `CRON_SECRET` (auth enforced, template renders, unsubscribe link present); sender defaults to `onboarding@resend.dev` until a domain is verified
- **SEO:** per-page title/description/canonical; generated OG images (site, each sale, each store via `next/og`); JSON-LD Event (ET offsets, absolute URLs), Store, FAQPage, WebSite; sitemap includes new pages
- **A11y/mobile:** skip link, visible focus ring, darker text/coral for contrast, labelled inputs/search, aria on filters/favorites/status, reduced-motion, wrapping layouts, loading skeleton, empty states everywhere
- **Tests:** 26 passing (validation, search, JSON-LD, ics, digest, importer, data layer incl. DB-down fallback + concurrency, API handlers incl. auth/ics/cron dry run); typecheck, lint, build green

## 2:45 PM pass
- Migration `drizzle/0002_*` + idempotent `scripts/supabase-0002.sql` (regenerate: `npx tsx scripts/gen-supabase-0002.ts`): `sales.published/description`, `deal_rules.rule_key/label/verified`, `submissions`, `contact_messages` (RLS on). Publish flag, deal-rule CRUD, submissions and contact now go to Postgres when reachable. Verified on PGlite: 0000→0002 apply cleanly; paste file runs twice without error and seeds rules
- DB timeout 1.5 s per query (`DB_TIMEOUT_MS`), retry after 5 min (`DB_BACKOFF_MS`); box warm-up wait gone
- Digest logo is now `public/logo-email.png`
- Mobile pass at 390px with Playwright → `screens/mobile/*.png` (22 pages). Fixed: /map list overflowed (453px), breadcrumb overlapping the sale header, small tap targets on map list. **Fixed a real bug:** MapLibre's worker failed to load under Next bundling (blank map tiles) — worker now served from `/public` (copied on install/dev/build)
- Known limit: if the DB fails mid-write, that write lands in local JSON (fine locally, ephemeral on Vercel)

## 3 PM feature pass
- **Route planner** `/plan`: saved sales → pick day/stops → nearest-neighbor + 2-opt driving order, per-leg miles, "start from my location", Google Maps multi-stop link (≤10 stops)
- **Map**: filters (day, type, city, show stores), 📍 Near me with distance-sorted list, markers update without reloading the map; MapLibre loads on idle (desktop) / on tap (phone)
- **PWA**: manifest + icons (192/512/maskable/apple), service worker (production only): network-first pages, offline page, saved sales + their .ics cached for offline; install prompt (Android) + iOS "Add to Home Screen" hint
- **Seed stores**: +16 real stores (14 Goodwill CFL + West Volusia & Greater Volusia Habitat ReStores) — address/phone/hours from the official sites (`sourceUrl` on each), coords from US Census geocoder (3 didn't geocode → not on map). ⚠ Existing "Goodwill Daytona Beach (Intl Speedway)" is **not** on goodwillcfl.org's list — flagged in its notes
- **Items to look for** tags + flip-value tips (generic know-how + eBay *sold* comps links); tags only derived from titles for demo sales; migration 0003
- **Admin**: CSV bulk import (template, preview, all-or-nothing import, confirm), **audit log** of every admin action incl. logins; migration 0004
- **Polish/perf**: active nav tab, navy gradients, focus/disabled states, ≥40px tap targets, metadata always in `<head>`. Lighthouse (prod, mobile): home 90/100/100/100, sale 99/100/100/100, map 96/100/100/100 (was 70)
- Supabase paste file `scripts/supabase-0002.sql` now covers 0002–0004 + venue seed + deal rules (verified twice on PGlite)

## 3–3:30 PM hardening + city pass
- **Nav**: active tab (aria-current, red underline), gradient panel heads
- **Security headers** (`src/lib/security.ts` → `next.config.ts`): CSP allowing only self + MapTiler (blob: workers for MapLibre; `unsafe-eval` only in dev), X-Frame-Options, Referrer-Policy, Permissions-Policy, COOP, HSTS (prod), no `X-Powered-By`. Verified in a prod build: /map renders MapLibre with zero CSP violations
- **Spam control**: one per-IP sliding-window limiter (bounded memory) for subscribe (5/min), submit + contact (5/hour); honeypot (`website`/`company`) on all three → fake success, nothing stored; API returns 429 + `Retry-After`
- **Validation caps** (`CAPS` in `validate.ts`): title/city/zip/slug/url/days/payment methods/description/message/area
- **Admin audit**: every admin server action starts with `guard()`, every write API checks `isAdminRequest` — enforced by a test that scans the source. Cron now fails closed in production if `CRON_SECRET` is missing
- **`/api/health`**: `mode` = `postgres` | `json-fallback` | `json`, plus read check, venue count, latency, which integrations are configured (booleans only, no secrets)
- **City pages** `/city/[slug]` for every city with data (14 now, incl. Orlando, Sanford, Winter Park): "This weekend" Fri–Sun panel (sales + that city's store deal days), upcoming sales, stores with deal days, nearby cities by distance, OG/Twitter meta, BreadcrumbList + ItemList JSON-LD; all in sitemap
- `NEXT_DIST_DIR=.next-build npm run build` builds without clobbering a running `next dev`
- Tests: 48 passing; typecheck, lint, build green
- Known: unknown slugs (`/city/nope`, `/sales/nope`) render the 404 page with `noindex` but HTTP 200 (root `loading.tsx` streams first) — pre-existing

## 4 PM pass (What's built)
- **JSON→Postgres audit:** publish flag, deal rules, submissions, contact messages, subscribers, audit log were already in Postgres. Gap found + fixed: store `sourceUrl` and org key were silently dropped in Postgres → migration `0005_venue_source_org` (+ `scripts/supabase-0002.sql` regenerated, now 0002–0005 with current deal rules). `tests/pg.test.ts` round-trips every store on real Postgres (`PG_TEST_URL`, verified on PGlite) and asserts nothing falls back to JSON
- **Mobile 390px:** `screens/mobile/*.png` refreshed (16 pages, 0 horizontal overflow). Store hours now 12-hour ("9 AM–9 PM", "Tue–Sat"), nav tab strip shows a scroll fade on phones, footer adds Orlando + "All cities"
- **Digest email:** PNG logo (`public/logo-email.png`, 516×96) referenced absolutely via `NEXT_PUBLIC_SITE_URL` (→ Vercel prod domain → localhost); 12-hour day labels, store names on deal days; cron refuses real sends while the site URL is localhost (dry run shows `logoUrl`/`siteUrlOk`)
- **SEO:** sitemap = live published sales + non-empty cities only; robots blocks `/digest/preview` + `/offline`, drops `Host`, disallows all on Vercel preview deploys; ended sales show a banner + noindex
- **Validation:** impossible dates and unparseable URLs rejected; venue caps/zip/coords/slug checks; store page can't crash on a bad source URL
- Tests: 60 passing (+4 Postgres tests that run with `PG_TEST_URL`); typecheck, lint, build green

## 5 PM pass
- **This weekend near you** (`/weekend`): ZIP (default **32127** Port Orange) + radius 10/25/50 mi/any, or 📍 *Use my location* (coords rounded, only in the URL). Sales + store deal days sorted closest first with miles; sales without coords fall back to their ZIP centroid; empty state links to the radius that reaches the nearest listing; unknown/non-FL ZIP shows a notice and uses 32127. ZIP centroids: `src/lib/zips.ts` (232 Central FL ZCTAs, US Census 2023 Gazetteer; regenerate with `scripts/gen-zips.mjs`)
- **Deal-day calendars:** `/api/calendar/deals` (`?venue=`, `?city=`, `?verified=1`, `?download=1`) — weekly `RRULE` events, all-day (timed rules like Berner's 6:30 PM auction get 2 h), stable UIDs so subscriptions update in place, unverified rules say so. `/api/calendar?deals=1` = sales + deals in one feed. Subscribe (webcal) / Google Calendar / .ics buttons on `/deals` and every store page with deal days; links on `/calendar`. Note: webcal/Google links use `NEXT_PUBLIC_SITE_URL`, so they only work for others once deployed
- **Printable route planner** (`/plan`): 🖨 *Print list* → clean black-on-white sheet (day, stop count, total miles, checkboxes, per-leg + running miles, sale URLs, notes lines; nav/footer/controls hidden) and *Copy as text* for texting the list
- Screens (390px, 0 overflow, no console errors): `screens/mobile/weekend*.png`, `deals.png`, `stores_goodwill-port-orange.png`, `plan_route.png`, `plan_print.png` (print media)
- Tests: 67 passing (+4 Postgres tests with `PG_TEST_URL`); typecheck, lint, build (`NEXT_DIST_DIR=.next-build`) green. Nothing pushed, no new logins needed

## 6 PM pass
- **404s:** verified on a production build (`next start` on :3100): `/nope`, `/sales/nope`, `/stores/nope`, `/city/nope` all return **HTTP 404** with the branded page + `noindex` (fixed earlier by 37d685e dropping root `loading.tsx`; the 3 PM "known" note is resolved). New test fails if a `loading.tsx` ever sits above a route that calls `notFound()`
- **JSON→Postgres audit:** every write (sales/publish, venues, deal rules, submissions, contact, subscribers, audit) already had a Postgres path. Remaining gap was *silent* JSON writes when the DB is down → now **strict writes**: with `DATABASE_URL` in production (or `DB_STRICT_WRITES=1`) a down DB gives a clean 503 instead of writing JSON that vanishes; reads still fall back. `/api/health` shows `db.strictWrites`. Local `next start` with the unreachable Supabase URL in `.env.local` will refuse writes — set `DB_STRICT_WRITES=0` there (dev server unaffected)
- **New this week** `/new` (in nav): sales first listed in the last 7 days, newest first, NEW pill + "listed N hr ago". `Sale.addedAt` ← DB `created_at` (no migration needed); JSON keeps first-save time across edits
- **Atom feed** `/feed.xml` (newest 30 upcoming listings, valid XML, `<link rel="alternate">` on every page)
- **Add to my route** (red button on sale pages): saves the sale and opens `/plan?day=<next sale day>` with that day preselected
- Screens 390px (0 overflow): `screens/mobile/new.png`, `sales_precious-finds-…png`, `plan_from-sale.png`, `home.png`, `404.png`
- Tests: 73 passing + 4 Postgres skips (`PG_TEST_URL`); typecheck, lint, build green. Nothing pushed, no logins needed

## 7 PM pass
- **JSON→Postgres:** re-audited, nothing left. Every `data/*.json` store (sales/publish flag, venues, deal rules, submissions, contact, subscribers, audit) has a table, a migration and a Postgres path that falls back to JSON. `tests/pg.test.ts` passes 5/5 against PGlite (`/tmp/pgl/node_modules/.bin/pglite-server -p 54329` → `PG_TEST_URL=postgres://postgres@127.0.0.1:54329/postgres`). Saved sales and routes stay in the browser on purpose (no accounts)
- **A11y:** axe (WCAG 2.1 AA + best-practice) is clean on 26 pages at 1280px and 390px. Fixed: the 404 page had no `<h1>`, and the two search forms had the same landmark name
- **Hardening:** added a root `global-error.tsx` with its own inline styles, so it still renders if the layout crashes. The error page now shows a reference digest and links to Contact. **Bug fixed:** `/deals` marked "today" based on the build date in the server's timezone, so it was frozen and wrong on Vercel (UTC). It now renders per request using the Eastern-time date. `nextDealDate` also works correctly on UTC servers. Saving favorites no longer throws in Safari private mode
- **Today at this store** panel on every store page: today's deals (biggest discount first), open/closed hours for today, and the next deal ("Tomorrow — …"). `/stores` gets a Today badge (on phones it sits under the store name). JSON for widgets/shortcuts: `GET /api/venues/<slug>/today`
- **Shareable saved lists:** *Share this list* on `/saved` makes a link like `/saved?list=a,b,c` (native share or copy). Opening it shows a "Shared with you" panel with *Save all to my list* and *Plan a route*. Slugs are cleaned and deduped, the list is capped at 50, and ended sales are counted. Nothing is stored on the server
- Screens (390px, 0 overflow): `stores.png`, `stores_goodwill-port-orange.png`, `stores_berners-auction-deland.png`, `deals.png`, `saved_shared*.png`, `404.png`
- Tests: 80 passing, 4 Postgres skips (`PG_TEST_URL`). Typecheck, lint and build (`NEXT_DIST_DIR=.next-build`) green. Nothing pushed, no new logins needed
