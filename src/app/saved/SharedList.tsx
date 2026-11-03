"use client";
import Link from "next/link";
import { useState } from "react";
import { useFavs, writeFavs } from "@/components/FavButton";
import { mergeFavs } from "@/lib/share-list";
type S = { slug: string; title: string; city: string; first: string; last: string };
/** A list someone shared via /saved?list=… — read-only until you copy it into your own saved sales. */
export default function SharedList({ sales, missing }: { sales: S[]; missing: number }) {
  const favs = useFavs(); const [done, setDone] = useState("");
  const newOnes = favs ? sales.filter((s) => !favs.includes(s.slug)).length : sales.length;
  const saveAll = () => setDone(writeFavs(mergeFavs(favs ?? [], sales.map((s) => s.slug))) ? `Added ${newOnes} sale${newOnes === 1 ? "" : "s"} to your saved list.` : "Couldn't save in this browser (private mode or storage full).");
  return (<section aria-labelledby="shared-h" className="panel mb-4 border-2 border-cta">
    <h2 id="shared-h" className="panel-head">Shared with you ({sales.length} sale{sales.length === 1 ? "" : "s"})</h2>
    {sales.length ? <ul>{sales.map((s) => <li key={s.slug} className="flex flex-wrap items-center gap-x-2 border-b border-line px-4 py-2 text-sm last:border-0">
      <Link href={`/sales/${s.slug}`} className="link">{s.title}</Link><span className="text-xs text-gray-600">{s.city} · {s.first}{s.last !== s.first ? ` – ${s.last}` : ""}</span>
      {favs?.includes(s.slug) && <span className="ml-auto text-xs text-teal">♥ in your list</span>}</li>)}</ul>
      : <p className="p-4 text-sm text-gray-700">None of the sales in this link are listed anymore.</p>}
    {missing > 0 && <p className="px-4 pt-2 text-xs text-gray-600">{missing} sale{missing === 1 ? " in this link has" : "s in this link have"} ended or been removed.</p>}
    {sales.length > 0 && <div className="flex flex-wrap items-center gap-2 p-4">
      <button type="button" className="btn-red" onClick={saveAll} disabled={favs !== null && newOnes === 0}>{favs !== null && newOnes === 0 ? "All already saved" : `Save ${newOnes === sales.length ? "all" : newOnes} to my list`}</button>
      <Link href="/plan" className="btn-gray">Plan a route</Link>
      <p role="status" aria-live="polite" className="w-full text-xs text-teal">{done}</p></div>}
  </section>);
}
