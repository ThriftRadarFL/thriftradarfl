"use client";
import { useState } from "react";
export default function ShareButtons({ url, title }: { url: string; title: string }) {
  const [msg, setMsg] = useState("");
  const u = encodeURIComponent(url), t = encodeURIComponent(title);
  const native = async () => {
    if (navigator.share) { try { await navigator.share({ title, url }); return; } catch { /* cancelled */ } }
    try { await navigator.clipboard.writeText(url); setMsg("Link copied"); } catch { setMsg("Copy failed — " + url); }
    setTimeout(() => setMsg(""), 2500);
  };
  const a = "btn-gray px-2 py-1 text-xs";
  return (<div className="space-y-1"><div className="text-xs font-bold uppercase text-gray-600">Share</div>
    <div className="flex flex-wrap gap-1.5">
      <button type="button" onClick={native} className={a}>Copy / share link</button>
      <a className={a} href={`https://www.facebook.com/sharer/sharer.php?u=${u}`} target="_blank" rel="noopener noreferrer" aria-label={`Share ${title} on Facebook (opens in a new tab)`}>Facebook</a>
      <a className={a} href={`https://x.com/intent/post?url=${u}&text=${t}`} target="_blank" rel="noopener noreferrer" aria-label={`Share ${title} on X (opens in a new tab)`}>X</a>
      <a className={a} href={`mailto:?subject=${t}&body=${u}`} aria-label={`Share ${title} by email`}>Email</a></div>
    <p role="status" aria-live="polite" className="text-xs text-teal">{msg}</p></div>);
}
