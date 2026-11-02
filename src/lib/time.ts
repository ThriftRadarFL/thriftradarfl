/** "18:30" -> "6:30 PM", "08:00" -> "8 AM". Non-HH:MM input is returned unchanged. */
export function t12(hhmm: string | undefined | null): string {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm ?? ""); if (!m) return hhmm ?? "";
  const h = Number(m[1]), min = m[2]; const ap = h >= 12 ? "PM" : "AM"; const h12 = h % 12 || 12;
  return min === "00" ? `${h12} ${ap}` : `${h12}:${min} ${ap}`;
}
export const range12 = (a: string, b: string) => `${t12(a)}–${t12(b)}`;
