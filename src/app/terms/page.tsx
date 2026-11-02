import Link from "next/link";
import Prose from "@/components/Prose";
export const metadata = { title: "Terms of use", description: "Terms for using ThriftRadarFL.", alternates: { canonical: "/terms" } };
export default function Terms() {
  return (<Prose title="Terms of use" sub="Last updated November 2, 2026">
    <h2>Listings are informational</h2><p>Sale dates, times, discounts and store schedules come from third parties and can change without notice. Always confirm with the original listing or the store before you go. ThriftRadarFL isn&apos;t responsible for sales that are changed, cancelled or different from their listing.</p>
    <h2>No affiliation</h2><p>We are not affiliated with any seller, estate-sale company, auction house or thrift chain listed on the site. Names and trademarks belong to their owners.</p>
    <h2>Submissions</h2><p>By submitting a sale you confirm you have the right to publicize it and that the details are accurate. We may edit, decline or remove any submission.</p>
    <h2>Acceptable use</h2><p>Don&apos;t scrape the site at high volume, submit spam, or attempt to disrupt the service. The calendar feed and <code>/api</code> endpoints are fine for personal use.</p>
    <h2>Contact</h2><p>Questions? <Link href="/contact">Get in touch</Link>.</p>
  </Prose>);
}
