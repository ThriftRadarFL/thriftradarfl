export default function Loading() {
  return (<div role="status" aria-live="polite" aria-busy="true" className="skel-wrap space-y-3"><span className="sr-only">Loading calendar…</span>
    <div className="skel-head -mx-4 -mt-4 h-20 border-b-4 border-cta" />
    <span className="skel skel-bar mb-2 w-2/3" />
    <div className="panel"><div className="panel-head">Next 14 days</div>
      <div className="calendar-frame calendar-frame-skel grid grid-cols-1 gap-px bg-line sm:grid-cols-7">
        {Array.from({ length: 14 }, (_, i) => <div key={i} className="bg-white sm:min-h-40"><div className="border-b border-line bg-paper px-2 py-1"><span className="skel skel-bar w-1/2" /></div><div className="space-y-2 p-2"><span className="skel skel-bar w-full" /><span className="skel skel-bar w-3/4" /></div></div>)}
      </div></div></div>);
}
