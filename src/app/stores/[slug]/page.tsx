import { notFound } from "next/navigation";
import { getVenue } from "@/lib/data";
export default async function Store({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const v = await getVenue(slug); if (!v) notFound();
  return (<div className="space-y-2"><h1 className="text-2xl font-bold">{v.name}</h1>
    <p>{v.address}, {v.city} FL {v.zip}</p>{v.phone && <p>{v.phone}</p>}
    <pre className="text-sm">{JSON.stringify(v.hoursJson)}</pre><p className="text-sm text-gray-600">{v.notes}</p>
    <a className="text-blue-600 underline" href={`https://maps.google.com/?q=${encodeURIComponent(`${v.address}, ${v.city} FL ${v.zip}`)}`}>Directions</a></div>);
}
