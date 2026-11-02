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
