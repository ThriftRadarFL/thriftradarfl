// CSV exports for admins: /api/admin/export?what=submissions|contacts|audit
import { listSubmissions, listContacts, listAudit } from "@/lib/data";
import { isAdminRequest } from "@/lib/auth";
import { EXPORTS, submissionsCsv, contactsCsv, auditCsv, type ExportKind } from "@/lib/csv-export";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  if (!isAdminRequest(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const what = new URL(req.url).searchParams.get("what") as ExportKind;
  if (!EXPORTS.includes(what)) return Response.json({ error: `what must be one of ${EXPORTS.join(", ")}` }, { status: 400 });
  const csv = what === "submissions" ? submissionsCsv(await listSubmissions()) : what === "contacts" ? contactsCsv(await listContacts()) : auditCsv(await listAudit(5000));
  const stamp = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  return new Response("\uFEFF" + csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="thriftradarfl-${what}-${stamp}.csv"`, "Cache-Control": "no-store" } });
}
