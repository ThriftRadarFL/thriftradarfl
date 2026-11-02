"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, adminToken, isAdmin, checkPassword } from "@/lib/auth";
import * as data from "@/lib/data";
// Writes that fail (e.g. read-only serverless storage while the DB is down) redirect back with an inline "Not saved" banner instead of a crash page.
const STORAGE_MSG = "Not saved: storage is temporarily unavailable (database offline and server disk is read-only). Try again shortly.";
function safe<A extends unknown[], R>(fn: (...a: A) => Promise<R>) {
  return async (...a: A): Promise<R> => { let r: R; try { r = await fn(...a); } catch (e) { console.error("[admin write]", e); redirect(`/admin?msg=${encodeURIComponent(STORAGE_MSG)}`); } return r!; };
}
const upsertSale = safe(data.upsertSale), upsertVenue = safe(data.upsertVenue), deleteSale = safe(data.deleteSale), deleteVenue = safe(data.deleteVenue),
  setSalePublished = safe(data.setSalePublished), upsertDealRule = safe(data.upsertDealRule), deleteDealRule = safe(data.deleteDealRule),
  removeSubscriber = safe(data.removeSubscriber), resolveSubmission = safe(data.resolveSubmission), deleteContact = safe(data.deleteContact);
const audit = (...a: Parameters<typeof data.audit>) => data.audit(...a).catch((e) => console.error("[audit]", e));
const getAllSales = data.getAllSales;
import { csvToRecords } from "@/lib/csv";
import { parseSale, parseVenue, parseDealRule } from "@/lib/validate";
export async function login(fd: FormData) {
  const ok = checkPassword(String(fd.get("password") ?? "")); await audit(ok ? "admin.login" : "admin.login_failed");
  if (ok) (await cookies()).set(ADMIN_COOKIE, adminToken(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  else await new Promise((r) => setTimeout(r, 800));
  redirect(ok ? "/admin" : "/admin?err=1");
}
export async function logout() { (await cookies()).delete(ADMIN_COOKIE); redirect("/admin"); }
const obj = (fd: FormData) => Object.fromEntries([...fd.entries()].map(([k, v]) => [k, String(v)]));
const done = (msg: string, extra = ""): never => { revalidatePath("/", "layout"); redirect(`/admin?msg=${encodeURIComponent(msg)}${extra}`); };
const fail = (errs: string[], extra = ""): never => redirect(`/admin?msg=${encodeURIComponent("Not saved: " + errs.join("; "))}${extra}`);
async function guard() { if (!(await isAdmin())) redirect("/admin"); }
const s = (fd: FormData, k: string) => String(fd.get(k) ?? "");

export async function saveSale(fd: FormData) {
  await guard(); const o = obj(fd); const r = parseSale(o); if (!r.ok) fail(r.errors, o.slug ? `&sale=${o.slug}` : "");
  if (!r.ok) return; await upsertSale({ ...r.value, published: o.published !== "false", ...(o.description ? { description: o.description.slice(0, 2000) } : {}) }); await audit("sale.save", r.value.slug, r.value.title); done("Saved sale " + r.value.slug);
}
export async function removeSale(fd: FormData) { await guard(); await deleteSale(s(fd, "slug")); await audit("sale.delete", s(fd, "slug")); done("Deleted sale " + s(fd, "slug")); }
export async function togglePublish(fd: FormData) {
  await guard(); const pub = s(fd, "published") === "true"; await setSalePublished(s(fd, "slug"), pub); await audit(pub ? "sale.publish" : "sale.unpublish", s(fd, "slug")); done(`${pub ? "Published" : "Unpublished"} ${s(fd, "slug")}`);
}
export async function saveVenue(fd: FormData) {
  await guard(); const o = obj(fd); const r = parseVenue(o); if (!r.ok) fail(r.errors, o.slug ? `&venue=${o.slug}` : ""); if (!r.ok) return;
  await upsertVenue(r.value); await audit("venue.save", r.value.slug, r.value.name); done("Saved venue " + r.value.slug);
}
export async function removeVenue(fd: FormData) { await guard(); await deleteVenue(s(fd, "slug")); await audit("venue.delete", s(fd, "slug")); done("Deleted venue " + s(fd, "slug") + " and its deal rules"); }
export async function saveRule(fd: FormData) {
  await guard(); const o = obj(fd); const r = parseDealRule(o); if (!r.ok) fail(r.errors, o.id ? `&rule=${o.id}` : ""); if (!r.ok) return;
  if (o.id && o.id !== r.value.id) await deleteDealRule(o.id);
  await upsertDealRule(r.value); await audit("rule.save", r.value.id, `${r.value.venue} · ${r.value.label}${r.value.verified ? " · verified" : ""}`); done("Saved deal rule " + r.value.label);
}
export async function removeRule(fd: FormData) { await guard(); await deleteDealRule(s(fd, "id")); await audit("rule.delete", s(fd, "id")); done("Deleted deal rule"); }
export async function removeSub(fd: FormData) { await guard(); await removeSubscriber(s(fd, "email")); await audit("subscriber.remove", s(fd, "email")); done("Removed subscriber " + s(fd, "email")); }
export async function reviewSubmission(fd: FormData) {
  await guard(); const approve = s(fd, "approve") === "true"; const slug = await resolveSubmission(s(fd, "id"), approve); if (slug) await audit(approve ? "submission.approve" : "submission.reject", slug);
  done(slug ? `${approve ? "Approved & published" : "Rejected"} ${slug}` : "Submission not found");
}
export async function removeContact(fd: FormData) { await guard(); await deleteContact(s(fd, "id")); await audit("message.delete", s(fd, "id")); done("Deleted message"); }

export type CsvResult = { mode: "preview" | "import"; ok: { slug: string; title: string; exists: boolean }[]; bad: { row: number; errors: string[] }[]; warnings: string[] };
export async function importCsv(_prev: CsvResult | null, fd: FormData): Promise<CsvResult> {
  await guard(); const mode = s(fd, "mode") === "import" ? "import" : "preview";
  const file = fd.get("file"); let text = s(fd, "csv");
  if (file && typeof file === "object" && "text" in file && (file as File).size) { if ((file as File).size > 1_000_000) return { mode, ok: [], bad: [], warnings: ["File over 1 MB"] }; text = await (file as File).text(); }
  const { records, errors } = csvToRecords(text); const existing = new Set((await getAllSales()).map((x) => x.slug));
  const res: CsvResult = { mode, ok: [], bad: [], warnings: errors }; if (errors.some((e) => e.startsWith("missing") || e.includes("empty"))) return res;
  if (records.length > 500) return { ...res, warnings: [...errors, "Max 500 rows per import"] };
  const seen = new Set<string>(); const valid = [];
  for (const [i, rec] of records.entries()) {
    const r = parseSale(rec); if (!r.ok) { res.bad.push({ row: i + 2, errors: r.errors }); continue; }
    if (seen.has(r.value.slug)) { res.bad.push({ row: i + 2, errors: [`duplicate slug ${r.value.slug} in file`] }); continue; } seen.add(r.value.slug);
    const sale = { ...r.value, published: !/^(false|no|0)$/i.test(rec.published ?? ""), ...(rec.description ? { description: rec.description.slice(0, 2000) } : {}) };
    valid.push(sale); res.ok.push({ slug: sale.slug, title: sale.title, exists: existing.has(sale.slug) });
  }
  if (mode === "import" && !res.bad.length) { for (const v of valid) await upsertSale(v); await audit("sale.csv_import", `${valid.length} rows`, valid.map((v) => v.slug).join(", ")); revalidatePath("/", "layout"); }
  else if (mode === "import") res.warnings.push("Nothing imported — fix the rows with errors first (all-or-nothing).");
  return res;
}
