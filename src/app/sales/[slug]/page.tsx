import { range12 } from "@/lib/time";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSale, citySlug } from "@/lib/data";
import { SITE_URL } from "@/lib/site";
import { saleJsonLd } from "@/lib/jsonld";
import { saleEnded } from "@/lib/seo";
import { todayET } from "@/lib/cities";
import { PageHead, DayBox, Discount, typeLabel } from "@/components/ui";
import FavButton from "@/components/FavButton";
import AddToRoute from "@/components/AddToRoute";
import ShareButtons from "@/components/ShareButtons";
import { cleanTags, TAG_LABEL, FLIP_TIPS, ebaySoldUrl } from "@/lib/flip-tips";
export const dynamic = "force-dynamic"; // read-after-write: admin edits must show immediately
type P = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: P) {
  const s = await getSale((await params).slug); if (!s) return { title: "Sale not found", robots: { index: false } };
  const description = `${typeLabel[s.type] ?? "Sale"} in ${s.city}, FL · ${s.days.length} day${s.days.length > 1 ? "s" : ""} starting ${s.days[0]?.date}. Hours, discounts and add-to-calendar.`;
  // Recurring sales (e.g. weekly auctions) share a title, so the first date keeps <title> unique per listing.
  const first = s.days[0]?.date ? new Date(s.days[0].date + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }) : "";
  return { title: `${s.title} · ${s.city}, FL${first ? ` · ${first}` : ""}`, description, alternates: { canonical: `/sales/${s.slug}` }, ...(saleEnded(s, todayET()) ? { robots: { index: false, follow: true } } : {}),
    openGraph: { type: "article", title: s.title, description, url: `/sales/${s.slug}` }, twitter: { card: "summary_large_image", title: s.title, description } };
}
export default async function Sale({ params }: P) {
  const { slug } = await params; const s = await getSale(slug); if (!s) notFound();
  const tags = cleanTags(s.tags ?? []); const url = `${SITE_URL}/sales/${s.slug}`; const maps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${s.city}, FL ${s.zip}`)}`;
  return (<div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(saleJsonLd(s)).replace(/</g, "\\u003c") }} />
    <PageHead title={s.title} sub={`${typeLabel[s.type] ?? s.type} · ${s.city}, FL ${s.zip}`} />
    <nav aria-label="Breadcrumb" className="-mt-2 mb-3 truncate text-xs text-gray-600"><Link href="/" className="hover:underline">Home</Link> › <Link href="/sales" className="hover:underline">Sales</Link> › <span aria-current="page">{s.title}</span></nav>
    {saleEnded(s, todayET()) && <div role="status" className="mb-4 border-l-4 border-cta bg-white p-3 text-sm shadow-sm"><b>This sale has ended.</b> See <Link href={`/city/${citySlug(s.city)}`} className="font-bold text-royal underline">upcoming sales in {s.city}</Link> or <Link href="/sales" className="font-bold text-royal underline">all upcoming sales</Link>.</div>}
    <div className="grid gap-4 md:grid-cols-3">
      <div className="space-y-4 md:col-span-2">
        <section className="panel"><h2 className="panel-head">Sale schedule</h2>
          <ul>{s.days.map((d) => <li key={d.date} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line px-4 py-3 last:border-0">
            <DayBox date={d.date} /><span className="font-bold">{range12(d.start, d.end)}</span><span className="ml-auto"><Discount pct={d.discountPct} /></span></li>)}</ul></section>
        {tags.length > 0 && <section className="panel"><h2 className="panel-head">Items to look for</h2>
          <ul className="flex flex-wrap gap-1.5 border-b border-line p-3">{tags.map((t) => <li key={t}><Link href={`/search?q=${encodeURIComponent(t)}`} className="pill bg-royal hover:bg-royal-dark">{TAG_LABEL[t]}</Link></li>)}</ul>
          <div className="divide-y divide-line">{tags.map((t) => <div key={t} className="p-4 text-sm"><h3 className="font-bold text-royal">Flip tip · {TAG_LABEL[t]}</h3><p className="mt-1">{FLIP_TIPS[t]}</p>
            <a href={ebaySoldUrl(`${TAG_LABEL[t]} ${t === "mid-century" ? "furniture" : ""}`.trim())} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-xs text-royal underline">Check recent eBay sold prices ↗</a></div>)}</div>
          <p className="border-t border-line px-4 py-2 text-[11px] text-gray-600">Tags come from the listing title/description. Tips are general resale know-how, not price guarantees.</p></section>}
        {s.description && <section className="panel"><h2 className="panel-head">About this sale</h2><p className="whitespace-pre-line p-4 text-sm">{s.description}</p></section>}
      </div>
      <aside className="panel self-start"><h2 className="panel-head">Details</h2><div className="space-y-3 p-4 text-sm">
        <div><div className="text-xs font-bold uppercase text-gray-600">Payment</div>{s.paymentMethods.join(", ") || "Ask the seller"}</div>
        <div><div className="text-xs font-bold uppercase text-gray-600">Where</div>{s.city}, FL {s.zip} · <a href={maps} target="_blank" rel="noopener noreferrer" className="link">Open in Google Maps</a>
          <p className="text-xs text-gray-600">Exact address is usually released by the seller shortly before the sale.</p></div>
        {s.sourceUrl ? <a className="btn-red block text-center" href={s.sourceUrl} target="_blank" rel="noopener noreferrer">Original listing ↗</a>
          : <p className="text-xs text-gray-600">Submitted directly — no external listing.</p>}
        <a className="btn-gray block text-center" href={`/api/ics/${s.slug}`} download>Add to calendar (.ics)</a>
        {!saleEnded(s, todayET()) && <AddToRoute slug={s.slug} day={s.days.find((d) => d.date >= todayET())?.date} />}
        <FavButton slug={s.slug} title={s.title} />
        <ShareButtons url={url} title={`${s.title} · ${s.city}, FL`} /></div></aside>
    </div></div>);
}
