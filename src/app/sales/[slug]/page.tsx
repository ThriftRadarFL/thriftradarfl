import Link from "next/link";
import { notFound } from "next/navigation";
import { getSale } from "@/lib/data";
import { SITE_URL } from "@/lib/site";
import { saleJsonLd } from "@/lib/jsonld";
import { PageHead, DayBox, Discount, typeLabel } from "@/components/ui";
import FavButton from "@/components/FavButton";
import ShareButtons from "@/components/ShareButtons";
type P = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: P) {
  const s = await getSale((await params).slug); if (!s) return { title: "Sale not found", robots: { index: false } };
  const description = `${typeLabel[s.type] ?? "Sale"} in ${s.city}, FL · ${s.days.length} day${s.days.length > 1 ? "s" : ""} starting ${s.days[0]?.date}. Hours, discounts and add-to-calendar.`;
  return { title: `${s.title} · ${s.city}, FL`, description, alternates: { canonical: `/sales/${s.slug}` },
    openGraph: { type: "article", title: s.title, description, url: `/sales/${s.slug}` }, twitter: { card: "summary_large_image", title: s.title, description } };
}
export default async function Sale({ params }: P) {
  const { slug } = await params; const s = await getSale(slug); if (!s) notFound();
  const url = `${SITE_URL}/sales/${s.slug}`; const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.city}, FL ${s.zip}`)}`;
  return (<div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(saleJsonLd(s)).replace(/</g, "\\u003c") }} />
    <nav aria-label="Breadcrumb" className="-mt-1 mb-2 text-xs text-gray-600"><Link href="/" className="hover:underline">Home</Link> › <Link href="/sales" className="hover:underline">Sales</Link> › <span aria-current="page">{s.title}</span></nav>
    <PageHead title={s.title} sub={`${typeLabel[s.type] ?? s.type} · ${s.city}, FL ${s.zip}`} />
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-4 md:col-span-2">
        <section className="panel"><h2 className="panel-head">Sale schedule</h2>
          <ul>{s.days.map((d) => <li key={d.date} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-4 py-3 last:border-0">
            <DayBox date={d.date} /><span className="font-bold">{d.start} – {d.end}</span><span className="ml-auto"><Discount pct={d.discountPct} /></span></li>)}</ul></section>
        {s.description && <section className="panel"><h2 className="panel-head">About this sale</h2><p className="whitespace-pre-line p-4 text-sm">{s.description}</p></section>}
      </div>
      <aside className="panel self-start"><h2 className="panel-head">Details</h2><div className="space-y-3 p-4 text-sm">
        <div><div className="text-xs font-bold uppercase text-gray-600">Payment</div>{s.paymentMethods.join(", ") || "Ask the seller"}</div>
        <div><div className="text-xs font-bold uppercase text-gray-600">Where</div>{s.city}, FL {s.zip} · <a href={maps} target="_blank" rel="noopener noreferrer" className="link">Open in Google Maps</a>
          <p className="text-xs text-gray-600">Exact address is usually released by the seller shortly before the sale.</p></div>
        {s.sourceUrl ? <a className="btn-red block text-center" href={s.sourceUrl} target="_blank" rel="noopener noreferrer">Original listing ↗</a>
          : <p className="text-xs text-gray-600">Submitted directly — no external listing.</p>}
        <a className="btn-gray block text-center" href={`/api/ics/${s.slug}`} download>Add to calendar (.ics)</a>
        <FavButton slug={s.slug} title={s.title} />
        <ShareButtons url={url} title={`${s.title} · ${s.city}, FL`} /></div></aside>
    </div></div>);
}
