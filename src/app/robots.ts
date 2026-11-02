import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { robotsRules } from "@/lib/seo";
export default function robots(): MetadataRoute.Robots { return robotsRules(SITE_URL); }
