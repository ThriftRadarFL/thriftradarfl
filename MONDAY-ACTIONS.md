# Monday Actions (only things that need YOUR login) — ~30 min

Local now: `cd /workspace/thriftradarfl && npm run dev` → http://localhost:3000 (admin pw in `.env.local`: `change-me`)

- [ ] **1. Admin password** — edit `.env.local`: `ADMIN_PASSWORD=<something strong>`
- [ ] **2. GitHub** — create empty repo `thriftradarfl` (private), then:
  ```
  git remote add origin git@github.com:<you>/thriftradarfl.git
  git push -u origin master
  ```
- [ ] **3. Supabase** — new project (region us-east-1). Settings → Database → Connection string (pooler URI). Put in `.env.local` as `DATABASE_URL=...`, plus `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (Settings → API). Then:
  ```
  npm run db:push
  npm run db:seed
  ```
- [ ] **4. Vercel** — Import GitHub repo → add env vars from `.env.local` (DATABASE_URL, ADMIN_PASSWORD, Supabase keys) → Deploy.
- [ ] **5. MapTiler** — cloud.maptiler.com free account → API key → `NEXT_PUBLIC_MAPTILER_KEY` (local + Vercel).
- [ ] **6. Resend** — resend.com account → API key → `RESEND_API_KEY`; verify sending domain (DNS) if you have one.
- [ ] **7. Tell Grok Bot "done"** — I'll swap the JSON layer to Postgres, wire map + digest emails.

Note: Deal-day schedules on `/deals` are **demo/unverified** — call stores or check before launch.
