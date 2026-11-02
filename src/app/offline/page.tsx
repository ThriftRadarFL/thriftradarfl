import Link from "next/link";
import { PageHead } from "@/components/ui";
export const metadata = { title: "Offline", robots: { index: false } };
export default function Offline() {
  return (<div><PageHead title="You're offline" sub="No connection right now" />
    <div className="panel p-4 text-sm space-y-2"><p>Sales you&apos;ve saved (♡) are available offline — open them from <Link href="/saved" className="link">Saved</Link>.</p>
      <p>Everything else will load again when you&apos;re back online.</p></div></div>);
}
