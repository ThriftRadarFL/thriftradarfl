import Link from "next/link";
import Image from "next/image";
import NavLinks from "./NavLinks";
const links = [["/", "This Week"], ["/today", "Today"], ["/map", "Map"], ["/calendar", "Calendar"], ["/weekend", "Weekend"], ["/stores", "Stores"], ["/deals", "Deal Days"], ["/city", "Cities"], ["/saved", "♥ Saved"], ["/plan", "Route"], ["/digest", "Digest"]];
export default function Nav() {
  return (<header className="print:hidden">
    <div className="bg-royal-dark text-white"><div className="mx-auto flex max-w-[1160px] flex-wrap items-center gap-2 px-4 py-3">
      <Link href="/" aria-label="ThriftRadarFL home" className="shrink-0 rounded-md bg-white px-1.5 py-1 shadow-[0_1px_3px_rgba(0,0,0,0.35)] min-[360px]:px-2">
        <Image src="/logo-horizontal.webp" alt="ThriftRadarFL — Central Florida thrift &amp; estate sales" width={409} height={112} priority unoptimized className="hidden h-9 w-auto min-[360px]:block sm:h-11" />
        <Image src="/icons/mark-64.png" alt="ThriftRadarFL" width={64} height={64} priority unoptimized className="block h-8 w-8 min-[360px]:hidden" /></Link>
      
      <form action="/search" role="search" className="order-last flex w-full gap-1 sm:order-none sm:ml-auto sm:w-auto"><label htmlFor="nav-q" className="sr-only">Search sales and stores</label>
        <input id="nav-q" name="q" type="search" placeholder="Search sales & stores" className="min-w-0 flex-1 rounded-sm border border-white/30 bg-white px-2 py-1.5 text-sm text-ink sm:w-56" />
        <button className="btn-gray px-3 py-1.5 text-sm">Go</button></form>
      <Link href="/submit" className="ml-auto hidden text-sm font-bold text-white underline-offset-2 hover:underline sm:ml-0 sm:inline">Submit a sale</Link>
      <Link href="/digest" className="btn-red ml-auto text-sm sm:ml-0">Get the Digest</Link></div></div>
    <nav aria-label="Main" className="relative after:pointer-events-none after:absolute after:inset-y-0 after:right-0 after:w-6 after:bg-gradient-to-l after:from-[#d5dae1] after:to-transparent sm:after:hidden border-b border-[#a9b2bf] bg-gradient-to-b from-[#f7f8fa] to-[#d5dae1]"><div className="mx-auto flex max-w-[1160px] overflow-x-auto whitespace-nowrap px-4 text-sm">
      <NavLinks links={links} />
      <Link href="/admin" className="ml-auto px-3 py-2.5 text-gray-600" rel="nofollow">Admin</Link></div></nav>
  </header>);
}
