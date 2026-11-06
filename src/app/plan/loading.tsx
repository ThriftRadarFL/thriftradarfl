export default function Loading() {
  return (<div role="status" aria-live="polite" aria-busy="true" className="skel-wrap space-y-3"><span className="sr-only">Loading route planner…</span>
    <div className="skel-head -mx-4 -mt-4 h-20 border-b-4 border-cta" />
    <div className="plan-frame skel-wrap grid gap-4 md:grid-cols-3">
      <div className="panel space-y-3 p-3"><span className="skel skel-bar w-2/3" /><span className="skel skel-bar w-full" /><span className="skel skel-bar w-1/2" /></div>
      <div className="panel space-y-3 p-3 md:col-span-2"><span className="skel skel-bar w-1/3" /><span className="skel skel-bar w-full" /><span className="skel skel-bar w-4/5" /><span className="skel skel-bar w-2/3" /></div>
    </div></div>);
}
