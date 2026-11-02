import { PageHead, typeLabel } from "@/components/ui";
import { Field, Honeypot, Notice, inp } from "@/components/FormBits";
import { SALE_TYPES } from "@/lib/validate";
import { CITIES } from "@/lib/data";
import { TAGS, TAG_LABEL } from "@/lib/flip-tips";
import { submitSale } from "./actions";
export const metadata = { title: "Submit a sale", description: "List your estate sale, yard sale or auction on ThriftRadarFL for free. Every submission is reviewed before it goes live.", alternates: { canonical: "/submit" } };
export default async function Submit({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  const sp = await searchParams;
  return (<div><PageHead title="Submit a sale" sub="Free listing for estate sales, yard sales and auctions in Central Florida · reviewed before publishing" />
    <Notice ok={sp.ok} err={sp.err} okText="Thanks! Your sale is in the review queue. We'll publish it once it's checked (usually within a day)." />
    <form action={submitSale} className="panel max-w-2xl space-y-3 p-5"><Honeypot />
      <Field name="title" label="Sale title" req maxLength={160} placeholder="e.g. Mid-century estate sale — whole house" />
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block text-xs font-bold">Type<select name="type" defaultValue="estate" className={inp}>{SALE_TYPES.filter((t) => t !== "thrift" && t !== "outlet_bins").map((t) => <option key={t} value={t}>{typeLabel[t]}</option>)}</select></label>
        <label className="block text-xs font-bold">City<span className="text-red-700" aria-hidden="true"> *</span><input name="city" required list="cities" className={inp} /><datalist id="cities">{Object.values(CITIES).concat("Orlando").map((c) => <option key={c} value={c} />)}</datalist></label>
        <Field name="zip" label="ZIP" pattern="\d{5}" title="5-digit ZIP" inputMode="numeric" /></div>
      <fieldset className="space-y-2"><legend className="text-xs font-bold">Dates &amp; hours <span className="font-normal text-gray-600">(first day required; discount % optional)</span></legend>
        {[1, 2, 3].map((i) => <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Field name={`date${i}`} label={`Day ${i} date`} type="date" req={i === 1} /><Field name={`start${i}`} label="Opens" type="time" defaultValue="08:00" />
          <Field name={`end${i}`} label="Closes" type="time" defaultValue="14:00" /><Field name={`pct${i}`} label="Discount %" type="number" min={0} max={100} defaultValue={0} /></div>)}</fieldset>
      <fieldset><legend className="text-xs font-bold">Items people should look for <span className="font-normal text-gray-600">(optional)</span></legend>
        <div className="mt-1 flex flex-wrap gap-1.5">{TAGS.map((t) => <label key={t} className="flex min-h-9 items-center gap-1.5 rounded-sm border border-line bg-white px-2 text-xs"><input type="checkbox" name="tags" value={t} />{TAG_LABEL[t]}</label>)}</div></fieldset>
      <Field name="paymentMethods" label="Payment accepted" defaultValue="cash" hint="Comma-separated, e.g. cash, card, Venmo" />
      <Field name="sourceUrl" label="Listing link (optional)" type="url" placeholder="https://" />
      <label className="block text-xs font-bold">Description<textarea name="description" rows={4} maxLength={2000} className={inp} placeholder="Highlights: furniture, tools, jewelry…" /></label>
      <Field name="email" label="Your email (not published)" type="email" req autoComplete="email" hint="Only used if we need to confirm details." />
      <button className="btn-red">Submit for review</button></form></div>);
}
