import Link from "next/link";
import Prose from "@/components/Prose";
const faqs: [string, React.ReactNode, string][] = [
  ["Is ThriftRadarFL free?", <>Yes. Browsing, saving sales and the weekly digest are all free.</>, "Yes. Browsing, saving sales and the weekly digest are all free."],
  ["Why don't some sales show a street address?", <>Estate-sale companies usually release the exact address a day or two before the sale. Use the <b>Original listing</b> link on the sale page for the latest details.</>, "Estate-sale companies usually release the exact address a day or two before the sale. Use the Original listing link for the latest details."],
  ["What does \"unverified\" mean on deal days?", <>We haven&apos;t confirmed that schedule with the store yet. Stores change color-tag and restock days often, so check signage or call ahead.</>, "We haven't confirmed that schedule with the store yet. Check signage or call ahead."],
  ["What is Goodwill CFL Color of the Week?", <>Half off most color-tagged clothing, shoes and wares at Goodwill Industries of Central Florida <b>retail</b> stores. The color refreshes Sundays and is posted in store only; seniors 55+ get 10% Mondays and military 10% Wednesdays; discounts don&apos;t stack. Details: <Link href="/goodwill-cfl" aria-label="Goodwill CFL deals page">Goodwill CFL deals</Link>.</>, "Half off most color-tagged clothing, shoes and wares at Goodwill CFL retail stores. Color refreshes Sundays (posted in store). Seniors 55+ 10% Mondays; military 10% Wednesdays; no stacking."],
  ["How do I save a sale?", <>Tap <b>♡ Save</b> on any sale. Saved sales live in your browser (no account needed) on the <Link href="/saved" aria-label="Saved sales page">Saved</Link> page.</>, "Tap Save on any sale. Saved sales are stored in your browser on the Saved page."],
  ["Can I add sales to my calendar?", <>Each sale has an <b>Add to calendar (.ics)</b> button, and the <Link href="/calendar" aria-label="Calendar feed page">calendar page</Link> has a feed you can subscribe to in Google Calendar, Apple Calendar or Outlook.</>, "Each sale has an Add to calendar button, and the calendar page has a subscribable feed."],
  ["I'm running a sale. How do I list it?", <>Use <Link href="/submit" aria-label="Submit a sale form">Submit a sale</Link>. We review every submission before it goes live, usually within a day.</>, "Use Submit a sale. We review every submission before it goes live."],
  ["How do I unsubscribe from the digest?", <>Every digest email has a one-click unsubscribe link at the bottom.</>, "Every digest email has a one-click unsubscribe link."],
  ["Something is wrong or out of date.", <>Please <Link href="/contact" aria-label="Contact us form">contact us</Link> with the sale or store name and we&apos;ll fix it.</>, "Please contact us with the sale or store name and we'll fix it."],
];
export const metadata = { title: "FAQ", description: "Answers about estate sale listings, Goodwill CFL Color of the Week, deal days, saving sales, calendar feeds and the ThriftRadarFL digest.", alternates: { canonical: "/faq" } };
export default function Faq() {
  const ld = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map(([q, , a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) };
  return (<Prose title="Frequently asked questions"><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
    {faqs.map(([q, a]) => <details key={q} className="border-b border-line py-2 last:border-0"><summary className="cursor-pointer font-bold text-royal">{q}</summary><p className="mt-1">{a}</p></details>)}</Prose>);
}
