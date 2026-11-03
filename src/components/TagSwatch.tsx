import { SWATCH, type TagColor } from "@/lib/color-tags";
export default function TagSwatch({ color, big }: { color: TagColor; big?: boolean }) {
  const s = SWATCH[color];
  return <span className={`inline-flex items-center gap-1 rounded-sm border border-black/25 font-bold capitalize shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_1px_2px_rgba(0,0,0,0.25)] ${big ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs"}`}
    style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0) 55%), ${s.bg}`, color: s.fg }}>🏷 {color}</span>;
}
