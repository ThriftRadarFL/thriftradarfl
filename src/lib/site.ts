/** Absolute site origin (no trailing slash). Emails and feeds need absolute URLs, so: NEXT_PUBLIC_SITE_URL → Vercel production domain → localhost. */
export function siteUrl(env: Record<string, string | undefined> = process.env): string {
  const raw = (env.NEXT_PUBLIC_SITE_URL || "").trim() || (env.VERCEL_PROJECT_PRODUCTION_URL || "").trim() || "http://localhost:3000";
  return (/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).replace(/\/+$/, "");
}
export const SITE_URL = siteUrl();
export const SITE_NAME = "ThriftRadarFL";
export const isLocalUrl = (u: string) => /^https?:\/\/(localhost|127\.|0\.0\.0\.0)/i.test(u);
