// CSV export of digest subscribers (admin only): /api/admin/subscribers
import { listSubscribers } from "@/lib/data";
import { isAdminRequest } from "@/lib/auth";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  if (!isAdminRequest(req)) return new Response("unauthorized", { status: 401 });
  const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const csv = ["email,area,subscribed_at", ...(await listSubscribers()).map((s) => [s.email, s.area, s.at].map(q).join(","))].join("\n");
  return new Response(csv + "\n", { headers: { "Content-Type": "text/csv", "Content-Disposition": 'attachment; filename="subscribers.csv"' } });
}
