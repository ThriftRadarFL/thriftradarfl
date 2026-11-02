import { getVenues, getSales } from "@/lib/data";
import { PageHead } from "@/components/ui";
import MapExplorer, { type Pin } from "./MapExplorer";
export const metadata = { title: "Sale Map — estate sales & thrift stores", description: "Map of upcoming estate sales, auctions, yard sales and thrift stores across Central Florida. Filter by day, type and city or sort by distance.", alternates: { canonical: "/map" } };
export default async function MapPage() {
  const [venues, sales] = await Promise.all([getVenues(), getSales()]);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const pins: Pin[] = [...venues.map((v) => ({ key: v.slug, href: `/stores/${v.slug}`, name: v.name, type: v.type, city: v.city, lat: v.lat, lng: v.lng, dates: [], kind: "store" as const })),
    ...sales.map((s) => ({ key: s.slug, href: `/sales/${s.slug}`, name: s.title, type: s.type, city: s.city, lat: s.lat, lng: s.lng, dates: s.days.map((d) => d.date), kind: "sale" as const }))].filter((p) => p.lat && p.lng);
  return (<div><PageHead title="Sale Map" sub="Filter by day, type and city · 📍 Near me sorts by distance" />
    <MapExplorer pins={pins} apiKey={process.env.NEXT_PUBLIC_MAPTILER_KEY} today={today} /></div>);
}
