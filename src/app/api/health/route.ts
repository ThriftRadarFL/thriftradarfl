import { dataMode, dbStatus, getVenues, strictWrites } from "@/lib/data";
export const dynamic = "force-dynamic";
// mode: "postgres" (DB reachable) | "json-fallback" (DATABASE_URL set but DB unreachable → local JSON) | "json" (no DB configured).
// Never exposes the connection string or secrets — only booleans and a short error code.
export async function GET() {
  const started = Date.now(); let venues = 0, readOk = true;
  try { venues = (await getVenues()).length; } catch { readOk = false; }
  const db = dbStatus(); const dm = dataMode();
  const mode = dm === "postgres" ? "postgres" : db.configured ? "json-fallback" : "json";
  return Response.json({ ok: readOk, mode, dataMode: dm, db: { configured: db.configured, up: db.up, lastError: db.lastError ? String(db.lastError).slice(0, 80) : null, strictWrites: strictWrites() },
    readOk, venues, latencyMs: Date.now() - started, adminConfigured: !!process.env.ADMIN_PASSWORD, cronConfigured: !!process.env.CRON_SECRET,
    emailConfigured: !!process.env.RESEND_API_KEY, mapConfigured: !!process.env.NEXT_PUBLIC_MAPTILER_KEY, time: new Date().toISOString() },
    { status: readOk ? 200 : 503, headers: { "Cache-Control": "no-store" } });
}
