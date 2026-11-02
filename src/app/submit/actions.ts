"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { addSubmission, addContact } from "@/lib/data";
import { parseSale, parseContact, isEmail, CAPS } from "@/lib/validate";
import { clientIp, limitHit, honeypotTripped, LIMITS } from "@/lib/security";
async function limited(name: keyof typeof LIMITS) { return limitHit(name, clientIp(await headers())).limited; }
const UNAVAILABLE = "Sorry — we couldn't save that right now (storage temporarily unavailable). Please try again in a few minutes.";
async function safeWrite(path: string, fn: () => Promise<unknown>) { let failed = false; try { await fn(); } catch (e) { console.error("[write]", e); failed = true; } if (failed) back(path, UNAVAILABLE); }
const back = (path: string, err: string): never => redirect(`${path}?err=${encodeURIComponent(err)}`);
export async function submitSale(fd: FormData) {
  const o: Record<string, string> = Object.fromEntries([...fd.entries()].map(([k, v]) => [k, String(v)]));
  if (honeypotTripped(fd)) redirect("/submit?ok=1"); // bot: fake success
  o.tags = fd.getAll("tags").map(String).join(",");
  if (await limited("submit")) back("/submit", "Too many submissions — please try again later.");
  const email = (o.email ?? "").trim(); if ((o.description ?? "").length > CAPS.description) back("/submit", `Description must be under ${CAPS.description} characters.`);
  if (!isEmail(email)) back("/submit", "Please enter a valid email so we can confirm details.");
  const days = [1, 2, 3].map((i) => o[`date${i}`] ? `${o[`date${i}`]} ${o[`start${i}`] || "08:00"} ${o[`end${i}`] || "14:00"} ${o[`pct${i}`] || 0}` : "").filter(Boolean).join("\n");
  const { slug: _ignored, ...rest } = o; void _ignored;
  const r = parseSale({ ...rest, days, lat: "", lng: "" }); if (!r.ok) back("/submit", r.errors.join("; "));
  if (!r.ok) return;
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  if (r.value.days.every((d) => d.date < today)) back("/submit", "All sale dates are in the past.");
  await safeWrite("/submit", () => addSubmission({ ...r.value, slug: `${r.value.slug}-${Date.now().toString(36).slice(-4)}`, description: (o.description ?? "").trim().slice(0, CAPS.description) }, email));
  redirect("/submit?ok=1");
}
export async function sendContact(fd: FormData) {
  const o = Object.fromEntries([...fd.entries()].map(([k, v]) => [k, String(v)]));
  if (honeypotTripped(fd)) redirect("/contact?ok=1");
  if (await limited("contact")) back("/contact", "Too many messages — please try again later.");
  const r = parseContact(o); if (!r.ok) back("/contact", r.errors.join("; ")); if (!r.ok) return;
  await safeWrite("/contact", () => addContact(r.value)); redirect("/contact?ok=1");
}
