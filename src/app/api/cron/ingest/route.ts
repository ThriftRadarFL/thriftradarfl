// Bounded public-listing ingest (Vercel Cron / manual with Authorization: Bearer $CRON_SECRET).
// Shares auth with other cron jobs. Discovery/quarantine by default; set INGEST_PUBLISH=1 to auto-publish publishable records.
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
  const publish = u.searchParams.get("publish") === "1";
  const applyPatches = u.searchParams.get("patches") === "1";
  const extra = u.searchParams.getAll("url").filter(Boolean);
  const result = await runIngestion({ dryRun: dry || undefined, publish: publish || undefined, applyPatches: applyPatches || undefined, extraUrls: extra });
  return json(result);
}
