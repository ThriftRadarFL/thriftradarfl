import Link from "next/link";
import Prose from "@/components/Prose";
export const metadata = { title: "About", description: "ThriftRadarFL is a free weekly map and calendar of estate sales, auctions and thrift deal days in Central Florida.", alternates: { canonical: "/about" } };
export default function About() {
  return (<Prose title="About ThriftRadarFL" sub="One page for every estate sale, auction and thrift deal day worth the drive">
    <p>ThriftRadarFL collects estate sales, auctions, yard sales and thrift-store deal days across Volusia and Orange counties — Port Orange, Daytona Beach, DeLand, New Smyrna Beach, Ormond Beach and Orlando — so you can plan a Saturday route in a couple of minutes instead of an hour of tab-hopping.</p>
    <h2>What you&apos;ll find</h2><ul>
      <li><Link href="/">This week&apos;s sales</Link>, <Link href="/today">what&apos;s open today</Link> and a <Link href="/weekend">Friday–Sunday plan</Link>.</li>
      <li><Link href="/deals">Deal days</Link>: Goodwill color-tag days, half-off days and outlet bin restocks.</li>
      <li>A <Link href="/map">map</Link>, a <Link href="/calendar">14-day calendar</Link> and a subscribable calendar feed.</li>
      <li>A free <Link href="/digest">weekly email digest</Link> of the best sales.</li></ul>
    <h2>Where the data comes from</h2><p>Listings come from public sale listings, the sellers themselves via <Link href="/submit">Submit a sale</Link>, and our own checks of store schedules. Every sale links back to its original listing. Schedules marked <i>unverified</i> haven&apos;t been confirmed with the store yet.</p>
    <h2>Independent</h2><p>ThriftRadarFL isn&apos;t affiliated with Goodwill, EstateSales.net or any seller. Spot a mistake? <Link href="/contact">Tell us</Link>.</p>
  </Prose>);
}
