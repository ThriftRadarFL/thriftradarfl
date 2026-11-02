import { ogCard, ogSize } from "@/lib/og";
import { getVenue } from "@/lib/data";
import { typeLabel } from "@/components/ui";
export const size = ogSize; export const contentType = "image/png"; export const alt = "Store details";
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const v = await getVenue((await params).slug);
  return v ? ogCard({ kicker: `${typeLabel[v.type] ?? "Store"} · ${v.city}, FL`, title: v.name, sub: "Hours · deal days · directions" }) : ogCard({ kicker: "Store", title: "Store not found" });
}
