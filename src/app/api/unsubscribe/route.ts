// One-click unsubscribe (GET from email link, POST for RFC 8058 List-Unsubscribe-Post)
import { removeSubscriber } from "@/lib/data";
import { unsubToken } from "@/lib/auth";
import { timingSafeEqual } from "crypto";
export const dynamic = "force-dynamic";
async function run(req: Request) {
  const u = new URL(req.url); const e = u.searchParams.get("e") ?? ""; const t = u.searchParams.get("t") ?? ""; const want = unsubToken(e);
  if (!e || t.length !== want.length || !timingSafeEqual(Buffer.from(t), Buffer.from(want))) return new Response("Invalid unsubscribe link.", { status: 400 });
  await removeSubscriber(e);
  return new Response(`<!doctype html><meta name="viewport" content="width=device-width"><body style="font-family:Arial;padding:40px"><h1>You're unsubscribed</h1><p>${e.replace(/[<>&"]/g, "")} won't receive the ThriftRadarFL digest anymore.</p><a href="/">Back to ThriftRadarFL</a></body>`, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
export const GET = run; export const POST = run;
