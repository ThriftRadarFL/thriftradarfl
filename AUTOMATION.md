# ThriftRadarFL automation runbook

Saturday–Sunday pipeline for bounded public listing ingest. This is **not** a claim that every aggregator, store, or social source is covered.

## What shipped
- Discovery of listing URLs from three public city index pages (`src/lib/ingestion/sources.ts`): estatesales.net Orlando, estatesales.net Daytona Beach, estatesales.org Orlando.
- JSON-LD parse/normalize with **no guessed 17:00 end times and no invented cash payments**.
- Deterministic quarantine for missing/invalid ends, multi-day hours that are not itemized, time conflicts, non-ET timezone labels, implausible hours, out-of-Florida points, and manual holds.
- Stable candidate id `(source, externalId)` + content digest; unchanged hash is a no-op.
- Existing published/draft sales are never overwritten automatically (`existing-record-needs-review`).
- DB tables `ingestion_runs`, `ingestion_candidates`, `ingestion_leases` (migration `drizzle/0007_ingestion.sql`) with JSON-file fallback for local/tests.
- Expiring lease so overlapping cron invocations do not double-write.
- Public lists (`getSales`, default `/api/sales`, map pins via those sales) hide sales with no day on or after today ET. Historical `/sales/[slug]` remains. Pass `?includeEnded=1` on `/api/sales` if you need the raw published set.
- Schedule: ingestion runs at the end of the existing daily `/api/cron/alerts` job (12:00 UTC / 7:00 AM EST) so Hobby’s two-cron limit is not exceeded. Dedicated `GET /api/cron/ingest` exists for manual/CRON_SECRET runs.
- Admin “Ingestion” panel and `/api/health.ingest` (no secrets).
- Kill switch: `INGEST_ENABLED=0`. Dry-run (default): `INGEST_DRY_RUN=1` or unset. Auto-publish only when `INGEST_PUBLISH=1`. Queued data patches (pins/Daytona/SVdP note) apply when `INGEST_APPLY_PATCHES=1` on a non-dry run.

## Held / unknown (do not auto-resolve)
- Silver Star `5147001` (structured 3–8pm vs “auction at 4PM”).
- Prince John `2472421` (timezone / 1:00 AM end provenance).
- Halifax five shops and Habitat Sanford: status UNKNOWN without fresh official proof.

## How to run
```bash
# dry discovery/quarantine (CRON_SECRET if set)
curl -H "Authorization: Bearer $CRON_SECRET" "https://thriftradarfl.vercel.app/api/cron/ingest?dry=1"

# apply researched pin/venue patches without publishing new listings
curl -H "Authorization: Bearer $CRON_SECRET" "https://thriftradarfl.vercel.app/api/cron/ingest?patches=1"

# only after a reviewed dry-run and migration 0007
# set INGEST_PUBLISH=1 in Vercel, redeploy, then:
curl -H "Authorization: Bearer $CRON_SECRET" "https://thriftradarfl.vercel.app/api/cron/ingest?publish=1"
```

Production writes require Postgres (`DATABASE_URL`) plus `drizzle/0007_ingestion.sql`. JSON fallback cannot persist on read-only serverless filesystems.

## Rollback
1. Set `INGEST_ENABLED=0` (or `INGEST_PUBLISH=0`) and redeploy — stops new publishes immediately.
2. Code rollback does not undo database writes. Quarantined candidates stay; published slugs are listed on the run summary and admin panel.
3. Restore a sale/venue from admin or a previous row; do not reseed production.

## Tests
`npm test` includes `tests/ingestion.test.ts` (missing/conflict fixtures, idempotency, retries, lease, expiry, chain-rule grouping) and existing `npm run check`.
