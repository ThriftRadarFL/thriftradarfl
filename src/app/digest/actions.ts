"use server";
import { headers } from "next/headers";
import { addDigestSubscriber } from "@/lib/data";
import { parseSubscriber } from "@/lib/validate";
import { clientIp, limitHit, honeypotTripped } from "@/lib/security";
export type DigestState = { ok?: boolean; msg?: string };
export async function subscribe(_prev: DigestState, fd: FormData): Promise<DigestState> {
  if (honeypotTripped(fd)) return { ok: true, msg: "Thanks!" };
  if (limitHit("subscribe", clientIp(await headers())).limited) return { ok: false, msg: "Too many attempts — try again in a minute." };
  const r = parseSubscriber({ email: fd.get("email"), area: fd.get("area"), keywords: fd.get("keywords") }); if (!r.ok) return { ok: false, msg: "Enter a valid email." };
  let added: boolean;
  try { added = !!(await addDigestSubscriber(r.value.email, r.value.area, r.value.keywords)); } catch (e) { console.error("[digest]", e); return { ok: false, msg: "Sorry — signups are temporarily unavailable. Please try again later." }; }
  const kw = r.value.keywords.length ? ` Keyword alerts: ${r.value.keywords.join(", ")}.` : "";
  return { ok: true, msg: added ? `You're on the list! First digest arrives Thursday.${kw}` : kw ? `You're already subscribed — keyword alerts updated.${kw}` : "You're already subscribed." };
}
