import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Nav from "@/components/Nav";
import { SITE_URL, SITE_NAME } from "@/lib/site";
const description = "Weekly map + calendar of estate sales, auctions, thrift deal days and Goodwill bins in Central Florida.";
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "ThriftRadarFL — Central Florida estate sales & thrift deals", template: `%s | ${SITE_NAME}` },
  description, applicationName: SITE_NAME, alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", url: "/", title: "ThriftRadarFL", description, images: [{ url: "/logo-lockup.jpg" }] },
  twitter: { card: "summary", title: "ThriftRadarFL", description },
  icons: { icon: "/favicon.ico" },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="antialiased"><Nav /><main className="mx-auto max-w-[1160px] px-4 pt-4 pb-6">{children}</main><footer className="mx-auto max-w-[1160px] px-4 pb-6 text-[11px] text-gray-400"><nav className="mb-1 flex flex-wrap gap-x-3"><Link href="/city/port-orange">Port Orange</Link><Link href="/city/daytona-beach">Daytona Beach</Link><Link href="/city/deland">DeLand</Link><Link href="/city/new-smyrna-beach">New Smyrna Beach</Link><Link href="/city/ormond-beach">Ormond Beach</Link></nav>ThriftRadarFL · listings are demo data while sources are verified · always confirm with the original listing</footer></body></html>);
}
