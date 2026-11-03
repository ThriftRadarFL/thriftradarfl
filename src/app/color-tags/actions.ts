"use server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getVenues, addTagReport } from "@/lib/data";
import { parseTagReport } from "@/lib/color-tags";
import { tagVenues } from "@/lib/color-tag-board";
import { clientIp, limitHit, honeypotTripped } from "@/lib/security";
import { todayET } from "@/lib/cities";
const back = (err: string): never => redirect(`/color-tags?err=${encodeURIComponent(err)}`);
export async function reportColorTag(fd: FormData) {
  if (honeypotTripped(fd)) redirect("/color-tags?ok=1");
  if (limitHit("tag", clientIp(await headers())).limited) back("Too many reports from your connection — please try again in an hour.");
  const o = Object.fromEntries([...fd.entries()].map(([k, v]) => [k, String(v)]));
  const r = parseTagReport(o, tagVenues(await getVenues()).map((v) => v.slug), todayET()); if (!r.ok) back(r.errors.join(" "));
  if (!r.ok) return;
  let failed = false; try { await addTagReport(r.value); } catch (e) { console.error("[color-tags]", e); failed = true; }
  if (failed) back("Sorry — we couldn't save that right now. Please try again in a few minutes.");
  redirect("/color-tags?ok=1");
}
