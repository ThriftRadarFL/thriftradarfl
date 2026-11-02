"use client";
import { useRouter } from "next/navigation";
import { readFavs, writeFavs, useFavs } from "./FavButton";
/** Saves the sale (if needed) and opens the route planner on its next sale day. */
export default function AddToRoute({ slug, day }: { slug: string; day?: string }) {
  const router = useRouter(); const favs = useFavs(); const saved = !!favs?.includes(slug);
  const go = () => { const f = readFavs(); if (!f.includes(slug)) { writeFavs([...f, slug]); navigator.serviceWorker?.controller?.postMessage({ type: "save", slug }); }
    router.push(day ? `/plan?day=${day}` : "/plan"); };
  return <button type="button" onClick={go} className="btn-red block w-full text-center bg-gradient-to-b from-[#e8202f] to-cta">🚗 {saved ? "Plan my route" : "Add to my route"}</button>;
}
