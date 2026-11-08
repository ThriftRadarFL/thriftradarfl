# ThriftRadarFL

Weekly map + calendar of Central Florida estate sales, auctions, thrift deal days, and Goodwill outlet bins.

Stack: Next.js 15 (App Router, TS) · Tailwind v4 · Drizzle ORM · Postgres (Supabase) · Vercel.

## Run locally (no DB needed)
```bash
npm install
npm run dev        # http://localhost:3000  — pages use mock data from src/lib/seed-data.ts
npm run build && npm start
```

## Connect Supabase
1. Create a Supabase project; enable the PostGIS extension (Database > Extensions) for later geo queries.
2. `cp .env.example .env` and set `DATABASE_URL` (use the pooler connection string).
3. `npm run db:migrate` (applies `drizzle/0000_*.sql`) — or `npm run db:push` for quick iteration.
4. `npm run db:seed` — inserts Goodwill Port Orange, Goodwill Daytona, Pine Hills & Taft outlets, Berner's Auction, tags, and one example sale.
5. Swap `src/lib/data.ts` from mock arrays to Drizzle queries.

## Env vars
| Var | Needed |
| --- | --- |
| DATABASE_URL | DB migrate/seed/queries |
| NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY | admin auth (Day 2) |
| NEXT_PUBLIC_MAPTILER_KEY | map (Day 4) |
| RESEND_API_KEY | digest (later) |

## What's built
See `OVERNIGHT.md` → "What's built" and the dated passes below it. Latest: security headers/CSP, rate limit + honeypot on public forms, validation caps, `/api/health` (`mode`: postgres | json-fallback | json), per-city pages with "This weekend" for every city in the data.

## Layout
- `src/db/schema.ts` — organizations, venues, sales, sale_days, deal_rules, tags, sale_tags, subscribers
- `src/lib/seed-data.ts` — seed + mock data (lat/lng are approximate placeholders — re-geocode)
- `scripts/seed.ts` — DB seeder
- `src/app/*` — routes: /, /map, /stores, /stores/[slug], /deals, /digest, /admin, /sales/[slug], /city/[slug] (auto for every city in the data)

## shadcn (later)
`npx shadcn@latest init` then `npx shadcn@latest add button card input badge`.


## Automation
See `AUTOMATION.md` for the listing ingest pipeline (quarantine-by-default, no guessed end times or cash claims) and `FUTURE-QUEUE.md` for remaining manual gates.
