"use client";
import { useState } from "react";
import { profit, thriftRange, thriftMid, type PriceItem } from "@/lib/prices";
const money = (n: number) => `${n < 0 ? "-" : ""}$${Math.abs(n).toFixed(2)}`;
export default function Calc({ items, initial }: { items: PriceItem[]; initial?: string }) {
  const start = items.find((i) => i.slug === initial);
  const [v, setV] = useState({ item: start?.slug ?? "", buy: thriftMid(start?.estThrift ?? null)?.toFixed(2) ?? "", sale: start?.median?.toString() ?? "", shipping: "", packaging: "", feePct: "13.25", feeFixed: "0.40" });
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setV((s) => ({ ...s, [k]: e.target.value }));
  const n = (s: string) => Math.max(0, parseFloat(s) || 0);
  const r = profit({ buy: n(v.buy), sale: n(v.sale), shipping: n(v.shipping), packaging: n(v.packaging), feePct: n(v.feePct), feeFixed: n(v.feeFixed) });
  const pick = (e: React.ChangeEvent<HTMLSelectElement>) => { const it = items.find((i) => i.slug === e.target.value); const mid = thriftMid(it?.estThrift ?? null); setV((s) => ({ ...s, item: e.target.value, sale: it?.median != null ? String(it.median) : s.sale, buy: mid !== null ? mid.toFixed(2) : s.buy })); };
  const field = (k: keyof typeof v, l: string, hint?: string) => <label className="block text-sm font-bold">{l}<input inputMode="decimal" type="number" min="0" step="0.01" value={v[k]} onChange={set(k)} name={k} className="mt-1 block w-full rounded-sm border border-line px-2 py-1.5 font-normal" />{hint && <span className="text-xs font-normal text-gray-600">{hint}</span>}</label>;
  const withData = items.filter((i) => i.median !== null); const picked = items.find((i) => i.slug === v.item);
  return (<div className="grid gap-4 md:grid-cols-2">
    <div className="panel"><div className="panel-head">Your numbers</div><div className="space-y-3 p-4">
      <label className="block text-sm font-bold">Prefill sale price from tracker<select value={v.item} onChange={pick} className="mt-1 block w-full rounded-sm border border-line px-2 py-1.5 font-normal"><option value="">— Pick an item —</option>{withData.map((i) => <option key={i.slug} value={i.slug}>{i.item} (${i.median!.toFixed(2)})</option>)}</select>
        <span className="text-xs font-normal text-gray-600">Only items with verified sold data are listed.</span></label>
      {field("buy", "Buy cost ($)", picked?.estThrift ? `Prefilled with the midpoint of est. thrift cost ${thriftRange(picked.estThrift)} (low confidence). Enter what you actually paid.` : undefined)}{field("sale", "Sale price ($)")}{field("shipping", "Shipping you pay ($)")}{field("packaging", "Packaging ($)")}
      <fieldset className="rounded-sm border border-line bg-paper p-3"><legend className="px-1 text-xs font-bold uppercase text-gray-700">Editable assumption: eBay fees</legend>
        <div className="grid grid-cols-2 gap-2">{field("feePct", "Fee % of sale")}{field("feeFixed", "Per-order fee ($)")}</div>
        <p className="mt-1 text-xs text-gray-600">Default 13.25% + $0.40 per order is a typical eBay final value fee; it varies by category and seller status. Adjust to match yours.</p></fieldset></div></div>
    <div className="panel" aria-live="polite"><div className="panel-head">Is it worth it?</div><div className="space-y-2 p-4">
      <p className="flex justify-between"><span>Fees</span><b data-testid="fees">{money(r.fees)}</b></p>
      <p className="flex justify-between text-lg"><span>Net profit</span><b className={r.net >= 0 ? "text-green-700" : "text-cta"} data-testid="net">{money(r.net)}</b></p>
      <p className="flex justify-between"><span>Margin (of sale)</span><b>{r.margin === null ? "—" : `${r.margin.toFixed(1)}%`}</b></p>
      <p className="flex justify-between"><span>ROI (on buy + packaging)</span><b>{r.roi === null ? "—" : `${r.roi.toFixed(1)}%`}</b></p>
      <p className={`mt-3 rounded-sm px-3 py-2 text-center font-bold text-white ${r.net > 0 ? "bg-gradient-to-b from-green-600 to-green-800" : "bg-gradient-to-b from-cta to-cta-dark"}`}>{n(v.sale) === 0 ? "Enter a sale price" : r.net > 0 ? "Worth it" : "Pass on it"}</p>
      <p className="text-xs text-gray-600">Calculated in your browser. Nothing is saved or sent.</p></div></div></div>);
}
