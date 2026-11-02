// Sitemap + robots rules as pure functions (tested). Only indexable, live URLs go in the sitemap.
import type { MetadataRoute } from "next";
import type { Sale, Venue } from "./data";
import { cityList } from "./cities";
/** City pages worth indexing: at least one upcoming sale or store. */
export const citySlugOk = (c: { sales: number; venues: number }) => c.sales + c.venues > 0;
export const STATIC_PAGES = ["", "/today", "/map", "/calendar", "/weekend", "/new", "/sales", "/stores", "/deals", "/digest", "/city", "/about", "/faq", "/submit", "/contact", "/privacy", "/terms", "/plan"];
/** A sale has ended once its last day is before today (ET). */
export const saleEnded = (s: Sale, today: string) => (s.days.at(-1)?.date ?? "") < today;
export function sitemapEntries(site: string, sales: Sale[], venues: Venue[], today: string, now = new Date()): MetadataRoute.Sitemap {
  const live = sales.filter((s) => s.published !== false && !saleEnded(s, today));
  return [
    ...STATIC_PAGES.map((p) => ({ url: site + p, lastModified: now, changeFrequency: "daily" as const, priority: p ? 0.7 : 1 })),
    ...cityList(sales, venues, today).filter(citySlugOk).map((c) => ({ url: `${site}/city/${c.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
    ...venues.map((v) => ({ url: `${site}/stores/${v.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...live.map((s) => ({ url: `${site}/sales/${s.slug}`, changeFrequency: "daily" as const, priority: 0.6 })),
  ];
}
// noindex pages like /saved and /search stay crawlable so bots can see their noindex.
export const ROBOTS_DISALLOW = ["/admin", "/api/", "/digest/preview", "/offline"];
/** Preview/staging deploys must never be indexed (duplicate content). */
export function robotsRules(site: string, env: Record<string, string | undefined> = process.env): MetadataRoute.Robots {
  if (env.VERCEL_ENV && env.VERCEL_ENV !== "production") return { rules: [{ userAgent: "*", disallow: "/" }] };
  return { rules: [{ userAgent: "*", allow: "/", disallow: ROBOTS_DISALLOW }], sitemap: `${site}/sitemap.xml` };
}
