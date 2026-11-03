import { getVenues, getSales } from "@/lib/data";
import { PageHead } from "@/components/ui";
import { buildPins } from "@/lib/map-pins";
import MapExplorer, { type Pin } from "./MapExplorer";
export const metadata = { title: "Sale Map — estate sales & thrift stores", description: "Map of upcoming estate sales, auctions, yard sales and thrift stores across Central Florida. Filter by day, type and city or sort by distance.", alternates: { canonical: "/map" } };
// Must render per request: a build-time prerender froze pins to whatever sales existed at deploy, so admin/API edits 404'd.
export const dynamic = "force-dynamic";
export default async function MapPage() {
  const [venues, sales] = await Promise.all([getVenues(), getSales()]);
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  const pins: Pin[] = buildPins(venues, sales);
  return (<div><PageHead title="Sale Map" sub="Filter by day, type and city · 📍 Near me sorts by distance" />
    <MapExplorer pins={pins} apiKey={process.env.NEXT_PUBLIC_MAPTILER_KEY} today={today} /></div>);
}
