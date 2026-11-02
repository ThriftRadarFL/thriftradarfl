"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useFavs } from "@/components/FavButton";
import { orderStops, googleMapsRoute, routeMiles, type LatLng } from "@/lib/geo";
import { routeLegs, routeText, dayLabel } from "@/lib/route-list";
type S = { slug: string; title: string; city: string; lat: number; lng: number; days: { date: string; start: string; end: string }[] };
export default function Planner({ sales, today, site }: { sales: S[]; today: string; site: string }) {
  const favs = useFavs(); const [dayState, setDay] = useState<string | null>(null); const [start, setStart] = useState<LatLng | null>(null); const [geoMsg, setGeoMsg] = useState("");
  const [picked, setPicked] = useState<string[] | null>(null); const [copyMsg, setCopyMsg] = useState("");
  const saved = useMemo(() => sales.filter((s) => favs?.includes(s.slug) && s.lat && s.lng), [sales, favs]);
  const days = useMemo(() => [...new Set(saved.flatMap((s) => s.days.map((d) => d.date)).filter((d) => d >= today))].sort(), [saved, today]);
  const day = dayState ?? days[0] ?? "";
  const onDay = saved.filter((s) => !day || s.days.some((d) => d.date === day));
  const chosen = onDay.filter((s) => (picked ?? onDay.map((x) => x.slug)).includes(s.slug));
  const route = orderStops(chosen, start ?? undefined); const url = googleMapsRoute(route, start ?? undefined); const legs = routeLegs(route, day, start);
  const copy = async () => { try { await navigator.clipboard.writeText(routeText(legs, day, site, url)); setCopyMsg("Copied — paste it into a text."); } catch { setCopyMsg("Couldn't copy — use Print instead."); } };
  const locate = () => { if (!navigator.geolocation) return setGeoMsg("Location isn't available in this browser.");
    setGeoMsg("Finding you…"); navigator.geolocation.getCurrentPosition((p) => { setStart({ lat: p.coords.latitude, lng: p.coords.longitude }); setGeoMsg("Starting from your location."); }, () => setGeoMsg("Couldn't get your location — route starts at the northernmost sale."), { timeout: 10000 }); };
  if (favs === null) return <div className="grid min-h-[420px] gap-4 md:grid-cols-3" aria-busy="true"><div className="panel animate-pulse" /><div className="panel animate-pulse md:col-span-2" /><span className="sr-only">Loading your saved sales…</span></div>;
  if (!saved.length) return <p className="panel p-4 text-sm">Save a few sales first (tap <span aria-hidden="true">♡</span> on any sale), then come back to plan your route. <Link href="/sales" className="link">Browse sales</Link></p>;
  return (<div className="grid gap-4 md:grid-cols-3 print:block">
    <section className="panel md:col-span-1 self-start print:hidden"><h2 className="panel-head">1 · Pick a day &amp; stops</h2><div className="space-y-3 p-4 text-sm">
      <label className="block text-xs font-bold">Day<select value={day} onChange={(e) => { setDay(e.target.value); setPicked(null); }} className="mt-1 block w-full border border-line bg-white px-2 py-2">
        <option value="">Any day</option>{days.map((d) => <option key={d} value={d}>{new Date(d + "T12:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</option>)}</select></label>
      <fieldset><legend className="text-xs font-bold">Stops ({chosen.length}/{onDay.length})</legend>
        {onDay.map((s) => <label key={s.slug} className="flex min-h-11 items-center gap-2 border-b border-line last:border-0">
          <input type="checkbox" className="h-5 w-5" checked={chosen.includes(s)} onChange={(e) => { const cur = picked ?? onDay.map((x) => x.slug); setPicked(e.target.checked ? [...cur, s.slug] : cur.filter((x) => x !== s.slug)); }} />
          <span className="min-w-0 flex-1 truncate">{s.title}</span><span className="text-xs text-gray-600">{s.city}</span></label>)}
        {!onDay.length && <p className="text-gray-600">None of your saved sales run that day.</p>}</fieldset>
      <button type="button" onClick={locate} className="btn-gray w-full">📍 Start from my location</button><p role="status" className="text-xs text-gray-600">{geoMsg}</p></div></section>
    <section className="panel md:col-span-2 self-start print:border-0 print:shadow-none" aria-label="Your route">
      <h2 className="panel-head print:hidden">2 · Your route{route.length > 1 ? ` · ~${Math.round(routeMiles(route, start ?? undefined))} mi straight-line` : ""}</h2>
      <div className="hidden print:block print:pb-2"><p className="text-xl font-bold">ThriftRadarFL route · {dayLabel(day)}</p>
        <p className="text-sm">{legs.length} stop{legs.length === 1 ? "" : "s"}{legs.length > 1 ? ` · ~${Math.round(legs.at(-1)!.totalMiles)} mi straight-line` : ""}{start ? " · starting from your location" : ""}</p></div>
      <ol className="text-sm">{legs.map((l) => <li key={l.stop.slug} className="flex items-center gap-3 border-b border-line px-4 py-2 last:border-0 print:break-inside-avoid print:px-0">
          <span aria-hidden="true" className="hidden h-5 w-5 shrink-0 border-2 border-black print:inline-block" />
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-royal text-xs font-bold text-white print:border print:border-black print:bg-white print:text-black">{l.n}</span>
          <div className="min-w-0 flex-1"><Link href={`/sales/${l.stop.slug}`} className="link block truncate print:whitespace-normal print:text-black">{l.stop.title}</Link>
            <span className="text-xs text-gray-600 print:text-black">{l.stop.city} · {l.hours}{l.legMiles !== null ? ` · ${l.legMiles.toFixed(1)} mi from ${l.n > 1 ? "previous" : "you"}` : ""}</span>
            <span className="hidden text-xs print:block">{site.replace(/^https?:\/\//, "")}/sales/{l.stop.slug}</span></div>
          {l.n > 1 && <span className="hidden text-xs print:inline">Σ {l.totalMiles.toFixed(1)} mi</span>}</li>)}</ol>
      {route.length > 0 ? <div className="space-y-2 p-4 print:hidden"><a href={url} target="_blank" rel="noopener noreferrer" className="btn-red block text-center">Open route in Google Maps ↗</a>
        <div className="grid grid-cols-2 gap-2"><button type="button" onClick={() => window.print()} className="btn-gray">🖨 Print list</button><button type="button" onClick={copy} className="btn-gray">Copy as text</button></div>
        <p role="status" className="text-xs text-gray-600">{copyMsg}</p>
        {route.length > 10 && <p className="text-xs text-gray-600">Google Maps allows 10 stops per link — the first 10 are included.</p>}
        <p className="text-xs text-gray-600">Order is optimized by distance. Check each sale&apos;s hours; addresses are approximate until the seller releases them.</p></div>
        : <p className="p-4 text-sm text-gray-600">No stops picked — tick at least one sale on the left to build a route.</p>}
      {route.length > 0 && <div className="hidden pt-4 text-xs print:block"><p className="font-bold">Notes</p>{[0, 1, 2].map((i) => <div key={i} className="h-7 border-b border-black" />)}
        <p className="pt-3">Printed from ThriftRadarFL · Distances are straight-line; confirm hours with each seller.</p></div>}</section></div>);
}
