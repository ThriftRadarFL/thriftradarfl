# Monday Actions — only steps that need YOUR login (~30–40 min)

Try it first: `cd /workspace/thriftradarfl && npm run dev` → http://localhost:3000 · admin at `/admin` (pw `change-me` in `.env.local`)

- [ ] **1. Admin password** — in `.env.local` set `ADMIN_PASSWORD=<strong>` (also `CRON_SECRET=<random>`: `openssl rand -hex 24`)
- [ ] **2. GitHub** — create empty private repo `thriftradarfl`, then:
  ```
  git remote add origin git@github.com:<you>/thriftradarfl.git
  git push -u origin master
  ```
- [ ] **3. Supabase** — new project (US East). Settings → Database → Connection string → **Transaction pooler** URI → `.env.local`:
  `DATABASE_URL=postgres://...:6543/postgres` (+ `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` from Settings → API). Then:
  ```
  npm run db:migrate
  npm run db:seed
  npm run data:smoke   # should print "mode: postgres" and all ok
  ```
- [ ] **4. Vercel** — Import GitHub repo → Environment Variables: `DATABASE_URL`, `ADMIN_PASSWORD`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL=https://<your-domain>` → Deploy. (Cron in `vercel.json` auto-registers.)
- [ ] **5. MapTiler** — cloud.maptiler.com → API key → `NEXT_PUBLIC_MAPTILER_KEY` (local + Vercel).
- [ ] **6. Resend** — resend.com → API key → `RESEND_API_KEY`; add + verify your domain (DNS) → `DIGEST_FROM="ThriftRadarFL <digest@yourdomain>"`. Test: `curl -H "Authorization: Bearer $CRON_SECRET" https://<site>/api/cron/digest?dry=1`
- [ ] **7. Verify deal days** — `/deals` schedules are **unverified demo**; call stores or check signage before launch.
- [ ] **8. Tell Grok Bot "logins done"** → interactive map, Supabase Auth, go-live checks.
