# ThriftRadarFL — Backend Architecture

## Current (offline, shipped)
- **Persistence:** `src/lib/data.ts` reads/writes `data/sales.json`, `data/venues.json`, `data/digest-subscribers.json` (gitignored). Falls back to `src/lib/seed-data.ts`. Regenerate JSON: `npx tsx scripts/export-json.ts`.
- **Validation:** `src/lib/validate.ts` (`parseSale`, `parseVenue`) — no deps, returns `{ok, value|errors}`.
- **Auth (stub):** `src/lib/auth.ts` — `ADMIN_PASSWORD` env; httpOnly cookie = sha256 token, or `Authorization: Bearer <ADMIN_PASSWORD>` for API.
- **Deal rules:** `src/lib/deal-rules.ts` (UNVERIFIED demo schedules except Berner's Wed auction).

## API
| Method | Route | Auth | Notes |
|---|---|---|---|
| GET | `/api/health` | – | dataMode, adminConfigured |
| GET | `/api/sales?city=port-orange&type=estate` | – | list |
| POST | `/api/sales` | admin | create (JSON body = Sale; `days` array or newline string) |
| GET/PUT/DELETE | `/api/sales/[slug]` | PUT/DELETE admin | |
| GET | `/api/venues`, `/api/venues/[slug]` | – | |
| POST | `/api/venues` | admin | upsert |
| POST | `/api/subscribers` | – | `{email, area}` → JSON file |
| GET | `/api/ics/[slug]` | – | iCalendar, one VEVENT per sale day, America/New_York |

Pages: `/admin` (server actions), `/deals`, `/city/[city]` (5 SSG cities), `/digest` (server action).

## Target schema (Postgres via Drizzle, `src/db/schema.ts`)
orgs → venues (geo lat/lng, hours jsonb) → deal_rules (venue, kind, dow, time, verified, source) ; sales (slug, type, city, zip, geo, source_url, payment[]) → sale_days (date, start, end, discount_pct) ; tags ↔ sale_tags ; subscribers (email unique, area, confirmed_at, unsub_token) ; admin users via Supabase Auth.

## Phased rollout
1. **Phase 1 (now):** JSON layer, password admin. Deploy works read-only on Vercel (filesystem is read-only there → admin writes only locally until Phase 2).
2. **Phase 2:** Supabase Postgres. `npm run db:push && npm run db:seed`; swap `data.ts` functions to Drizzle queries behind same signatures (`hasDb` switch). Migrate subscribers JSON → table.
3. **Phase 3:** Supabase Auth (magic link) replaces `ADMIN_PASSWORD`; RLS: public read on sales/venues, writes service-role only.
4. **Phase 4 — Email:** Resend weekly digest (Thu 7am ET) via Vercel Cron → `/api/cron/digest` (protect with `CRON_SECRET`); double opt-in + one-click unsubscribe.
5. **Phase 5 — Maps:** MapTiler key + MapLibre GL on `/map`; geocode addresses (MapTiler geocoding) on admin save.
6. **Phase 6 — Import:** Admin "paste EstateSales.net URL" → fetch + parse title/dates/address. Policy: respect robots.txt/ToS, manual trigger only, always link back to source, no image rehosting, no bulk scraping. Prefer organizer submissions.

## Jobs (later)
- Daily: expire past sales, prune; weekly: digest send; nightly: re-verify deal rules flagged `verified=false`.
