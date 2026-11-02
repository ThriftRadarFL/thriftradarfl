import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { getSales, getVenues } from "@/lib/data";
import { SALE_TYPES, VENUE_TYPES } from "@/lib/validate";
import { PageHead } from "@/components/ui";
import { login, logout, saveSale, saveVenue, removeSale } from "./actions";
export const dynamic = "force-dynamic";
export const metadata = { title: "Admin | ThriftRadarFL", robots: { index: false } };
const inp = "mt-1 block w-full border border-line px-2 py-1.5 text-sm font-normal";
const F = ({ n, l, d, t }: { n: string; l: string; d?: string | number; t?: string }) => <label className="block text-xs font-bold">{l}<input name={n} type={t ?? "text"} defaultValue={d} className={inp} /></label>;
type SP = { searchParams: Promise<{ err?: string; msg?: string; sale?: string; venue?: string }> };
export default async function Admin({ searchParams }: SP) {
  const sp = await searchParams;
  if (!process.env.ADMIN_PASSWORD) return <div><PageHead title="Admin" /><p>Set <code>ADMIN_PASSWORD</code> in <code>.env.local</code> and restart to enable admin.</p></div>;
  if (!(await isAdmin())) return (<div><PageHead title="Admin login" />
    <form action={login} className="panel max-w-sm p-4 space-y-3"><F n="password" l="Password" t="password" />
      {sp.err && <p className="text-sm text-red-700">Wrong password.</p>}<button className="btn-red w-full">Log in</button></form></div>);
  const [sales, venues] = await Promise.all([getSales(), getVenues()]);
  const es = sales.find((s) => s.slug === sp.sale); const ev = venues.find((v) => v.slug === sp.venue);
  return (<div><PageHead title="Admin" sub="Local JSON data layer (data/*.json) — swaps to Postgres later" />
    {sp.msg && <p className="mb-3 border border-line bg-paper p-2 text-sm font-bold">{sp.msg}</p>}
    <form action={logout} className="mb-3"><button className="btn-gray text-xs">Log out</button></form>
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="panel"><div className="panel-head">{es ? `Edit sale: ${es.slug}` : "Add sale"}</div>
        <form action={saveSale} key={es?.slug ?? "new"} className="p-4 space-y-2">
          {es && <input type="hidden" name="slug" value={es.slug} />}
          <F n="title" l="Title" d={es?.title} />
          <label className="block text-xs font-bold">Type<select name="type" defaultValue={es?.type ?? "estate"} className={inp}>{SALE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-2"><F n="city" l="City" d={es?.city} /><F n="zip" l="ZIP" d={es?.zip} /><F n="lat" l="Lat" d={es?.lat} /><F n="lng" l="Lng" d={es?.lng} /></div>
          <F n="sourceUrl" l="Source URL" d={es?.sourceUrl} /><F n="paymentMethods" l="Payment (comma-sep)" d={es?.paymentMethods.join(", ") ?? "cash"} />
          <label className="block text-xs font-bold">Days — one per line: YYYY-MM-DD HH:MM HH:MM [discount%]<textarea name="days" rows={4} defaultValue={es?.days.map((d) => `${d.date} ${d.start} ${d.end} ${d.discountPct}`).join("\n")} className={inp + " font-mono"} /></label>
          <button className="btn-red">Save sale</button> {es && <Link href="/admin" className="text-sm underline">New instead</Link>}</form></div>
      <div className="panel"><div className="panel-head">{ev ? `Edit venue: ${ev.slug}` : "Add venue"}</div>
        <form action={saveVenue} key={ev?.slug ?? "newv"} className="p-4 space-y-2">
          {ev && <input type="hidden" name="slug" value={ev.slug} />}
          <F n="name" l="Name" d={ev?.name} /><F n="org" l="Org key" d={ev?.org} />
          <label className="block text-xs font-bold">Type<select name="type" defaultValue={ev?.type ?? "thrift"} className={inp}>{VENUE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
          <F n="address" l="Address" d={ev?.address} />
          <div className="grid grid-cols-2 gap-2"><F n="city" l="City" d={ev?.city} /><F n="zip" l="ZIP" d={ev?.zip} /><F n="lat" l="Lat" d={ev?.lat} /><F n="lng" l="Lng" d={ev?.lng} /></div>
          <div className="grid grid-cols-2 gap-2"><F n="phone" l="Phone" d={ev?.phone ?? ""} /><F n="hours" l="Hours (daily)" d={ev?.hoursJson ? Object.values(ev.hoursJson)[0] : ""} /></div>
          <F n="notes" l="Notes" d={ev?.notes} />
          <button className="btn-red">Save venue</button> {ev && <Link href="/admin" className="text-sm underline">New instead</Link>}</form></div>
      <div className="panel"><div className="panel-head">Sales ({sales.length})</div><ul className="text-sm">{sales.map((s) => <li key={s.slug} className="flex items-center gap-2 border-b border-line px-3 py-1.5">
        <Link href={`/admin?sale=${s.slug}`} className="hover:underline">{s.title}</Link><span className="text-xs text-gray-500">{s.days[0]?.date}</span>
        <form action={removeSale} className="ml-auto"><input type="hidden" name="slug" value={s.slug} /><button className="text-xs text-red-700">delete</button></form></li>)}</ul></div>
      <div className="panel"><div className="panel-head">Venues ({venues.length})</div><ul className="text-sm">{venues.map((v) => <li key={v.slug} className="border-b border-line px-3 py-1.5">
        <Link href={`/admin?venue=${v.slug}`} className="hover:underline">{v.name}</Link> <span className="text-xs text-gray-500">{v.city}</span></li>)}</ul></div>
    </div></div>);
}
