"use server";
import { addDigestSubscriber } from "@/lib/data";
export type DigestState = { ok?: boolean; msg?: string };
export async function subscribe(_prev: DigestState, fd: FormData): Promise<DigestState> {
  const email = String(fd.get("email") ?? "").trim(); const area = String(fd.get("area") ?? "All");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, msg: "Enter a valid email." };
  const added = await addDigestSubscriber(email, area);
  return { ok: true, msg: added ? "You're on the list! First digest arrives Thursday." : "You're already subscribed." };
}
