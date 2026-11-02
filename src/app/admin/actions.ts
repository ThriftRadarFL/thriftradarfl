"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ADMIN_COOKIE, adminToken, isAdmin, checkPassword } from "@/lib/auth";
import { upsertSale, upsertVenue, deleteSale } from "@/lib/data";
import { parseSale, parseVenue } from "@/lib/validate";
export async function login(fd: FormData) {
  const ok = checkPassword(String(fd.get("password") ?? ""));
  if (ok) (await cookies()).set(ADMIN_COOKIE, adminToken(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7 });
  else await new Promise((r) => setTimeout(r, 800));
  redirect(ok ? "/admin" : "/admin?err=1");
}
export async function logout() { (await cookies()).delete(ADMIN_COOKIE); redirect("/admin"); }
const obj = (fd: FormData) => Object.fromEntries([...fd.entries()].map(([k, v]) => [k, String(v)]));
export async function saveSale(fd: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const r = parseSale(obj(fd)); if (!r.ok) redirect("/admin?msg=" + encodeURIComponent(r.errors.join("; ")));
  await upsertSale(r.value); revalidatePath("/", "layout"); redirect("/admin?msg=" + encodeURIComponent("Saved sale " + r.value.slug));
}
export async function removeSale(fd: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  await deleteSale(String(fd.get("slug"))); revalidatePath("/", "layout"); redirect("/admin?msg=Deleted");
}
export async function saveVenue(fd: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const r = parseVenue(obj(fd)); if (!r.ok) redirect("/admin?msg=" + encodeURIComponent(r.errors.join("; ")));
  await upsertVenue(r.value); revalidatePath("/", "layout"); redirect("/admin?msg=" + encodeURIComponent("Saved venue " + r.value.slug));
}
