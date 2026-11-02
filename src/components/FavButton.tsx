"use client";
import { useEffect, useState } from "react";
export const FAV_KEY = "thriftradar:favs";
export function readFavs(): string[] { try { const v = JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]"); return Array.isArray(v) ? v.filter((x) => typeof x === "string") : []; } catch { return []; } }
export function writeFavs(f: string[]) { localStorage.setItem(FAV_KEY, JSON.stringify(f)); window.dispatchEvent(new Event("thriftradar:favs")); }
export function useFavs() {
  const [favs, setFavs] = useState<string[] | null>(null);
  useEffect(() => { const up = () => setFavs(readFavs()); up(); window.addEventListener("thriftradar:favs", up); window.addEventListener("storage", up);
    return () => { window.removeEventListener("thriftradar:favs", up); window.removeEventListener("storage", up); }; }, []);
  return favs;
}
export default function FavButton({ slug, title, compact }: { slug: string; title: string; compact?: boolean }) {
  const favs = useFavs(); const on = !!favs?.includes(slug);
  const toggle = () => { const f = readFavs(); writeFavs(on ? f.filter((x) => x !== slug) : [...f, slug]);
    navigator.serviceWorker?.controller?.postMessage({ type: on ? "unsave" : "save", slug }); };
  return <button type="button" onClick={toggle} aria-pressed={on} aria-label={compact ? (on ? `Remove ${title} from saved sales` : `Save ${title}`) : undefined}
    className={compact ? `min-h-10 min-w-10 px-2 py-1 text-lg leading-none ${on ? "text-cta" : "text-gray-600 hover:text-cta"}` : `btn-gray block w-full text-center ${on ? "text-cta" : ""}`}>
    <span aria-hidden="true">{on ? "♥" : "♡"}</span>{!compact && (on ? " Saved" : " Save this sale")}</button>;
}
