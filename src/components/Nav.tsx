import Link from "next/link";
const links = [["/", "This Week"], ["/map", "Map"], ["/stores", "Stores"], ["/deals", "Deal Days"], ["/digest", "Digest"]];
export default function Nav() {
  return (
    <nav className="flex flex-wrap gap-4 border-b px-4 py-3 text-sm">
      <Link href="/" className="font-bold">📡 ThriftRadarFL</Link>
      {links.map(([h, l]) => <Link key={h} href={h} className="hover:underline">{l}</Link>)}
      <Link href="/admin" className="ml-auto text-gray-500">Admin</Link>
    </nav>
  );
}
