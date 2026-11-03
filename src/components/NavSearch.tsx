"use client";
// Nav search box with search-as-you-type suggestions (ARIA 1.2 combobox). Without JS it's a plain GET form to /search.
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
type S = { kind: "store" | "sale" | "city"; label: string; sub: string; href: string };
const KIND: Record<S["kind"], string> = { store: "Store", sale: "Sale", city: "City" };
const KIND_BG: Record<S["kind"], string> = { store: "bg-teal", sale: "bg-cta", city: "bg-royal" };
export default function NavSearch() {
  const [q, setQ] = useState(""); const [items, setItems] = useState<S[]>([]); const [open, setOpen] = useState(false); const [active, setActive] = useState(-1);
  const router = useRouter(); const id = useId(); const listId = `${id}-list`; const box = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const term = q.trim(); if (term.length < 2) { setItems([]); return; }
    const ctl = new AbortController(); const t = setTimeout(() => {
      fetch(`/api/suggest?q=${encodeURIComponent(term)}`, { signal: ctl.signal }).then((r) => (r.ok ? r.json() : { data: [] })).then((j: { data: S[] }) => { setItems(j.data ?? []); setActive(-1); setOpen(true); }).catch(() => {});
    }, 140);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [q]);
  useEffect(() => { const off = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); }; document.addEventListener("mousedown", off); return () => document.removeEventListener("mousedown", off); }, []);
  const show = open && q.trim().length >= 2;
  const go = (s: S) => { setOpen(false); setQ(""); router.push(s.href); };
  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && items.length) { e.preventDefault(); setOpen(true); setActive((a) => (a + 1) % items.length); }
    else if (e.key === "ArrowUp" && items.length) { e.preventDefault(); setActive((a) => (a <= 0 ? items.length - 1 : a - 1)); }
    else if (e.key === "Escape") { if (show) { e.preventDefault(); setOpen(false); setActive(-1); } }
    else if (e.key === "Enter" && show && active >= 0 && items[active]) { e.preventDefault(); go(items[active]); }
  };
  return (<form ref={box} action="/search" role="search" aria-label="Site search" className="relative order-last flex w-full gap-1 sm:order-none sm:ml-auto sm:w-auto">
    <label htmlFor="nav-q" className="sr-only">Search sales and stores</label>
    <input id="nav-q" name="q" type="search" autoComplete="off" placeholder="Search sales & stores" value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onKeyDown={onKey} onFocus={() => items.length && setOpen(true)}
      role="combobox" aria-autocomplete="list" aria-expanded={show && items.length > 0} aria-controls={listId} aria-activedescendant={show && active >= 0 ? `${listId}-${active}` : undefined}
      className="min-w-0 flex-1 rounded-sm border border-white/30 bg-white px-2 py-1.5 text-sm text-ink sm:w-56" />
    <button className="btn-gray px-3 py-1.5 text-sm">Go</button>
    <div hidden={!show || !items.length} className="absolute left-0 right-0 top-full z-40 mt-1 overflow-hidden rounded-sm border border-royal bg-white text-ink shadow-[0_4px_14px_rgba(0,0,0,0.35)] sm:right-auto sm:w-96">
    <ul id={listId} role="listbox" aria-label="Suggestions">
      {items.map((s, i) => <li key={s.href} id={`${listId}-${i}`} role="option" aria-selected={i === active} onMouseDown={(e) => { e.preventDefault(); go(s); }} onMouseEnter={() => setActive(i)}
        className={`flex cursor-pointer items-center gap-2 border-b border-line px-2 py-2 text-sm last:border-0 ${i === active ? "bg-gradient-to-b from-[#e8eefa] to-[#d3def3]" : ""}`}>
        <span className={`pill ${KIND_BG[s.kind]} w-12 shrink-0 text-center text-[10px] uppercase`}>{KIND[s.kind]}</span>
        <span className="min-w-0"><span className="block truncate font-bold text-royal">{s.label}</span><span className="block truncate text-xs text-gray-600">{s.sub}</span></span></li>)}
    </ul><p className="bg-paper px-2 py-1.5 text-xs"><a href={`/search?q=${encodeURIComponent(q.trim())}`} className="font-bold text-royal underline" onMouseDown={(e) => e.preventDefault()} onClick={() => setOpen(false)}>See all results for “{q.trim()}” →</a></p></div></form>);
}
