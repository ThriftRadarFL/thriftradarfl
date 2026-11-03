import { ogCard, ogSize } from "@/lib/og";
export const size = ogSize; export const contentType = "image/png"; export const alt = "This week's thrift deal days in Central Florida";
export default function Image() { return ogCard({ kicker: "Deal-day sheet · next 7 days", title: "This week's thrift deal days", sub: "Color tags · half-off · bin restocks · estate sales" }); }
