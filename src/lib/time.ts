/** "18:30" -> "6:30 PM", "08:00" -> "8 AM". Non-HH:MM input is returned unchanged. */
export function t12(hhmm: string | undefined | null): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm ?? ""); if (!m) return hhmm ?? "";
  const h = Number(m[1]), min = m[2]; const ap = h >= 12 ? "PM" : "AM"; const h12 = h % 12 || 12;
  return min === "00" ? `${h12} ${ap}` : `${h12}:${min} ${ap}`;
}
export const range12 = (a: string, b: string) => `${t12(a)}–${t12(b)}`;
/** Store hours for display: "9:00-21:00" -> "9 AM–9 PM", "closed" -> "Closed"; anything unrecognized is returned as-is. */
export function hours12(h: string): string {
  if (/^closed$/i.test(h.trim())) return "Closed";
  const m = /^\s*(\d{1,2}:\d{2})\s*[-–]\s*(\d{1,2}:\d{2})\s*$/.exec(h); return m ? range12(m[1], m[2]) : h;
}
const DAY: Record<string, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun", daily: "Daily" };
/** Hours key for display: "tue-sat" -> "Tue–Sat", "daily" -> "Daily". */
export const dayKey = (k: string) => k.split("-").map((p) => DAY[p.toLowerCase()] ?? p).join("–");
