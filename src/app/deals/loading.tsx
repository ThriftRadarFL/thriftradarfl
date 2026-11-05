export default function Loading() {
  return (<div role="status" aria-live="polite" aria-busy="true" className="skel-wrap space-y-3"><span className="sr-only">Loading…</span>
    <div className="skel-head -mx-4 -mt-4 h-20 border-b-4 border-cta" />
    <div className="grid gap-3 lg:grid-cols-2">{[0, 1, 2, 3].map((i) => <div key={i} className="panel space-y-3 p-3"><span className="skel skel-bar w-2/3" /><span className="skel skel-bar w-full" /><span className="skel skel-bar w-1/2" /></div>)}</div></div>);
}
