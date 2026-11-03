import { ogCard, ogSize } from "@/lib/og";
import { getSales, getVenues } from "@/lib/data";
import { cityList, todayET } from "@/lib/cities";
export const size = ogSize; export const contentType = "image/png"; export const alt = "Estate sales and thrift deal days in this city";
export default async function Image({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params; const [sales, venues] = await Promise.all([getSales(), getVenues()]);
  const c = cityList(sales, venues, todayET()).find((x) => x.slug === city);
  if (!c) return ogCard({ kicker: "City", title: "City not found" });
  return ogCard({ kicker: "Central Florida · City guide", title: `${c.name}, FL`, sub: `${c.sales} upcoming sale${c.sales === 1 ? "" : "s"} · ${c.venues} store${c.venues === 1 ? "" : "s"} · deal days` });
}
