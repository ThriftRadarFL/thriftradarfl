import { ogCard, ogSize } from "@/lib/og";
import { getSale } from "@/lib/data";
import { typeLabel } from "@/components/ui";
export const size = ogSize; export const contentType = "image/png"; export const alt = "Sale details";
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const s = await getSale((await params).slug);
  if (!s) return ogCard({ kicker: "Sale", title: "Sale not found" });
  const fmt = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const best = Math.max(0, ...s.days.map((d) => d.discountPct));
  return ogCard({ kicker: `${typeLabel[s.type] ?? "Sale"} · ${s.city}, FL`, title: s.title, sub: `${fmt(s.days[0].date)}${s.days.length > 1 ? ` – ${fmt(s.days.at(-1)!.date)}` : ""}${best ? ` · up to ${best}% off` : ""}` });
}
