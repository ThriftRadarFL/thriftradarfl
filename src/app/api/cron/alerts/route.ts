// Daily keyword-alert job (Vercel Cron, Authorization: Bearer $CRON_SECRET). Emails each subscriber with keywords
// about sales first listed in the last ?hours= (default 24) that mention them. Dry-run without RESEND_API_KEY or with ?dry=1.
import { getSales, listSubscribers } from "@/lib/data";
import { newKeywordMatches, buildKeywordAlert } from "@/lib/keyword-alerts";
import { json } from "@/lib/api";
import { unsubToken } from "@/lib/auth";
import { SITE_URL, isLocalUrl } from "@/lib/site";
import { runIngestion } from "@/lib/ingestion/run";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret && process.env.NODE_ENV === "production") return json({ error: "CRON_SECRET not configured" }, 401);
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) return json({ error: "unauthorized" }, 401);
  const u = new URL(req.url); const hours = Math.min(Math.max(Number(u.searchParams.get("hours")) || 24, 1), 24 * 14); const now = new Date();
  const today = now.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const sales = await getSales(); const subs = (await listSubscribers()).filter((s) => s.keywords?.length);
  const mails = subs.map((s) => ({ s, m: newKeywordMatches(sales, s.keywords!, now, hours) })).filter((x) => x.m.length).map(({ s, m }) => {
    const unsub = `${SITE_URL}/api/unsubscribe?e=${encodeURIComponent(s.email)}&t=${unsubToken(s.email)}`; const a = buildKeywordAlert(m, unsub, SITE_URL, today);
    return { email: s.email, matches: m.length, ...a, unsub };
  });
  const key = process.env.RESEND_API_KEY; const sender = process.env.DIGEST_FROM ?? "ThriftRadarFL <onboarding@resend.dev>";
  let ingest: unknown = null;
  if (u.searchParams.get("ingest") !== "0") { try { ingest = await runIngestion(); } catch { ingest = { error: "ingest-failed" }; } }
  if (!key || u.searchParams.get("dry") === "1") return json({ dryRun: true, hours, subscribersWithKeywords: subs.length, emails: mails.length, preview: mails.slice(0, 3).map((m) => ({ matches: m.matches, subject: m.subject })), ingest });
  if (isLocalUrl(SITE_URL)) return json({ error: "NEXT_PUBLIC_SITE_URL is not set to a public https URL; refusing to send emails with localhost links" }, 500);
  let sent = 0; const errors: string[] = [];
  for (let i = 0; i < mails.length; i += 100) {
    const batch = mails.slice(i, i + 100).map((m) => ({ from: sender, to: m.email, subject: m.subject, html: m.html, text: m.text, headers: { "List-Unsubscribe": `<${m.unsub}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } }));
    const r = await fetch("https://api.resend.com/emails/batch", { method: "POST", headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: JSON.stringify(batch) });
    if (r.ok) sent += batch.length; else errors.push(`${r.status} ${await r.text()}`);
  }
  if (!ingest && u.searchParams.get("ingest") !== "0") { try { ingest = await runIngestion(); } catch { ingest = { error: "ingest-failed" }; } }
  return json({ sent, errors, ingest });
}
