import Link from "next/link";
import { PageHead } from "@/components/ui";
import companies from "../../../data/estate-sale-companies.json";
export const metadata = { title: "Central Florida Estate Sale Companies", description: "Directory of estate sale companies running sales around Orlando, Volusia and Flagler, with websites and phone numbers. Unconfirmed sites are marked.", alternates: { canonical: "/estate-sale-companies" } };
type Co = { name: string; city: string; phone: string | null; website: string; sourceUrl: string; profileUrl: string; verified: boolean; notes: string };
const host = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };
export default function Companies() {
  const list = [...(companies as Co[])].sort((a, b) => Number(b.verified) - Number(a.verified) || a.name.localeCompare(b.name));
  return (<div className="min-w-0 break-words"><PageHead title="Estate Sale Companies" sub={`${list.filter((c) => c.verified).length} confirmed websites · ${list.filter((c) => !c.verified).length} unconfirmed`} />
    <div className="grid gap-3 md:grid-cols-2">{list.map((c) => <section key={c.name} className="panel min-w-0"><h2 className="panel-head">{c.name}</h2><div className="space-y-1 p-4 text-sm">
      <p className="text-gray-700">{c.city}</p>
      {c.phone && <p><a className="font-bold text-royal hover:underline" href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}>{c.phone}</a></p>}
      <p><a href={c.website} target="_blank" rel="nofollow noopener noreferrer" className="font-bold text-royal underline [overflow-wrap:anywhere]">{host(c.website)}</a>{" "}
        {c.verified ? <span className="ml-1 rounded-sm bg-green-700 px-1.5 py-0.5 text-[11px] font-bold text-white">Verified site</span> : <span className="ml-1 rounded-sm bg-gray-500 px-1.5 py-0.5 text-[11px] font-bold text-white">Unconfirmed</span>}</p>
      <p className="text-xs text-gray-600">{c.notes}</p>
      <p className="text-xs"><a href={c.profileUrl} target="_blank" rel="nofollow noopener noreferrer" className="underline">Listing profile</a></p></div></section>)}</div>
    <p className="mt-3 text-xs text-gray-600">Unconfirmed means we couldn&apos;t confirm the site belongs to the company (it didn&apos;t load or details didn&apos;t match). See their <Link className="underline" href="/sales">upcoming sales</Link>. Checked 2026-11-02.</p></div>);
}
