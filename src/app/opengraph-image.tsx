import { ogCard, ogSize } from "@/lib/og";
export const size = ogSize; export const contentType = "image/png"; export const alt = "ThriftRadarFL — Central Florida estate sales & thrift deal days";
export default function Image() { return ogCard({ kicker: "Central Florida", title: "Estate sales, auctions & thrift deal days", sub: "Map · calendar · weekly digest" }); }
