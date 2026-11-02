import { notFound } from "next/navigation";
import { getVenue } from "@/lib/data";
import { PageHead, typeLabel } from "@/components/ui";
export default async function Store({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const v = await getVenue(slug); if (!v) notFound();
  const hours = v.hoursJson ? Object.entries(v.hoursJson as unknown as Record<string, string>).filter(([, h]) => h) : [];
  const q = encodeURIComponent(`${v.address}, ${v.city} FL ${v.zip}`);
  return (<div><PageHead title={v.name} sub={`${typeLabel[v.type] ?? v.type} · ${v.city}, FL`} />
    <div className="grid gap-4 md:grid-cols-3">
      <div className="panel md:col-span-2"><div className="panel-head">Location</div><div className="p-4 space-y-2">
        <p className="text-lg">{v.address}<br />{v.city}, FL {v.zip}</p>{v.phone && <p className="font-bold">{v.phone}</p>}
        <p className="text-sm text-gray-600 border-l-4 border-coral pl-3">{v.notes}</p>
        <a className="btn-red mt-2" href={`https://maps.google.com/?q=${q}`}>Get Directions</a></div></div>
      <div className="panel"><div className="panel-head">Hours</div><table className="w-full text-sm">
        <tbody>{hours.length ? hours.map(([k, h]) => <tr key={k} className="border-b border-line"><td className="px-4 py-2 font-bold capitalize">{k}</td><td className="px-4 py-2">{h}</td></tr>)
          : <tr><td className="px-4 py-3 text-gray-500">Hours not verified yet</td></tr>}</tbody></table></div>
    </div></div>);
}
