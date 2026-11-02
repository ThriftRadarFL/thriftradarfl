import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return { name: "ThriftRadarFL — Central Florida estate sales & thrift deals", short_name: "ThriftRadar", description: "Estate sales, auctions and thrift deal days across Central Florida.",
    start_url: "/?source=pwa", scope: "/", display: "standalone", background_color: "#eef1f5", theme_color: "#072a66", orientation: "portrait",
    icons: [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }],
    shortcuts: [{ name: "Today", url: "/today" }, { name: "Saved sales", url: "/saved" }, { name: "Route planner", url: "/plan" }, { name: "Map", url: "/map" }] };
}
