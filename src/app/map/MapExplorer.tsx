"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import SaleMap from "@/components/SaleMap";
import { milesBetween, type LatLng } from "@/lib/geo";
export type Pin = { key: string; href: string; name: string; type: string; city: string; lat: number; lng: number; dates: string[]; kind: "sale" | "store"; info?: string };
const fill: Record<string, string> = { estate: "#c4402c", auction: "#0b3d91", auction_house: "#0b3d91", thrift: "#00857c", outlet_bins: "#d4001a", yard: "#6b4fa0", estate_company: "#c4402c" };
const label: Record<string, string> = { estate: "Estate sale", auction: "Auction", yard: "Yard sale", thrift: "Thrift store", outlet_bins: "Outlet bins", auction_house: "Auction house", estate_company: "Estate company" };
const sel = "mt-1 block w-full border border-line bg-white px-2 py-2 text-sm font-normal";
export default function MapExplorer({ pins, apiKey, today }: { pins: Pin[]; apiKey?: string; today: string }) {
  const [day, setDay] = useState(""); const [type, setType] = useState(""); const [city, setCity] = useState(""); const [stores, setStores] = useState(true);
  const [me, setMe] = useState<LatLng | null>(null); const [msg, setMsg] = useState("");
  // MapLibre is ~800 KB of JS: load it after the page is idle (phones included) so first paint stays fast.
  const [live, setLive] = useState(false);
  useEffect(() => { if (!apiKey) return;
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(() => setLive(true), { timeout: 2500 }); else setTimeout(() => setLive(true), 1200); }, [apiKey]);
  const days = useMemo(() => [...new Set(pins.flatMap((p) => p.dates))].filter((d) => d >= today).sort(), [pins, today]);
  const types = useMemo(() => [...new Set(pins.map((p) => p.type))], [pins]); const cities = useMemo(() => [...new Set(pins.map((p) => p.city))].sort(), [pins]);
  const shown = useMemo(() => pins.filter((p) => (p.kind === "store" ? stores : !day || p.dates.includes(day))
    && (!type || p.type === type) && (!city || p.city === city) && (p.kind === "store" || p.dates.some((d) => d >= today))), [pins, day, type, city, stores, today]);
  const withDist = useMemo(() => shown.map((p) => ({ ...p, mi: me ? milesBetween(me, p) : null })).sort((a, b) => (a.mi ?? 0) - (b.mi ?? 0) || b.lat - a.lat), [shown, me]);
  const mapPins = useMemo(() => shown.map((p) => ({ key: p.key, href: p.href, name: p.name, lat: p.lat, lng: p.lng, color: fill[p.type] ?? "#888", info: p.info ?? "", kind: p.kind })), [shown]);
  const locate = () => { if (!navigator.geolocation) return setMsg("Location isn't available in this browser."); setMsg("Finding you…");
    navigator.geolocation.getCurrentPosition((p) => { setMe({ lat: p.coords.latitude, lng: p.coords.longitude }); setMsg("Sorted by distance from you."); }, () => setMsg("Location blocked — allow it in your browser to sort by distance."), { timeout: 10000 }); };
  const fmt = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  const reset = () => { setDay(""); setType(""); setCity(""); setStores(true); };
  return (<div>
    <form className="panel mb-3 grid grid-cols-2 gap-2 p-3 sm:grid-cols-5" onSubmit={(e) => e.preventDefault()} aria-label="Map filters">
      <label className="text-xs font-bold">Day<select className={sel} value={day} onChange={(e) => setDay(e.target.value)}><option value="">Any day</option>{days.map((d) => <option key={d} value={d}>{fmt(d)}</option>)}</select></label>
      <label className="text-xs font-bold">Type<select className={sel} value={type} onChange={(e) => setType(e.target.value)}><option value="">All types</option>{types.map((t) => <option key={t} value={t}>{label[t] ?? t}</option>)}</select></label>
      <label className="text-xs font-bold">City<select className={sel} value={city} onChange={(e) => setCity(e.target.value)}><option value="">All cities</option>{cities.map((c) => <option key={c}>{c}</option>)}</select></label>
      <label className="flex min-h-10 items-center gap-2 self-end text-xs font-bold"><input type="checkbox" className="h-6 w-6" checked={stores} onChange={(e) => setStores(e.target.checked)} /> Show stores</label>
      <div className="col-span-2 flex items-end gap-2 sm:col-span-1"><button type="button" onClick={locate} className="btn-gray flex-1 px-2 text-sm">📍 Near me</button><button type="button" onClick={reset} className="btn-gray px-2 text-sm">Reset</button></div>
      <p role="status" aria-live="polite" className="col-span-2 text-xs text-gray-600 sm:col-span-5">{shown.length} of {pins.length} pins{msg ? ` · ${msg}` : ""}</p></form>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div className="panel min-w-0 overflow-hidden md:col-span-2"><h2 className="panel-head">Map</h2>
        {apiKey && live ? <SaleMap apiKey={apiKey} pins={mapPins} me={me} /> : <><SvgPlot pins={shown} />{apiKey && <button type="button" onClick={() => setLive(true)} className="btn-gray m-3">🗺 Load street map</button>}</>}</div>
      <section className="panel min-w-0 self-start"><h2 className="panel-head">{me ? "Nearest first" : "North to south"} ({withDist.length})</h2>
        <ul className="max-h-[520px] divide-y divide-line overflow-y-auto text-sm">{withDist.map((p) => <li key={p.key} className="flex min-h-11 items-center gap-2 px-3">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: fill[p.type] ?? "#888" }} aria-hidden="true" />
          <Link href={p.href} className="min-w-0 flex-1 truncate py-2 hover:text-royal">{p.name}</Link>
          <span className="shrink-0 text-[11px] text-gray-600">{p.mi != null ? `${p.mi.toFixed(1)} mi` : p.city}</span></li>)}
          {!withDist.length && <li className="p-3 text-gray-600">Nothing matches. <button type="button" className="underline" onClick={reset}>Reset filters</button></li>}</ul></section></div>
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-label="Legend">{Object.entries(label).filter(([t]) => types.includes(t)).map(([t, l]) => <li key={t} className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-full" style={{ background: fill[t] }} />{l}</li>)}</ul>
  </div>);
}
function SvgPlot({ pins }: { pins: Pin[] }) {
  if (!pins.length) return <p className="p-4 text-sm text-gray-600">No pins to show.</p>;
  const [minLat, maxLat] = [Math.min(...pins.map((p) => p.lat)) - 0.05, Math.max(...pins.map((p) => p.lat)) + 0.05];
  const [minLng, maxLng] = [Math.min(...pins.map((p) => p.lng)) - 0.05, Math.max(...pins.map((p) => p.lng)) + 0.05];
  const W = 800, H = Math.max(200, Math.round(W * ((maxLat - minLat) / ((maxLng - minLng) * Math.cos((minLat * Math.PI) / 180)))));
  const X = (lng: number) => ((lng - minLng) / (maxLng - minLng)) * W, Y = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * H;
  return (<><svg viewBox={`0 0 ${W} ${H}`} className="block h-auto max-h-[520px] w-full bg-[#eaf2f8]" role="group" aria-label="Plot of sales and stores by location">
    {pins.map((p) => <a key={p.key} href={p.href}><circle cx={X(p.lng)} cy={Y(p.lat)} r="11" fill={fill[p.type] ?? "#888"} stroke="#fff" strokeWidth="2"><title>{p.name}</title></circle></a>)}</svg>
    <p className="px-3 py-1 text-[11px] text-gray-600">Approximate positions — tap a dot for details.</p></>);
}
