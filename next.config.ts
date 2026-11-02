import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // NEXT_DIST_DIR lets a production build run alongside `next dev` without clobbering .next.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  // Always render <title>/<meta> in <head> (not streamed into <body>) so every crawler and audit tool sees them.
  htmlLimitedBots: /.*/,
  // Ship data/*.json with serverless functions so JSON mode works read-only on Vercel before Postgres is wired.
  outputFileTracingIncludes: { "/**": ["./data/sales.json", "./data/venues.json"] },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders() }, { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate" }, { key: "Content-Type", value: "application/javascript; charset=utf-8" }] },
      { source: "/icons/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] }];
  },
};

export default nextConfig;
