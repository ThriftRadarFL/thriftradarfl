"use client";
import Link from "next/link";
import { useState } from "react";
import { useFavs, writeFavs } from "@/components/FavButton";
import { sharedListPath } from "@/lib/share-list";
type S = { slug: string; title: string; city: string; first: string; last: string };
export default function SavedList({ sales }: { sales: S[] }) {
  const favs = useFavs(); const [msg, setMsg] = useState("");
  if (favs === null) return <div className="panel skel-wrap space-y-3 p-4" aria-busy="true"><span className="sr-only">Loading saved sales…</span>{[0, 1, 2].map((i) => <div key={i} className="skel h-12 rounded-sm" />)}</div>;
  const mine = sales.filter((s) => favs.includes(s.slug)); const gone = favs.filter((f) => !sales.some((s) => s.slug === f));
  if (!mine.length) return <p className="panel p-4 text-sm">No saved sales yet. Tap <span aria-hidden="true">♡</span> <b>Save</b> on any sale to keep it here (stored only in this browser). <Link href="/sales" className="link">Browse sales</Link></p>;
  const share = async () => {
    const url = location.origin + sharedListPath(mine.map((s) => s.slug));
    if (navigator.share) { try { await navigator.share({ title: "My ThriftRadarFL sale list", url }); return; } catch { /* cancelled → copy */ } }
    try { await navigator.clipboard.writeText(url); setMsg("Link copied — anyone with it can see and save this list."); } catch { setMsg(url); }
  };
  return (<div className="panel"><h2 className="panel-head">Saved ({mine.length})</h2><ul>{mine.map((s) => <li key={s.slug} className="flex items-center gap-2 border-b border-line px-4 py-2 text-sm last:border-0">
    <Link href={`/sales/${s.slug}`} className="link">{s.title}</Link><span className="text-xs text-gray-600">{s.city} · {s.first}{s.last !== s.first ? ` – ${s.last}` : ""}</span>
    <button type="button" className="ml-auto text-xs text-red-700 hover:underline" onClick={() => writeFavs(favs.filter((x) => x !== s.slug))}>Remove</button></li>)}</ul>
    <div className="flex flex-wrap items-center gap-2 border-t border-line bg-paper px-4 py-2"><button type="button" className="btn-gray px-2 py-1 text-xs" onClick={share}>Share this list</button>
      <p role="status" aria-live="polite" className="min-w-0 break-all text-xs text-teal">{msg}</p></div>
    {gone.length > 0 && <p className="px-4 py-2 text-xs text-gray-600">{gone.length} saved sale(s) are no longer listed. <button type="button" className="underline" onClick={() => writeFavs(favs.filter((f) => !gone.includes(f)))}>Clear them</button></p>}</div>);
}
