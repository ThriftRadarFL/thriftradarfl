import Link from "next/link";
import Image from "next/image";
const links = [["/", "This Week"], ["/today", "Today"], ["/map", "Map"], ["/calendar", "Calendar"], ["/weekend", "Weekend"], ["/stores", "Stores"], ["/deals", "Deal Days"], ["/city", "Cities"], ["/saved", "♥ Saved"], ["/plan", "Route"], ["/digest", "Digest"]];
export default function Nav() {
  return (<header>
    <div className="bg-royal-dark text-white"><div className="mx-auto flex max-w-[1160px] flex-wrap items-center gap-2 px-4 py-3">
      <Link href="/" aria-label="ThriftRadarFL home" className="shrink-0"><Image src="/logo.svg" alt="ThriftRadar FL" width={176} height={26} priority unoptimized className="block h-auto w-[140px] sm:w-[176px]" /></Link>
      <span className="ml-2 hidden text-xs text-blue-100 lg:inline">Central Florida estate sales, auctions &amp; thrift deal days</span>
      <form action="/search" role="search" className="order-last flex w-full gap-1 sm:order-none sm:ml-auto sm:w-auto"><label htmlFor="nav-q" className="sr-only">Search sales and stores</label>
        <input id="nav-q" name="q" type="search" placeholder="Search sales & stores" className="min-w-0 flex-1 rounded-sm border border-white/30 bg-white px-2 py-1.5 text-sm text-ink sm:w-56" />
        <button className="btn-gray px-3 py-1.5 text-sm">Go</button></form>
      <Link href="/submit" className="ml-auto hidden text-sm font-bold text-white underline-offset-2 hover:underline sm:ml-0 sm:inline">Submit a sale</Link>
      <Link href="/digest" className="btn-red ml-auto text-sm sm:ml-0">Get the Digest</Link></div></div>
    <nav aria-label="Main" className="border-b border-[#a9b2bf] bg-gradient-to-b from-[#f7f8fa] to-[#d5dae1]"><div className="mx-auto flex max-w-[1160px] overflow-x-auto whitespace-nowrap px-4 text-sm">
      {links.map(([h, l]) => <Link key={h} href={h} className="shrink-0 border-r border-[#b8c0cb] px-3 py-2.5 font-bold text-ink first:border-l hover:bg-white hover:text-royal sm:px-4">{l}</Link>)}
      <Link href="/admin" className="ml-auto px-3 py-2.5 text-gray-600" rel="nofollow">Admin</Link></div></nav>
  </header>);
}
