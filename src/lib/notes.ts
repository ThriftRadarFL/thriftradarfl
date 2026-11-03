// Store notes hygiene: one unverified warning, no repeated sentences (merges kept stacking "unverified" prefixes).
const UNVERIFIED_RE = /\b(UNVERIFIED listing|Hours from a directory listing, unverified\.?|Hours unverified\.?)/i;
export function cleanNotes(notes: string): string {
  const seen = new Set<string>(); let warned = false;
  const parts = notes.split(/(?<=[.!?])\s+(?=[A-Z(])/).map((s) => s.trim()).filter(Boolean);
  const out: string[] = [];
  for (const p of parts) {
    const key = p.toLowerCase().replace(/\s+/g, " ");
    if (seen.has(key)) continue; seen.add(key);
    if (/^Hours from a directory listing, unverified\.?$/i.test(p) && notes.match(/UNVERIFIED listing/i)) continue; // listing-level warning already covers it
    if (/^UNVERIFIED listing/i.test(p)) { if (warned) continue; warned = true; }
    out.push(p);
  }
  return out.join(" ");
}
export const isUnverified = (notes: string) => UNVERIFIED_RE.test(notes);
