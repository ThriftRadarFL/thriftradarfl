import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
export const metadata: Metadata = { title: "ThriftRadarFL — Central Florida estate sales & thrift deals", description: "Weekly map + calendar of estate sales, auctions, thrift deal days and Goodwill bins in Central Florida." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="antialiased"><Nav /><main className="mx-auto max-w-4xl p-4">{children}</main></body></html>);
}
