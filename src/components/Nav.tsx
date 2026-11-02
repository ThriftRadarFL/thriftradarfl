import Link from "next/link";
const links = [["/", "This Week"], ["/map", "Map"], ["/stores", "Stores"], ["/deals", "Deal Days"], ["/digest", "Digest"]];
export default function Nav() {
  return (<header>
    <div className="bg-royal-dark text-white"><div className="mx-auto max-w-[1160px] flex items-center px-4 py-3">
      <Link href="/" aria-label="ThriftRadarFL home" className="shrink-0">{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/logo.svg" alt="ThriftRadar FL" width={176} height={26} className="block h-auto w-[176px]" /></Link>
      <span className="ml-4 hidden sm:inline text-xs text-blue-200">Central Florida estate sales, auctions &amp; thrift deal days</span>
      <Link href="/digest" className="btn-red ml-auto text-sm">Get the Digest</Link></div></div>
    <nav className="bg-gradient-to-b from-[#f7f8fa] to-[#d5dae1] border-b border-[#a9b2bf]"><div className="mx-auto max-w-[1160px] flex flex-wrap px-4 text-sm">
      {links.map(([h, l]) => <Link key={h} href={h} className="px-4 py-2.5 font-bold text-ink border-r border-[#b8c0cb] first:border-l hover:bg-white hover:text-royal">{l}</Link>)}
      <Link href="/admin" className="ml-auto px-3 py-2.5 text-gray-500">Admin</Link></div></nav>
  </header>);
}
