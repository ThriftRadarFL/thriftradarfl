import { dataMode, dbStatus, getVenues } from "@/lib/data";
export const dynamic = "force-dynamic";
export async function GET() { await getVenues(); return Response.json({ ok: true, dataMode: dataMode(), db: dbStatus(), adminConfigured: !!process.env.ADMIN_PASSWORD }); }
