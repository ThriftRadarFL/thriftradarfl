// Empty /search and result loads share the same reserved search-frame so CLS stays low at 1280px.
export default function Loading() {
  return (<div role="status" aria-live="polite" aria-busy="true" className="skel-wrap"><span className="sr-only">Searching…</span>
    <div className="skel-head -mx-4 -mt-4 mb-4 h-20 border-b-4 border-cta" />
    <div className="panel mb-4 flex gap-2 p-3"><span className="skel h-10 flex-1 rounded-sm border border-line" /><span className="skel h-10 w-24 rounded-sm" /></div>
    <div className="search-frame panel p-4"><span className="skel skel-bar mb-2 w-3/4" /><span className="skel skel-bar w-1/2" /></div></div>);
}
