import type { MetadataRoute } from "next";
import { getSales, getVenues } from "@/lib/data";
import { cityList, todayET } from "@/lib/cities";
import { SITE_URL } from "@/lib/site";
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sales, venues] = await Promise.all([getSales(), getVenues()]);
  const now = new Date();
  return [
    ...["", "/today", "/map", "/calendar", "/weekend", "/sales", "/stores", "/deals", "/digest", "/city", "/about", "/faq", "/submit", "/contact", "/privacy", "/terms", "/plan"].map((p) => ({ url: SITE_URL + p, lastModified: now, changeFrequency: "daily" as const, priority: p ? 0.7 : 1 })),
    ...cityList(sales, venues, todayET()).map((c) => ({ url: `${SITE_URL}/city/${c.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
    ...venues.map((v) => ({ url: `${SITE_URL}/stores/${v.slug}`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...sales.map((s) => ({ url: `${SITE_URL}/sales/${s.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.6 })),
  ];
}
