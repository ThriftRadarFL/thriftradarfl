export function PageHead({ title, sub }: { title: string; sub?: string }) {
  return (<div className="bg-royal text-white -mx-4 -mt-4 mb-4 px-6 py-4 border-b-4 border-cta">
    <h1 className="text-2xl">{title}</h1>{sub && <p className="mt-1 text-sm text-blue-100">{sub}</p>}</div>);
}
export function DayBox({ date }: { date: string }) {
  const d = new Date(date + "T12:00:00");
  return (<div className="daybox py-0.5">
    <span className="text-[10px] font-bold uppercase text-cta">{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
    <span className="text-xl font-bold text-royal">{d.getDate()}</span>
    <span className="text-[10px] uppercase text-gray-500">{d.toLocaleDateString("en-US", { month: "short" })}</span></div>);
}
export function Discount({ pct }: { pct?: number | null }) {
  if (!pct) return <span className="pill bg-gray-500">Full price</span>;
  return <span className={`pill ${pct >= 50 ? "bg-coral" : "bg-teal"}`}>{pct}% OFF</span>;
}
export const typeLabel: Record<string, string> = { estate: "Estate Sale", auction: "Auction", thrift: "Thrift", outlet_bins: "Outlet Bins", yard: "Yard Sale", auction_house: "Auction House" };
