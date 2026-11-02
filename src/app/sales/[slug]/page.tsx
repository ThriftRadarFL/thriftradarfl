import { notFound } from "next/navigation";
import { getSale } from "@/lib/data";
import { PageHead, DayBox, Discount, typeLabel } from "@/components/ui";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const s = await getSale((await params).slug); if (!s) return { title: "Sale not found" };
  return { title: `${s.title} · ${s.city}, FL`, description: `${s.days.length}-day sale in ${s.city}, FL starting ${s.days[0]?.date}. Hours, discounts and add-to-calendar.`, alternates: { canonical: `/sales/${s.slug}` } };
}
export default async function Sale({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const s = await getSale(slug); if (!s) notFound();
  const ld = { "@context": "https://schema.org", "@type": "Event", name: s.title, eventStatus: "https://schema.org/EventScheduled", eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    startDate: `${s.days[0].date}T${s.days[0].start}`, endDate: `${s.days.at(-1)!.date}T${s.days.at(-1)!.end}`, url: s.sourceUrl || undefined,
    location: { "@type": "Place", name: `${s.city}, FL`, address: { "@type": "PostalAddress", addressLocality: s.city, addressRegion: "FL", postalCode: s.zip, addressCountry: "US" }, geo: { "@type": "GeoCoordinates", latitude: s.lat, longitude: s.lng } } };
  return (<div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} /><PageHead title={s.title} sub={`${typeLabel[s.type] ?? s.type} · ${s.city}, FL ${s.zip}`} />
    <div className="grid gap-4 md:grid-cols-3">
      <div className="panel md:col-span-2"><div className="panel-head">Sale schedule</div>
        <ul>{s.days.map((d) => <li key={d.date} className="flex items-center gap-4 border-b border-line px-4 py-3 last:border-0">
          <DayBox date={d.date} /><span className="font-bold">{d.start} – {d.end}</span><span className="ml-auto"><Discount pct={d.discountPct} /></span></li>)}</ul></div>
      <div className="panel"><div className="panel-head">Details</div><div className="p-4 space-y-3 text-sm">
        <div><div className="font-bold text-gray-500 text-xs uppercase">Payment</div>{s.paymentMethods.join(", ")}</div>
        <a className="btn-red block text-center" href={s.sourceUrl}>Original Listing</a>
        <a className="btn-gray block text-center" href={`/api/ics/${s.slug}`} download>Add to Calendar (.ics)</a></div></div>
    </div></div>);
}
