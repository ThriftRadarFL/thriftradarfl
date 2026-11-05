// Skeleton shaped like the results page (heading, search box, grouped result rows) while results stream in.
export default function Loading() {
  const row = (i: number) => <li key={i} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0"><span className="skel h-10 w-10 shrink-0 rounded-sm" /><span className="flex-1 space-y-2"><span className="skel skel-bar w-3/4" /><span className="skel skel-bar w-1/2" /></span></li>;
  return (<div role="status" aria-live="polite" aria-busy="true" className="skel-wrap"><span className="sr-only">Searching…</span>
    <div className="skel-head -mx-4 -mt-4 mb-4 h-20 border-b-4 border-cta" />
    <div className="panel mb-4 flex gap-2 p-3"><span className="skel h-10 flex-1 rounded-sm border border-line" /><span className="skel h-10 w-24 rounded-sm" /></div>
    {["Sales", "Stores"].map((g) => <section key={g} className="panel mb-4"><div className="panel-head">{g}</div><ul>{[0, 1, 2].map(row)}</ul></section>)}</div>);
}
