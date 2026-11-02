// Weekly digest job. Vercel Cron hits this (see vercel.json) with Authorization: Bearer $CRON_SECRET.
// Without RESEND_API_KEY it runs in dry-run mode and returns the rendered email (safe to call locally).
import { getSales, listSubscribers, getDealRules } from "@/lib/data";
import { buildDigest } from "@/lib/digest";
import { json } from "@/lib/api";
import { unsubToken } from "@/lib/auth";
import { SITE_URL } from "@/lib/site";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  // Fail closed in production when CRON_SECRET is missing; open only in local dev for dry runs.
  if (!secret && process.env.NODE_ENV === "production") return json({ error: "CRON_SECRET not configured" }, 401);
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return json({ error: "unauthorized" }, 401);
  const u = new URL(req.url); const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const d = buildDigest(await getSales(), u.searchParams.get("from") ?? today, undefined, await getDealRules()); const subs = await listSubscribers();
  const key = process.env.RESEND_API_KEY; const sender = process.env.DIGEST_FROM ?? "ThriftRadarFL <onboarding@resend.dev>";
  if (!key || u.searchParams.get("dry") === "1") return json({ dryRun: true, recipients: subs.length, subject: d.subject, sales: d.count, text: d.text, htmlBytes: d.html.length, unsubscribeLinkOk: d.html.includes(`${SITE_URL}/digest">Unsubscribe`) });
  let sent = 0; const errors: string[] = [];
  for (let i = 0; i < subs.length; i += 100) { // Resend batch API: up to 100 emails per call
    const batch = subs.slice(i, i + 100).map((s) => {
      const unsub = `${SITE_URL}/api/unsubscribe?e=${encodeURIComponent(s.email)}&t=${unsubToken(s.email)}`;
      return { from: sender, to: s.email, subject: d.subject, html: d.html.replaceAll(`${SITE_URL}/digest">Unsubscribe`, `${unsub}">Unsubscribe`), text: d.text.replace(`Unsubscribe: ${SITE_URL}/digest`, `Unsubscribe: ${unsub}`), headers: { "List-Unsubscribe": `<${unsub}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } };
    });
    const r = await fetch("https://api.resend.com/emails/batch", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(batch) });
    if (r.ok) sent += batch.length; else errors.push(`${r.status} ${await r.text()}`);
  }
  return json({ sent, errors });
}
