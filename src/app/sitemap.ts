import type { MetadataRoute } from "next";
import { getSales, getVenues } from "@/lib/data";
import { todayET } from "@/lib/cities";
import { SITE_URL } from "@/lib/site";
import { sitemapEntries } from "@/lib/seo";
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [sales, venues] = await Promise.all([getSales(), getVenues()]);
  return sitemapEntries(SITE_URL, sales, venues, todayET());
}
