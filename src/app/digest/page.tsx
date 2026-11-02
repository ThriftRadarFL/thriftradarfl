import { PageHead } from "@/components/ui";
export default function Digest() {
  return (<div><PageHead title="Weekly Hot Sales Digest" sub="The best estate sales and half-off days, every Thursday" />
    <div className="grid gap-4 md:grid-cols-2">
      <div className="panel"><div className="panel-head">Sign up</div><form className="p-4 space-y-3">
        <label className="block text-sm font-bold">Email<input type="email" required className="mt-1 block w-full border border-line px-3 py-2" placeholder="you@example.com" /></label>
        <label className="block text-sm font-bold">Area<select className="mt-1 block w-full border border-line px-3 py-2"><option>All Central Florida</option><option>Orlando</option><option>Daytona / Port Orange</option><option>DeLand</option></select></label>
        <button type="button" className="btn-red w-full">Subscribe</button><p className="text-xs text-gray-500">Signup saving is not wired yet.</p></form></div>
      <div className="panel"><div className="panel-head">What you get</div><ul className="p-4 space-y-2 text-sm list-disc pl-8">
        <li>Top 10 estate sales by weekend</li><li>Half-off and color-tag days</li><li>Outlet bin restock tips</li><li>New auctions in your area</li></ul></div>
    </div></div>);
}
