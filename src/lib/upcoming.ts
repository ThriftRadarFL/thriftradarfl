import type { Sale } from "./data";

/** Calendar date in America/New_York (YYYY-MM-DD). */
export function todayET(now = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

/** True when the sale has at least one day on or after today ET. Unknown-end same-day listings stay visible that day. */
export function saleIsActive(s: Pick<Sale, "days">, today = todayET()): boolean {
  return s.days.some((d) => d.date >= today);
}

export function activeSales<T extends Pick<Sale, "days">>(sales: T[], today = todayET()): T[] {
  return sales.filter((s) => saleIsActive(s, today));
}
