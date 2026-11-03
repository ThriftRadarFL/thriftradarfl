// CSV export helpers for admin downloads (RFC 4180 quoting; cells starting with = + - @ are prefixed with ' so spreadsheets don't run them as formulas).
import type { Submission, ContactMsg, AuditEntry } from "./data";
export const csvCell = (v: unknown) => { let s = v == null ? "" : Array.isArray(v) ? v.join("; ") : String(v); if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; return `"${s.replace(/"/g, '""')}"`; };
export const toCsv = (head: string[], rows: unknown[][]) => [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n") + "\r\n";
export const EXPORTS = ["submissions", "contacts", "audit"] as const;
export type ExportKind = (typeof EXPORTS)[number];
export const submissionsCsv = (l: Submission[]) => toCsv(["id", "submitted_at", "email", "title", "type", "city", "zip", "days", "source_url", "description"],
  l.map((s) => [s.id, s.at, s.email, s.sale.title, s.sale.type, s.sale.city, s.sale.zip, s.sale.days.map((d) => `${d.date} ${d.start}-${d.end}${d.discountPct ? ` ${d.discountPct}%` : ""}`), s.sale.sourceUrl, s.sale.description ?? ""]));
export const contactsCsv = (l: ContactMsg[]) => toCsv(["id", "at", "name", "email", "message"], l.map((m) => [m.id, m.at, m.name, m.email, m.message]));
export const auditCsv = (l: AuditEntry[]) => toCsv(["at", "action", "target", "detail"], l.map((a) => [a.at, a.action, a.target, a.detail]));
