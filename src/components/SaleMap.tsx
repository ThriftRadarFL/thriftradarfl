"use client";
import { useEffect, useRef, useState } from "react";
import type { Map as MlMap, Marker, Popup, GeoJSONSource, MapLayerMouseEvent } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
export type MapPin = { key: string; href: string; name: string; lat: number; lng: number; color: string; info?: string; kind?: "sale" | "store" };
type ML = typeof import("maplibre-gl");
/** Popup DOM built with textContent (names come from listings; never inject HTML). */
export function popupNode(p: Pick<MapPin, "name" | "info" | "href" | "kind">): HTMLElement {
  const d = document.createElement("div"); d.className = "text-sm"; d.style.maxWidth = "220px";
  const t = document.createElement("p"); t.className = "font-bold text-royal"; t.textContent = p.name; d.append(t);
  if (p.info) { const i = document.createElement("p"); i.className = "mt-0.5 text-xs text-gray-700"; i.textContent = p.info; d.append(i); }
  const a = document.createElement("a"); a.href = p.href; a.className = "btn-red mt-2 !min-h-10 text-xs"; a.textContent = "View details →"; a.setAttribute("aria-label", `View details: ${p.name}`); d.append(a);
  return d;
}
export default function SaleMap({ pins, apiKey, me, focusKey }: { pins: MapPin[]; apiKey: string; me?: { lat: number; lng: number } | null; focusKey?: string | null }) {
  const el = useRef<HTMLDivElement>(null); const map = useRef<MlMap | null>(null); const ml = useRef<ML | null>(null);
  const meMarker = useRef<Marker | null>(null); const popup = useRef<Popup | null>(null); const [ready, setReady] = useState(false);
  const pinsRef = useRef(pins); pinsRef.current = pins;
  useEffect(() => { // create the map + clustered source once
    let dead = false;
    import("maplibre-gl").then((lib) => {
      if (dead || !el.current) return; ml.current = lib;
      lib.setWorkerUrl("/maplibre-gl-worker.mjs"); // bundlers can't resolve MapLibre v6's worker; served from /public
      const m = new lib.Map({ container: el.current, style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${encodeURIComponent(apiKey)}`, center: [-81.2, 28.9], zoom: 8, cooperativeGestures: true });
      m.addControl(new lib.NavigationControl(), "top-right"); map.current = m;
      m.on("load", () => {
        m.addSource("pins", { type: "geojson", data: { type: "FeatureCollection", features: [] }, cluster: true, clusterRadius: 44, clusterMaxZoom: 13 });
        m.addLayer({ id: "clusters", type: "circle", source: "pins", filter: ["has", "point_count"], paint: { "circle-color": "#0a3d91", "circle-stroke-color": "#fff", "circle-stroke-width": 3,
          "circle-radius": ["step", ["get", "point_count"], 18, 10, 23, 25, 28] } });
        m.addLayer({ id: "cluster-count", type: "symbol", source: "pins", filter: ["has", "point_count"], layout: { "text-field": ["get", "point_count_abbreviated"], "text-size": 13, "text-font": ["Noto Sans Bold"] }, paint: { "text-color": "#fff" } });
        m.addLayer({ id: "pin", type: "circle", source: "pins", filter: ["!", ["has", "point_count"]], paint: { "circle-color": ["get", "color"], "circle-radius": 11, "circle-stroke-color": "#fff", "circle-stroke-width": 3 } });
        m.on("click", "clusters", async (e: MapLayerMouseEvent) => { const f = e.features?.[0]; if (!f) return;
          const z = await (m.getSource("pins") as GeoJSONSource).getClusterExpansionZoom(f.properties.cluster_id as number);
          m.easeTo({ center: (f.geometry as GeoJSON.Point).coordinates as [number, number], zoom: z }); });
        m.on("click", "pin", (e: MapLayerMouseEvent) => { const f = e.features?.[0]; if (!f) return; const p = pinsRef.current.find((x) => x.key === f.properties.key); if (!p) return;
          popup.current?.remove(); popup.current = new lib.Popup({ offset: 14, closeButton: true, maxWidth: "240px", className: "trfl-popup" }).setLngLat([p.lng, p.lat]).setDOMContent(popupNode(p)).addTo(m); });
        for (const l of ["clusters", "pin"]) { m.on("mouseenter", l, () => { m.getCanvas().style.cursor = "pointer"; }); m.on("mouseleave", l, () => { m.getCanvas().style.cursor = ""; }); }
        setReady(true);
      });
    });
    return () => { dead = true; map.current?.remove(); map.current = null; };
  }, [apiKey]);
  useEffect(() => { // sync source data with filtered pins
    const m = map.current, lib = ml.current; if (!ready || !m || !lib) return;
    (m.getSource("pins") as GeoJSONSource).setData({ type: "FeatureCollection", features: pins.map((p) => ({ type: "Feature", geometry: { type: "Point", coordinates: [p.lng, p.lat] }, properties: { key: p.key, color: p.color } })) });
    popup.current?.remove();
    const b = new lib.LngLatBounds(); for (const p of pins) b.extend([p.lng, p.lat]);
    meMarker.current?.remove(); meMarker.current = null;
    if (me) { const d = document.createElement("div"); d.title = "You are here"; d.style.cssText = "width:16px;height:16px;border-radius:50%;background:#1a73e8;border:3px solid #fff;box-shadow:0 0 0 6px #1a73e855";
      meMarker.current = new lib.Marker({ element: d }).setLngLat([me.lng, me.lat]).addTo(m); b.extend([me.lng, me.lat]); }
    if (!b.isEmpty()) m.fitBounds(b, { padding: 40, maxZoom: 12, duration: 300 });
  }, [pins, me, ready]);
  useEffect(() => { // list "📍" button → fly to the pin and open its popup (keyboard path to every pin)
    const m = map.current, lib = ml.current; if (!ready || !m || !lib || !focusKey) return; const k = focusKey.replace(/#\d+$/, ""); const p = pinsRef.current.find((x) => x.key === k); if (!p) return;
    m.flyTo({ center: [p.lng, p.lat], zoom: Math.max(m.getZoom(), 14) }); popup.current?.remove();
    popup.current = new lib.Popup({ offset: 14, maxWidth: "240px", className: "trfl-popup" }).setLngLat([p.lng, p.lat]).setDOMContent(popupNode(p)).addTo(m);
    (popup.current.getElement().querySelector("a") as HTMLAnchorElement | null)?.focus({ preventScroll: true }); el.current?.scrollIntoView({ block: "nearest" });
  }, [focusKey, ready]);
  return <div ref={el} className="h-[360px] w-full sm:h-[440px] md:h-[520px]" role="region" aria-label="Interactive map of sales and stores. Tap a dot for details; tap a numbered cluster to zoom in." />;
}
