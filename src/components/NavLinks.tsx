"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
export default function NavLinks({ links }: { links: string[][] }) {
  const path = usePathname();
  return <>{links.map(([h, l]) => { const on = h === "/" ? path === "/" : path === h || path.startsWith(h + "/");
    return <Link key={h} href={h} aria-current={on ? "page" : undefined} className={`nav-tab relative shrink-0 border-r border-[#b8c0cb] px-3 py-2.5 font-bold first:border-l sm:px-4 ${on ? "bg-white text-royal after:absolute after:inset-x-0 after:bottom-0 after:h-[3px] after:bg-cta" : "text-ink hover:bg-white hover:text-royal"}`}>{l}</Link>; })}</>;
}
