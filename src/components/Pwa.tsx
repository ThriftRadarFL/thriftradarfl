"use client";
import { useEffect, useState } from "react";
import { readFavs } from "./FavButton";
type BIP = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const DISMISS = "thriftradar:install-dismissed";
export default function Pwa() {
  const [evt, setEvt] = useState<BIP | null>(null); const [ios, setIos] = useState(false);
  useEffect(() => {
    // SW only in production builds (cache-first /_next/static would fight dev HMR); opt in during dev with localStorage "thriftradar:sw-dev"=1.
    const swOn = process.env.NODE_ENV === "production" || localStorage.getItem("thriftradar:sw-dev") === "1";
    if ("serviceWorker" in navigator && !swOn) navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister()));
    if (swOn && "serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
      navigator.serviceWorker.register("/sw.js").then(async () => { const r = await navigator.serviceWorker.ready; r.active?.postMessage({ type: "sync", slugs: readFavs() }); }).catch(() => {});
    }
    const standalone = matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone;
    const dismissed = Number(localStorage.getItem(DISMISS) ?? 0) > Date.now() - 30 * 864e5;
    if (standalone || dismissed) return;
    const onBip = (e: Event) => { e.preventDefault(); setEvt(e as BIP); };
    window.addEventListener("beforeinstallprompt", onBip);
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent) && !/crios|fxios/i.test(navigator.userAgent);
    const t = isIos ? setTimeout(() => setIos(readFavs().length > 0), 0) : undefined; // only nudge iOS users who already saved something
    return () => { window.removeEventListener("beforeinstallprompt", onBip); clearTimeout(t); };
  }, []);
  const dismiss = () => { localStorage.setItem(DISMISS, String(Date.now())); setEvt(null); setIos(false); };
  if (!evt && !ios) return null;
  return (<div role="dialog" aria-label="Install ThriftRadarFL" className="fixed inset-x-2 bottom-2 z-40 mx-auto flex max-w-md items-center gap-3 rounded-sm border border-royal-dark bg-royal-dark p-3 text-sm text-white shadow-lg sm:bottom-4">
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src="/icons/icon-192.png" alt="" width={40} height={40} className="rounded-sm" />
    <div className="min-w-0 flex-1">{evt ? <><b>Add ThriftRadar to your home screen</b><div className="text-xs text-blue-100">Saved sales work offline.</div></>
      : <><b>Install on iPhone</b><div className="text-xs text-blue-100">Tap Share, then “Add to Home Screen”.</div></>}</div>
    {evt && <button type="button" className="btn-red px-3 py-1.5 text-sm" onClick={async () => { await evt.prompt(); await evt.userChoice; setEvt(null); }}>Install</button>}
    <button type="button" aria-label="Dismiss" className="px-2 py-1 text-lg leading-none text-blue-100 hover:text-white" onClick={dismiss}>×</button></div>);
}
