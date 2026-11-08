// Bounded public-listing ingest (Vercel Cron / manual with Authorization: Bearer $CRON_SECRET).
// GET is authenticated the same way as other cron jobs; it is not a public write surface.
// Query `dry=1` can only force a safer dry run. Publish/patches are env flags only (INGEST_PUBLISH / INGEST_APPLY_PATCHES).
import { json } from "@/lib/api";
import { runIngestion } from "@/lib/ingestion/run";
export const dynamic = "force-dynamic";
export const maxDuration = 60;
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret && process.env.NODE_ENV === "production") return json({ error: "CRON_SECRET not configured" }, 401);
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return json({ error: "unauthorized" }, 401);
  const u = new URL(req.url);
  const dry = u.searchParams.get("dry") === "1" || u.searchParams.get("dry") === "true";
  const result = await runIngestion({ dryRun: dry ? true : undefined });
  return json(result);
}
