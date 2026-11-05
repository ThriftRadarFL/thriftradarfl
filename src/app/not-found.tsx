import Link from "next/link";
export const metadata = { title: "Page not found" };
export default function NotFound() {
  return (<div className="panel mx-auto mt-8 max-w-xl"><h1 className="panel-head">404: nothing on this rack</h1>
    <div className="space-y-3 p-4 text-sm">
      <p>That page sold before you got here. Try one of these instead:</p>
      <ul className="list-disc space-y-1 pl-5">
        <li><Link className="font-bold text-royal hover:underline" href="/">Upcoming estate sales</Link></li>
        <li><Link className="font-bold text-royal hover:underline" href="/calendar">14-day calendar</Link></li>
        <li><Link className="font-bold text-royal hover:underline" href="/deals">Store deal days</Link></li>
        <li><Link className="font-bold text-royal hover:underline" href="/map">Map</Link></li>
        <li><Link className="font-bold text-royal hover:underline" href="/goodwill-cfl">Goodwill CFL deals</Link></li>
        <li><Link className="font-bold text-royal hover:underline" href="/bins">Goodwill bins &amp; outlets</Link></li>
        <li><Link className="font-bold text-royal hover:underline" href="/stores">All stores</Link></li>
      </ul></div></div>);
}
