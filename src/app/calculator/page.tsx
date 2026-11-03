import Link from "next/link";
import { PageHead } from "@/components/ui";
import { getPrices } from "@/lib/prices";
import Calc from "./Calc";
export const metadata = { title: "Is It Worth It? Resale Profit Calculator", description: "Work out net profit, margin and ROI on a thrift flip after eBay fees, shipping and packaging.", alternates: { canonical: "/calculator" } };
export default async function Calculator({ searchParams }: { searchParams: Promise<{ item?: string }> }) {
  const { item } = await searchParams;
  return (<div><PageHead title="Is it worth it?" sub="Profit calculator for thrift flips. Sale prices can be prefilled from the price tracker." />
    <Calc items={getPrices()} initial={typeof item === "string" ? item : undefined} />
    <p className="mt-3 text-xs text-gray-600">See the <Link href="/prices" className="text-royal underline">resale price tracker</Link> for sold medians and sources.</p></div>);
}
