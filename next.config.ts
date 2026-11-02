import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ship data/*.json with serverless functions so JSON mode works read-only on Vercel before Postgres is wired.
  outputFileTracingIncludes: { "/**": ["./data/sales.json", "./data/venues.json"] },
  async headers() {
    return [{ source: "/(.*)", headers: [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
    ] }, { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
};

export default nextConfig;
