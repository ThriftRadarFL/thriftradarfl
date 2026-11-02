export default function Loading() {
  return (<div role="status" aria-live="polite" className="animate-pulse space-y-3"><span className="sr-only">Loading…</span>
    <div className="-mx-4 -mt-4 h-20 bg-royal/80" /><div className="grid gap-3 lg:grid-cols-2">{[0, 1, 2, 3].map((i) => <div key={i} className="panel h-28 bg-white" />)}</div></div>);
}
