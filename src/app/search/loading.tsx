// Skeleton shaped like the results page (heading, search box, grouped result rows) while results stream in.
export default function Loading() {
  const row = (i: number) => <li key={i} className="flex items-center gap-3 border-b border-line px-4 py-3 last:border-0"><span className="h-10 w-10 shrink-0 rounded-sm bg-[#d5dae1]" /><span className="flex-1 space-y-2"><span className="block h-3 w-3/4 rounded bg-[#d5dae1]" /><span className="block h-2.5 w-1/2 rounded bg-[#e6e9ee]" /></span></li>;
  return (<div role="status" aria-live="polite" aria-busy="true" className="animate-pulse"><span className="sr-only">Searching…</span>
    <div className="-mx-4 -mt-4 mb-4 h-20 border-b-4 border-cta bg-gradient-to-r from-royal-dark via-royal to-royal-dark" />
    <div className="panel mb-4 flex gap-2 p-3"><span className="h-10 flex-1 rounded-sm border border-line bg-paper" /><span className="h-10 w-24 rounded-sm bg-cta/70" /></div>
    {["Sales", "Stores"].map((g) => <section key={g} className="panel mb-4"><div className="panel-head">{g}</div><ul>{[0, 1, 2].map(row)}</ul></section>)}</div>);
}
