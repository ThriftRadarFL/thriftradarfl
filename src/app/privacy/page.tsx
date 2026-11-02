import Link from "next/link";
import Prose from "@/components/Prose";
export const metadata = { title: "Privacy", description: "What ThriftRadarFL collects and why.", alternates: { canonical: "/privacy" } };
export default function Privacy() {
  return (<Prose title="Privacy policy" sub="Last updated November 2, 2026">
    <p>We collect as little as possible.</p>
    <h2>What we collect</h2><ul>
      <li><b>Digest signup:</b> your email address and chosen area, used only to send the weekly digest.</li>
      <li><b>Sale submissions and contact messages:</b> the details and email you provide, used to review your sale or reply to you.</li>
      <li><b>Saved sales:</b> stored only in your own browser (localStorage). We never see them.</li>
      <li><b>Server logs:</b> standard request logs (IP, page, time) kept briefly for security and rate limiting.</li></ul>
    <h2>What we don&apos;t do</h2><p>We don&apos;t sell or share your email, use advertising trackers, or set cookies for visitors. The only cookie is a login cookie for site administrators.</p>
    <h2>Service providers</h2><p>Emails are delivered by an email provider (Resend) and the site is hosted by a cloud host; they process data only to provide those services. The map uses MapTiler tiles, which receive your IP address when map tiles load.</p>
    <h2>Your choices</h2><p>Unsubscribe from any digest with the link in the email. To have your data deleted, <Link href="/contact">contact us</Link>.</p>
  </Prose>);
}
