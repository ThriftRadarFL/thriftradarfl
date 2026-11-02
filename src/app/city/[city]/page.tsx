export default async function City({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params; const name = city.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
  return (<div><h1 className="text-2xl font-bold">Estate Sales & Thrift Deals in {name}, FL</h1><p>TODO: filtered list + SEO copy.</p></div>);
}
