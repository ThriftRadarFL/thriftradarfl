import DigestForm from "./DigestForm";
import { PageHead } from "@/components/ui";
export const metadata = { title: "Weekly Hot Sales Digest", description: "Free Thursday email with the best Central Florida estate sales and half-off days.", alternates: { canonical: "/digest" } };
export default function Digest() {
  return (<div><PageHead title="Weekly Hot Sales Digest" sub="The best estate sales and half-off days, every Thursday" />
    <div className="grid gap-4 md:grid-cols-2">
      <div className="panel"><div className="panel-head">Sign up</div><DigestForm /></div>
      <div className="panel"><div className="panel-head">What you get</div><ul className="p-4 space-y-2 text-sm list-disc pl-8">
        <li>Top 10 estate sales by weekend</li><li>Half-off and color-tag days</li><li>Outlet bin restock tips</li><li>New auctions in your area</li><li>Keyword alerts: an email when a new sale mentions “pyrex”, “tools”, or whatever you hunt for</li></ul></div>
    </div></div>);
}
