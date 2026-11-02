"use client";
import { useEffect, useRef } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
export type MapPin = { key: string; href: string; name: string; lat: number; lng: number; color: string };
export default function SaleMap({ pins, apiKey }: { pins: MapPin[]; apiKey: string }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let map: import("maplibre-gl").Map | undefined; let dead = false;
    import("maplibre-gl").then((ml) => {
      if (dead || !el.current) return;
      const m = (map = new ml.Map({ container: el.current, style: `https://api.maptiler.com/maps/streets-v2/style.json?key=${encodeURIComponent(apiKey)}`, center: [-81.38, 28.54], zoom: 8 }));
      m.addControl(new ml.NavigationControl(), "top-right");
      const b = new ml.LngLatBounds();
      for (const p of pins) {
        const dot = document.createElement("a"); dot.href = p.href; dot.title = p.name;
        dot.style.cssText = `display:block;width:16px;height:16px;border-radius:50%;background:${p.color};border:2px solid #fff;box-shadow:0 0 2px #0006`;
        new ml.Marker({ element: dot }).setLngLat([p.lng, p.lat]).addTo(m); b.extend([p.lng, p.lat]);
      }
      if (pins.length) m.fitBounds(b, { padding: 40, maxZoom: 12, duration: 0 });
    });
    return () => { dead = true; map?.remove(); };
  }, [pins, apiKey]);
  return <div ref={el} className="h-[520px] w-full" role="region" aria-label="Interactive map of sales and stores" />;
}
