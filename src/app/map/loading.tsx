export default function Loading() {
  return (<div role="status" aria-live="polite" aria-busy="true" className="skel-wrap space-y-3"><span className="sr-only">Loading map…</span>
    <div className="skel-head -mx-4 -mt-4 h-20 border-b-4 border-cta" />
    <div className="panel grid grid-cols-2 gap-2 p-3 sm:grid-cols-5"><span className="skel h-10 rounded-sm" /><span className="skel h-10 rounded-sm" /><span className="skel h-10 rounded-sm" /><span className="skel h-10 rounded-sm" /><span className="skel h-10 rounded-sm" /></div>
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div className="panel overflow-hidden md:col-span-2"><div className="panel-head">Map</div><div className="map-frame skel" aria-hidden="true" /></div>
      <div className="panel md:min-h-[calc(2.5rem+520px)]"><div className="panel-head">List</div><div className="space-y-3 p-3">{[0,1,2,3,4].map((i) => <span key={i} className="skel skel-bar w-full" />)}</div></div>
    </div></div>);
}
