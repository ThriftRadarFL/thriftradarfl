// Printable / shareable route list for /plan (pure, so it's testable without a browser).
import { milesBetween, type LatLng } from "./geo";
import { range12 } from "./time";
type Stop = LatLng & { slug: string; title: string; city: string; days: { date: string; start: string; end: string }[] };
export type Leg<T extends Stop> = { n: number; stop: T; hours: string; legMiles: number | null; totalMiles: number };
/** One row per stop: hours for `day` (or first day), straight-line miles from the previous stop (or `start`), running total. */
export function routeLegs<T extends Stop>(route: T[], day: string, start?: LatLng | null): Leg<T>[] {
  let total = 0;
  return route.map((s, i) => { const prev = i ? route[i - 1] : start ?? null; const leg = prev ? Math.round(milesBetween(prev, s) * 10) / 10 : null; total = Math.round((total + (leg ?? 0)) * 10) / 10;
    const d = s.days.find((x) => x.date === day) ?? s.days[0]; return { n: i + 1, stop: s, hours: d ? range12(d.start, d.end) : "", legMiles: leg, totalMiles: total }; });
}
export const dayLabel = (iso: string) => (iso ? new Date(iso + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" }) : "Any day");
/** Plain-text list for copy/paste into a text message. */
export function routeText<T extends Stop>(legs: Leg<T>[], day: string, site: string, mapsUrl = ""): string {
  const head = `ThriftRadarFL route · ${dayLabel(day)} · ${legs.length} stop${legs.length === 1 ? "" : "s"}${legs.length ? ` · ~${Math.round(legs.at(-1)!.totalMiles)} mi` : ""}`;
  const rows = legs.map((l) => `${l.n}. ${l.stop.title} (${l.stop.city}) ${l.hours}${l.legMiles !== null ? ` · ${l.legMiles} mi` : ""}\n   ${site}/sales/${l.stop.slug}`);
  return [head, ...rows, ...(mapsUrl ? [`Directions: ${mapsUrl}`] : [])].join("\n");
}
