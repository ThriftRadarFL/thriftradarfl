# Monday Actions — only steps that need YOUR login

Everything else is built and committed locally (see `OVERNIGHT.md` → "What's built"). Try it: `npm run dev` → http://localhost:3000 (admin at `/admin`).

- [ ] **1. GitHub push** — create empty private repo `thriftradarfl`, then:
  ```
  git remote add origin git@github.com:<you>/thriftradarfl.git
  git push -u origin master
  ```
- [ ] **2. Vercel deploy** — Import the repo → Environment Variables: `DATABASE_URL`, `ADMIN_PASSWORD`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL=https://<your-domain>`, `NEXT_PUBLIC_MAPTILER_KEY`, `RESEND_API_KEY`, `DIGEST_FROM` → Deploy. Cron in `vercel.json` auto-registers.
  - **Which `DATABASE_URL`:** use Supabase → Connect → **Transaction pooler** (`...pooler.supabase.com:6543`, user `postgres.<project-ref>`) for Vercel (serverless). Session pooler (`:5432` on the same host) also works; the direct host `db.<ref>.supabase.co:5432` is IPv6-only unless you buy the IPv4 add-on, so don't use it on Vercel.
  - From the bot's box, all three (pooler 6543, pooler 5432, direct 5432) time out or return `PROTOCOL_ERROR` — the box's network blocks raw Postgres. That's a box limitation, not a wrong URL. The site falls back to JSON there automatically; after deploying, check `https://<site>/api/health` shows `"dataMode":"postgres"`.
- [ ] **3. Resend custom domain** — resend.com → Domains → add your domain → add the DNS records → once verified set `DIGEST_FROM="ThriftRadarFL <digest@yourdomain>"` (until then it sends from `onboarding@resend.dev`, which only delivers to your own Resend account email). Test: `curl -H "Authorization: Bearer $CRON_SECRET" https://<site>/api/cron/digest?dry=1`
- [ ] **4. Verify deal days** — `/deals` schedules marked *unverified* need a call or a store visit. Then tick **Verified** per rule in `/admin#rules` (or edit/delete them there).
