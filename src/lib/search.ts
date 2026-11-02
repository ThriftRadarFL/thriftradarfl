import type { Sale, Venue } from "./data";
const norm = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
/** Every whitespace-separated term must appear somewhere in the record. */
export function matches(fields: (string | undefined | null)[], q: string) {
  const hay = norm(fields.filter(Boolean).join(" ")); const terms = norm(q).split(/\s+/).filter(Boolean);
  return terms.length > 0 && terms.every((t) => hay.includes(t));
}
export function searchAll(q: string, sales: Sale[], venues: Venue[]) {
  const type = (t: string) => t.replace("_", " ");
  return {
    sales: sales.filter((s) => matches([s.title, s.city, s.zip, type(s.type), s.description, ...s.paymentMethods, ...s.days.map((d) => d.date)], q)),
    venues: venues.filter((v) => matches([v.name, v.city, v.zip, v.address, type(v.type), v.notes], q)),
  };
}
