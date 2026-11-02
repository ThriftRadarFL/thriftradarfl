import { getSales } from "@/lib/data";
import { PageHead } from "@/components/ui";
import SavedList from "./SavedList";
export const metadata = { title: "Saved sales", description: "Sales you've saved on this device.", alternates: { canonical: "/saved" }, robots: { index: false } };
export default async function Saved() {
  const sales = (await getSales()).map((s) => ({ slug: s.slug, title: s.title, city: s.city, first: s.days[0]?.date ?? "", last: s.days.at(-1)?.date ?? "" }));
  return <div><PageHead title="Saved sales" sub="Your shortlist — stored in this browser only, no account needed" /><SavedList sales={sales} /><p className="mt-3 text-sm"><a href="/plan" className="link">Plan a driving route through your saved sales →</a></p></div>;
}
