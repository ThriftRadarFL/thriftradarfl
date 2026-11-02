import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
export const metadata: Metadata = { title: "ThriftRadarFL — Central Florida estate sales & thrift deals", description: "Weekly map + calendar of estate sales, auctions, thrift deal days and Goodwill bins in Central Florida." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="antialiased"><Nav /><main className="mx-auto max-w-[1160px] px-4 pt-4 pb-6">{children}</main><footer className="mx-auto max-w-[1160px] px-4 pb-6 text-[11px] text-gray-400">ThriftRadarFL · listings are demo data while sources are verified</footer></body></html>);
}
