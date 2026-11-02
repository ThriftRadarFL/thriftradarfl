import { getSales } from "@/lib/data";
import { PageHead } from "@/components/ui";
import Planner from "./Planner";
import { SITE_URL } from "@/lib/site";
export const metadata = { title: "Route planner", description: "Turn your saved estate sales into an optimized driving route with a Google Maps multi-stop link.", alternates: { canonical: "/plan" } };
export const dynamic = "force-dynamic";
export default async function Plan() {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const sales = (await getSales()).map((s) => ({ slug: s.slug, title: s.title, city: s.city, lat: s.lat, lng: s.lng, days: s.days.map((d) => ({ date: d.date, start: d.start, end: d.end })) }));
  return <div><div className="print:hidden"><PageHead title="Route planner" sub="Pick saved sales for a day → get the shortest driving order → print it or open it in Google Maps" /></div><Planner sales={sales} today={today} site={SITE_URL} /></div>;
}
