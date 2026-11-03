// Search-as-you-type suggestions for stores, sales and cities. Ranked: name starts with q > a word starts with q > contains.
import type { Sale, Venue } from "./data";
import { citySlug } from "./data";
export type Suggestion = { kind: "store" | "sale" | "city"; label: string; sub: string; href: string };
const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
export const MAX_Q = 60;
const dayLabel = (iso?: string) => (iso ? new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" }) : "");
/** 0 = no match; higher is better. Every query term must hit the haystack. */
export function score(name: string, extra: string, q: string): number {
  const n = norm(name), hay = `${n} ${norm(extra)}`, terms = norm(q).split(" ").filter(Boolean);
  if (!terms.length || !terms.every((t) => hay.includes(t))) return 0;
  const nq = terms.join(" ");
  if (n.startsWith(nq)) return 4;
  if ((" " + n).includes(" " + nq)) return 3;
  if (n.includes(nq)) return 2;
  return 1;
}
export function suggest(qRaw: string, sales: Sale[], venues: Venue[], today: string, limit = 8): Suggestion[] {
  const q = qRaw.slice(0, MAX_Q); if (norm(q).length < 2) return [];
  const out: (Suggestion & { s: number; o: number })[] = [];
  for (const v of venues) { const s = score(v.name, `${v.city} ${v.zip} ${v.type.replace("_", " ")} ${v.address}`, q); if (s) out.push({ kind: "store", label: v.name, sub: `${v.address}, ${v.city}`, href: `/stores/${v.slug}`, s, o: 1 }); }
  for (const x of sales) { if (!x.days.some((d) => d.date >= today)) continue;
    const s = score(x.title, `${x.city} ${x.zip} ${x.type.replace("_", " ")} ${(x.tags ?? []).join(" ")}`, q); if (s) out.push({ kind: "sale", label: x.title, sub: `${x.city} · ${dayLabel(x.days.find((d) => d.date >= today)?.date ?? x.days[0]?.date)}`, href: `/sales/${x.slug}`, s, o: 2 }); }
  const cities = new Map<string, number>(); for (const c of [...venues.map((v) => v.city), ...sales.map((s) => s.city)]) cities.set(c, (cities.get(c) ?? 0) + 1);
  for (const [c, n] of cities) { const s = score(c, "", q); if (s) out.push({ kind: "city", label: c, sub: `${n} listing${n === 1 ? "" : "s"}`, href: `/city/${citySlug(c)}`, s: s + 0.5, o: 0 }); }
  return out.sort((a, b) => b.s - a.s || a.o - b.o || a.label.localeCompare(b.label)).slice(0, limit).map(({ kind, label, sub, href }) => ({ kind, label, sub, href }));
}
