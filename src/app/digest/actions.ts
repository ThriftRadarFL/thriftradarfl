"use server";
import { headers } from "next/headers";
import { addDigestSubscriber } from "@/lib/data";
import { parseSubscriber } from "@/lib/validate";
import { clientIp, limitHit, honeypotTripped } from "@/lib/security";
export type DigestState = { ok?: boolean; msg?: string };
export async function subscribe(_prev: DigestState, fd: FormData): Promise<DigestState> {
  if (honeypotTripped(fd)) return { ok: true, msg: "Thanks!" };
  if (limitHit("subscribe", clientIp(await headers())).limited) return { ok: false, msg: "Too many attempts — try again in a minute." };
  const r = parseSubscriber({ email: fd.get("email"), area: fd.get("area") }); if (!r.ok) return { ok: false, msg: "Enter a valid email." };
  const added = await addDigestSubscriber(r.value.email, r.value.area);
  return { ok: true, msg: added ? "You're on the list! First digest arrives Thursday." : "You're already subscribed." };
}
