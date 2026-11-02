"use client";
import { useEffect, useRef, useState } from "react";
import type { Map as MlMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
export type MapPin = { key: string; href: string; name: string; lat: number; lng: number; color: string };
type ML = typeof import("maplibre-gl");
export default function SaleMap({ pins, apiKey, me }: { pins: MapPin[]; apiKey: string; me?: { lat: number; lng: number } | null }) {
  const el = useRef<HTMLDivElement>(null); const map = useRef<MlMap | null>(null); const ml = useRef<ML | null>(null);
  const markers = useRef<Marker[]>([]); const meMarker = useRef<Marker | null>(null); const [ready, setReady] = useState(false);
  useEffect(() => { // create the map once
    let dead = false;
    import("maplibre-gl").then((lib) => {
      if (dead || !el.current) return; ml.current = lib;
      lib.setWorkerUrl("/maplibre-gl-worker.mjs"); // bundlers can't resolve MapLibre v6's worker; served from /public
      const m = new lib.Map({ container: el.current, style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${encodeURIComponent(apiKey)}`, center: [-81.2, 28.9], zoom: 8, cooperativeGestures: true });
      m.addControl(new lib.NavigationControl(), "top-right"); map.current = m; setReady(true);
    });
    return () => { dead = true; map.current?.remove(); map.current = null; };
  }, [apiKey]);
  useEffect(() => { // sync markers with filtered pins
    const m = map.current, lib = ml.current; if (!ready || !m || !lib) return;
    markers.current.forEach((x) => x.remove()); markers.current = [];
    const b = new lib.LngLatBounds();
    for (const p of pins) {
      const dot = document.createElement("a"); dot.href = p.href; dot.title = p.name; dot.setAttribute("aria-label", p.name);
      dot.style.cssText = `display:block;width:18px;height:18px;border-radius:50%;background:${p.color};border:2px solid #fff;box-shadow:0 0 3px #0008`;
      markers.current.push(new lib.Marker({ element: dot }).setLngLat([p.lng, p.lat]).addTo(m)); b.extend([p.lng, p.lat]);
    }
    meMarker.current?.remove(); meMarker.current = null;
    if (me) { const d = document.createElement("div"); d.title = "You are here"; d.style.cssText = "width:16px;height:16px;border-radius:50%;background:#1a73e8;border:3px solid #fff;box-shadow:0 0 0 6px #1a73e855";
      meMarker.current = new lib.Marker({ element: d }).setLngLat([me.lng, me.lat]).addTo(m); b.extend([me.lng, me.lat]); }
    if (!b.isEmpty()) m.fitBounds(b, { padding: 40, maxZoom: 12, duration: 300 });
  }, [pins, me, ready]);
  return <div ref={el} className="h-[440px] w-full sm:h-[520px]" role="region" aria-label="Interactive map of sales and stores" />;
}
