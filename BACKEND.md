# ThriftRadarFL — Backend Architecture

## Data layer (`src/lib/data.ts`) — one API, two drivers
- **JSON driver (default):** `data/sales.json`, `data/venues.json`, `data/digest-subscribers.json` (subscribers gitignored). Writes are serialized + atomic (tmp + rename). Regenerate from seed: `npm run data:export`.
- **Postgres driver (`src/lib/db-store.ts`):** auto-enabled when `DATABASE_URL` is set. Same function signatures (getSales/getSale/upsertSale/deleteSale/getVenues/upsertVenue/add/list/removeSubscriber). Upsert sale = transaction (sale row + replace sale_days).
- Verified offline against a local PGlite Postgres: `drizzle-kit migrate` → `npm run db:seed` (idempotent) → `npm run data:smoke` all pass.
- Note: on Vercel the filesystem is read-only → JSON mode is read-only there; set `DATABASE_URL` for writes.

## Schema (`src/db/schema.ts`, migrations in `drizzle/`)
organizations → venues (lat/lng, hours jsonb, active, source_url, org_key — 0005) → deal_rules (kind enum, day_of_week, start_time, discount_pct, verified_at, source)
sales (slug unique, type enum incl. thrift/outlet_bins, city/zip/lat/lng, payment_methods[], source, source_url, status, featured_until) → sale_days (date, start/end, discount_pct)
tags ↔ sale_tags; subscribers (email unique, zip, area, interests[], tier).
Deal rules source of truth for now: `src/lib/deal-rules.ts` (seeded into DB; UNVERIFIED demo except Berner's Wed auction).

## Auth
- `ADMIN_PASSWORD` (env). `/admin` login sets httpOnly sha256 token cookie (secure in prod). APIs accept that cookie or `Authorization: Bearer <ADMIN_PASSWORD>`. Timing-safe comparisons, 800ms delay on failed login.
- Later: Supabase Auth magic link + RLS (public read sales/venues, service-role writes).

## API (all JSON errors `{error, details?}`; body cap 32KB; `src/lib/api.ts`)
| Method | Route | Auth | Notes |
|---|---|---|---|
| GET | `/api/health` | – | `mode` postgres/json-fallback/json, readOk, venues, latencyMs, *Configured booleans |
| GET | `/api/sales?city=&type=&upcoming=1&from=YYYY-MM-DD` | – | |
| POST | `/api/sales` | admin | 201; 409 if slug exists |
| GET/PUT/DELETE | `/api/sales/[slug]` | write=admin | PUT = partial merge + revalidate; 404s |
| GET/POST | `/api/venues?city=` | POST admin | |
| GET/PUT | `/api/venues/[slug]` | PUT admin | GET includes dealRules |
| GET | `/api/deal-rules?venue=` | – | |
| POST | `/api/subscribers` | – | rate-limited 5/min/IP (429 + Retry-After), honeypot `company`/`website` |
| GET | `/api/subscribers` | admin | JSON list |
| GET | `/api/admin/subscribers` | admin | CSV export |
| POST | `/api/admin/import` | admin | `{url}` → draft Sale from listing JSON-LD (not saved) |
| GET | `/api/ics/[slug]` | – | RFC 5545 (VTIMEZONE, folding, escaping), download |
| GET | `/api/calendar?city=&deals=1` | – | subscribable feed of upcoming sales (`deals=1` adds weekly deal days) |
| GET | `/api/calendar/deals?venue=&city=&verified=1&download=1` | – | weekly store deal days as RRULE events (stable UIDs); unknown venue 404 |
| GET | `/api/cron/digest?dry=1&from=` | `CRON_SECRET` bearer | dry-run without RESEND_API_KEY |
| GET/POST | `/api/unsubscribe?e=&t=` | HMAC token | one-click (RFC 8058) |
Pages: `/`, `/?city=&type=`, `/map` (keyless SVG plot), `/stores`, `/stores/[slug]`, `/sales/[slug]` (JSON-LD Event), `/deals`, `/city/[city]` ×5, `/digest`, `/digest/preview`, `/admin`, `/sitemap.xml`, `/robots.txt`.

## Email
`src/lib/digest.ts` builds subject/html/text (top 10 sales in next 10 days by discount + 50%-off deal days). `vercel.json` cron: Thursdays 11:00 UTC (7am EDT / 6am EST). Resend batch API (100/call), List-Unsubscribe headers. Needs `RESEND_API_KEY`, `DIGEST_FROM` on a verified domain, `CRON_SECRET`.

## Maps
Now: keyless SVG overview + city lists. Next: MapLibre GL + MapTiler tiles (`NEXT_PUBLIC_MAPTILER_KEY`), geocode on admin save.

## Import / scraping policy
Admin-triggered, one URL at a time, host allowlist (estatesales.net/.org, auctionzip, hibid), reads only schema.org JSON-LD, 10s timeout, identifies UA, never rehosts images, always keeps `sourceUrl` + "Original Listing" link. No crawlers/bulk scraping. Prefer organizer submissions.

## Security
`src/lib/security.ts`: CSP (self + MapTiler, blob: workers), XFO, Referrer-Policy, Permissions-Policy, COOP, HSTS in prod — applied in `next.config.ts`. Per-IP limiter (subscribe 5/min, submit/contact 5/h) + honeypot on all public forms. `/admin` + `/api/` disallowed in robots; admin noindex. Admin-guard coverage enforced by `tests/security.test.ts`.

## Tests
- **JSON→Postgres parity (audited 2026-11-02 4 PM):** publish flag, tags, description, deal rules, submissions, contact messages, subscribers, audit log and venue source_url/org key all persist in Postgres; JSON is fallback only. `tests/pg.test.ts` round-trips every store against a real Postgres when `PG_TEST_URL` is set (verified on PGlite socket server: `npx pglite-server -p 54329 -m 10`) and asserts nothing hits JSON.
`npm test` (node:test: validation, ics, digest, importer fixture), `npm run check` (typecheck + tests + lint).

## Phased rollout
1. ✅ JSON layer, password admin, APIs, ics, SEO, digest builder (offline).
2. Supabase Postgres: set `DATABASE_URL` → `npm run db:migrate && npm run db:seed` (code switches automatically).
3. Deploy Vercel (env vars), set `NEXT_PUBLIC_SITE_URL`.
4. Resend + cron live. 5. MapTiler map. 6. Supabase Auth replaces ADMIN_PASSWORD. 7. Organizer submission form + moderation queue.
