import Link from "next/link";
import Image from "next/image";
const links = [["/", "This Week"], ["/map", "Map"], ["/stores", "Stores"], ["/deals", "Deal Days"], ["/city/port-orange", "Cities"], ["/digest", "Digest"]];
export default function Nav() {
  return (<header>
    <div className="bg-royal-dark text-white"><div className="mx-auto max-w-[1160px] flex items-center px-4 py-3">
      <Link href="/" aria-label="ThriftRadarFL home" className="shrink-0"><Image src="/logo.svg" alt="ThriftRadar FL" width={176} height={26} priority unoptimized className="block h-auto w-[140px] sm:w-[176px]" /></Link>
      <span className="ml-4 hidden sm:inline text-xs text-blue-200">Central Florida estate sales, auctions &amp; thrift deal days</span>
      <Link href="/digest" className="btn-red ml-auto text-sm">Get the Digest</Link></div></div>
    <nav className="bg-gradient-to-b from-[#f7f8fa] to-[#d5dae1] border-b border-[#a9b2bf]"><div className="mx-auto max-w-[1160px] flex overflow-x-auto whitespace-nowrap px-4 text-sm">
      {links.map(([h, l]) => <Link key={h} href={h} className="shrink-0 px-3 sm:px-4 py-2.5 font-bold text-ink border-r border-[#b8c0cb] first:border-l hover:bg-white hover:text-royal">{l}</Link>)}
      <Link href="/admin" className="ml-auto px-3 py-2.5 text-gray-500">Admin</Link></div></nav>
  </header>);
}
