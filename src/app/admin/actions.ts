"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, adminToken, isAdmin, checkPassword } from "@/lib/auth";
import { upsertSale, upsertVenue, deleteSale, deleteVenue, setSalePublished, upsertDealRule, deleteDealRule, removeSubscriber, resolveSubmission, deleteContact } from "@/lib/data";
import { parseSale, parseVenue, parseDealRule } from "@/lib/validate";
export async function login(fd: FormData) {
  const ok = checkPassword(String(fd.get("password") ?? ""));
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
  if (!r.ok) return; await upsertSale({ ...r.value, published: o.published !== "false", ...(o.description ? { description: o.description.slice(0, 2000) } : {}) }); done("Saved sale " + r.value.slug);
}
export async function removeSale(fd: FormData) { await guard(); await deleteSale(s(fd, "slug")); done("Deleted sale " + s(fd, "slug")); }
export async function togglePublish(fd: FormData) {
  await guard(); const pub = s(fd, "published") === "true"; await setSalePublished(s(fd, "slug"), pub); done(`${pub ? "Published" : "Unpublished"} ${s(fd, "slug")}`);
}
export async function saveVenue(fd: FormData) {
  await guard(); const o = obj(fd); const r = parseVenue(o); if (!r.ok) fail(r.errors, o.slug ? `&venue=${o.slug}` : ""); if (!r.ok) return;
  await upsertVenue(r.value); done("Saved venue " + r.value.slug);
}
export async function removeVenue(fd: FormData) { await guard(); await deleteVenue(s(fd, "slug")); done("Deleted venue " + s(fd, "slug") + " and its deal rules"); }
export async function saveRule(fd: FormData) {
  await guard(); const o = obj(fd); const r = parseDealRule(o); if (!r.ok) fail(r.errors, o.id ? `&rule=${o.id}` : ""); if (!r.ok) return;
  if (o.id && o.id !== r.value.id) await deleteDealRule(o.id);
  await upsertDealRule(r.value); done("Saved deal rule " + r.value.label);
}
export async function removeRule(fd: FormData) { await guard(); await deleteDealRule(s(fd, "id")); done("Deleted deal rule"); }
export async function removeSub(fd: FormData) { await guard(); await removeSubscriber(s(fd, "email")); done("Removed subscriber " + s(fd, "email")); }
export async function reviewSubmission(fd: FormData) {
  await guard(); const approve = s(fd, "approve") === "true"; const slug = await resolveSubmission(s(fd, "id"), approve);
  done(slug ? `${approve ? "Approved & published" : "Rejected"} ${slug}` : "Submission not found");
}
export async function removeContact(fd: FormData) { await guard(); await deleteContact(s(fd, "id")); done("Deleted message"); }
