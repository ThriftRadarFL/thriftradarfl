import { dataMode } from "@/lib/data";
export const dynamic = "force-dynamic";
export async function GET() { return Response.json({ ok: true, dataMode, adminConfigured: !!process.env.ADMIN_PASSWORD }); }
