import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import Nav from "@/components/Nav";
import Pwa from "@/components/Pwa";
import { SITE_URL, SITE_NAME } from "@/lib/site";
import { siteJsonLd } from "@/lib/jsonld";
const description = "Weekly map + calendar of estate sales, auctions, thrift deal days and Goodwill bins in Central Florida.";
export const viewport = { themeColor: "#072a66", width: "device-width", initialScale: 1 };
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "ThriftRadarFL — Central Florida estate sales & thrift deals", template: `%s | ${SITE_NAME}` },
  description, applicationName: SITE_NAME, alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", url: "/", title: "ThriftRadarFL", description, },
  twitter: { card: "summary_large_image", title: "ThriftRadarFL", description },
  icons: { apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "ThriftRadar", statusBarStyle: "black-translucent" },
};
const cities = [["port-orange", "Port Orange"], ["daytona-beach", "Daytona Beach"], ["deland", "DeLand"], ["new-smyrna-beach", "New Smyrna Beach"], ["ormond-beach", "Ormond Beach"], ["orlando", "Orlando"]];
const pages = [["/about", "About"], ["/faq", "FAQ"], ["/submit", "Submit a sale"], ["/contact", "Contact"], ["/privacy", "Privacy"], ["/terms", "Terms"], ["/sales", "All sales"], ["/search", "Search"]];
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (<html lang="en"><body className="antialiased">
    <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-white focus:px-3 focus:py-2 focus:font-bold focus:text-royal">Skip to content</a>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd()) }} />
    <Nav /><main id="main" tabIndex={-1} className="mx-auto max-w-[1160px] px-4 pt-4 pb-6 focus:outline-none">{children}</main>
    <footer className="border-t border-line bg-white print:hidden"><div className="mx-auto grid max-w-[1160px] gap-4 px-4 py-5 text-sm sm:grid-cols-3">
      <div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-horizontal.webp" alt={SITE_NAME} width={409} height={112} loading="lazy" className="h-12 w-auto" /><p className="mt-1 text-xs text-gray-600">Estate sales, auctions and thrift deal days across Volusia &amp; Orange counties. Always confirm details with the original listing.</p></div>
      <nav aria-label="Site"><div className="mb-1 text-xs font-bold uppercase text-gray-600">Site</div><ul className="grid grid-cols-2 gap-1">{pages.map(([h, l]) => <li key={h}><Link href={h} className="hover:text-royal hover:underline">{l}</Link></li>)}</ul></nav>
      <nav aria-label="Cities"><div className="mb-1 text-xs font-bold uppercase text-gray-600">Cities</div><ul className="grid grid-cols-2 gap-1">{cities.map(([k, l]) => <li key={k}><Link href={`/city/${k}`} className="hover:text-royal hover:underline">{l}</Link></li>)}<li><Link href="/city" className="font-bold text-royal hover:underline">All cities →</Link></li></ul></nav>
    </div><p className="mx-auto max-w-[1160px] px-4 pb-4 text-xs text-gray-600">© {new Date().getFullYear()} {SITE_NAME} · Not affiliated with Goodwill, EstateSales.net or any listed seller.</p></footer><Pwa /></body></html>);
}
