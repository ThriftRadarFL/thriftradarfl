// Crowdsourced color-tag board: shoppers report which tag color is on sale at a store this week.
// Every report is UNVERIFIED: it is held for moderation (status "pending") and only "approved" reports show publicly,
// and only until the end of the week it was reported for (Goodwill-style colors rotate on Sundays).
export const TAG_COLORS = ["blue", "green", "orange", "pink", "purple", "red", "yellow", "white", "brown", "gray"] as const;
export type TagColor = (typeof TAG_COLORS)[number];
export type TagStatus = "pending" | "approved" | "rejected";
export type TagReport = {
  id: string; at: string; venue: string; color: TagColor;
  /** % off as reported by the shopper (null = not given). Never filled in by us. */
  discountPct: number | null; note: string; status: TagStatus;
  /** Sunday (YYYY-MM-DD, Eastern) that starts the week the report applies to. */
  weekOf: string;
  /** Last day (Saturday, inclusive) the report is shown. */
  expiresOn: string;
};
/** Swatch colors for display (hex, readable text color). */
export const SWATCH: Record<TagColor, { bg: string; fg: string }> = {
  blue: { bg: "#1d4ed8", fg: "#fff" }, green: { bg: "#15803d", fg: "#fff" }, orange: { bg: "#ea580c", fg: "#fff" }, pink: { bg: "#db2777", fg: "#fff" },
  purple: { bg: "#7e22ce", fg: "#fff" }, red: { bg: "#b91c1c", fg: "#fff" }, yellow: { bg: "#facc15", fg: "#111" }, white: { bg: "#ffffff", fg: "#111" },
  brown: { bg: "#78350f", fg: "#fff" }, gray: { bg: "#6b7280", fg: "#fff" },
};
export const NOTE_MAX = 140;
const addDays = (iso: string, n: number) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
/** Sunday–Saturday week containing `today` (an Eastern YYYY-MM-DD date). */
export function weekBounds(today: string) {
  const dow = new Date(today + "T12:00:00Z").getUTCDay(); const weekOf = addDays(today, -dow);
  return { weekOf, expiresOn: addDays(weekOf, 6) };
}
export const isActive = (r: Pick<TagReport, "status" | "weekOf" | "expiresOn">, today: string) => r.status === "approved" && r.weekOf <= today && today <= r.expiresOn;

type ParseOk = { ok: true; value: Omit<TagReport, "id" | "at" | "status"> }; type ParseErr = { ok: false; errors: string[] };
/** Validates a public report. `venues` = slugs that may receive reports. */
export function parseTagReport(o: Record<string, unknown>, venues: string[], today: string): ParseOk | ParseErr {
  const errors: string[] = []; const s = (k: string) => String(o[k] ?? "").trim();
  const venue = s("venue"); if (!venues.includes(venue)) errors.push("Pick a store from the list.");
  const color = s("color").toLowerCase() as TagColor; if (!TAG_COLORS.includes(color)) errors.push("Pick a tag color.");
  const pctRaw = s("discountPct").replace(/%$/, ""); let discountPct: number | null = null;
  if (pctRaw) { const n = Number(pctRaw); if (!Number.isInteger(n) || n < 5 || n > 90) errors.push("Discount must be a whole number from 5 to 90 (or leave it blank)."); else discountPct = n; }
  const note = s("note").replace(/\s+/g, " ");
  if (note.length > NOTE_MAX) errors.push(`Note must be under ${NOTE_MAX} characters.`);
  if (/https?:\/\/|www\./i.test(note)) errors.push("Links aren't allowed in notes.");
  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { venue, color, discountPct, note, ...weekBounds(today) } };
}

export type BoardColor = { color: TagColor; reports: number; discountPct: number | null; lastAt: string; notes: string[] };
export type BoardRow = { venue: string; colors: BoardColor[]; lastAt: string };
/** Approved reports for this week grouped by store, then color (most-reported color first). Discount shown only when all
 *  reports that gave one agree; otherwise null (conflicting) so we never present a number nobody actually reported. */
export function buildBoard(reports: TagReport[], today: string): BoardRow[] {
  const byVenue = new Map<string, Map<TagColor, TagReport[]>>();
  for (const r of reports) { if (!isActive(r, today)) continue; const m = byVenue.get(r.venue) ?? new Map(); m.set(r.color, [...(m.get(r.color) ?? []), r]); byVenue.set(r.venue, m); }
  const rows: BoardRow[] = [...byVenue].map(([venue, m]) => {
    const colors = [...m].map(([color, rs]) => {
      const pcts = [...new Set(rs.map((r) => r.discountPct).filter((p): p is number => p != null))];
      const lastAt = rs.map((r) => r.at).sort().at(-1)!;
      return { color, reports: rs.length, discountPct: pcts.length === 1 ? pcts[0] : null, lastAt, notes: rs.map((r) => r.note).filter(Boolean).slice(0, 3) };
    }).sort((a, b) => b.reports - a.reports || b.lastAt.localeCompare(a.lastAt));
    return { venue, colors, lastAt: colors.map((c) => c.lastAt).sort().at(-1)! };
  });
  return rows.sort((a, b) => b.lastAt.localeCompare(a.lastAt));
}
/** JSON-storage housekeeping: drop rejected and anything that expired more than `keepDays` ago. */
export const pruneReports = (list: TagReport[], today: string, keepDays = 28) => list.filter((r) => r.status !== "rejected" && r.expiresOn >= addDays(today, -keepDays));
