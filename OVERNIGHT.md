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
