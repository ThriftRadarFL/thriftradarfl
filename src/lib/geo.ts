export type LatLng = { lat: number; lng: number };
const R = 3958.8; // miles
export function milesBetween(a: LatLng, b: LatLng) {
  const toR = (d: number) => (d * Math.PI) / 180; const dLat = toR(b.lat - a.lat), dLng = toR(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a.lat)) * Math.cos(toR(b.lat)) * Math.sin(dLng / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(h));
}
/** Nearest-neighbor driving order from an optional start, then 2-opt improvement (fine for ≤ 25 stops). */
export function orderStops<T extends LatLng>(stops: T[], start?: LatLng): T[] {
  if (stops.length < 2) return [...stops];
  const left = [...stops]; const out: T[] = []; let cur: LatLng = start ?? left.splice(left.reduce((bi, s, i) => (s.lat > left[bi].lat ? i : bi), 0), 1)[0];
  if (!start) out.push(cur as T);
  while (left.length) { let bi = 0; left.forEach((s, i) => { if (milesBetween(cur, s) < milesBetween(cur, left[bi])) bi = i; }); cur = left.splice(bi, 1)[0]; out.push(cur as T); }
  const len = (r: T[]) => r.reduce((d, s, i) => d + (i ? milesBetween(r[i - 1], s) : start ? milesBetween(start, s) : 0), 0);
  let best = out, improved = true;
  while (improved) { improved = false;
    for (let i = 0; i < best.length - 1; i++) for (let k = i + 1; k < best.length; k++) {
      const cand = [...best.slice(0, i), ...best.slice(i, k + 1).reverse(), ...best.slice(k + 1)]; if (len(cand) + 1e-9 < len(best)) { best = cand; improved = true; } } }
  return best;
}
export const routeMiles = (stops: LatLng[], start?: LatLng) => stops.reduce((d, s, i) => d + (i ? milesBetween(stops[i - 1], s) : start ? milesBetween(start, s) : 0), 0);
/** Google Maps multi-stop directions URL (destination = last stop; up to 9 waypoints). */
export function googleMapsRoute(stops: LatLng[], start?: LatLng) {
  const f = (p: LatLng) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`; if (!stops.length) return "";
  const dest = stops.at(-1)!; const way = stops.slice(0, -1).slice(0, 9);
  const u = new URLSearchParams({ api: "1", destination: f(dest), travelmode: "driving" }); if (start) u.set("origin", f(start)); if (way.length) u.set("waypoints", way.map(f).join("|"));
  return `https://www.google.com/maps/dir/?${u.toString()}`;
}
