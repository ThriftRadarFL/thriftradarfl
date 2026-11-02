import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { getAllSales, getVenues, listSubscribers, dataMode, dbStatus, getDealRules, listSubmissions, listContacts, listAudit } from "@/lib/data";
import { SALE_TYPES, VENUE_TYPES } from "@/lib/validate";
import { DAYS, DEAL_KINDS } from "@/lib/deal-rules";
import { TAGS } from "@/lib/flip-tips";
import { PageHead } from "@/components/ui";
import ConfirmButton from "@/components/ConfirmButton";
import CsvImport from "./CsvImport";
import { importFromUrl } from "@/lib/importer";
import type { Sale } from "@/lib/data";
import { login, logout, saveSale, saveVenue, removeSale, removeVenue, togglePublish, saveRule, removeRule, removeSub, reviewSubmission, removeContact } from "./actions";
export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false, follow: false } };
const inp = "mt-1 block w-full border border-line px-2 py-1.5 text-sm font-normal";
type FP = { n: string; l: string; d?: string | number; t?: string; req?: boolean; pattern?: string; title?: string; step?: string };
const F = ({ n, l, d, t, req, pattern, title, step }: FP) => <label className="block text-xs font-bold">{l}{req && <span className="text-red-700"> *</span>}<input name={n} type={t ?? "text"} defaultValue={d} required={req} pattern={pattern} title={title} step={step} className={inp} /></label>;
const LAT = { t: "number", step: "any" };
type SP = { searchParams: Promise<{ err?: string; msg?: string; sale?: string; venue?: string; rule?: string; import?: string }> };
const Panel = ({ title, children, id }: { title: React.ReactNode; children: React.ReactNode; id?: string }) => <section id={id} className="panel scroll-mt-4"><h2 className="panel-head">{title}</h2>{children}</section>;
const row = "flex flex-wrap items-center gap-2 border-b border-line px-3 py-1.5 last:border-0";

export default async function Admin({ searchParams }: SP) {
  const sp = await searchParams;
  if (!process.env.ADMIN_PASSWORD) return <div><PageHead title="Admin" /><p>Set <code>ADMIN_PASSWORD</code> in <code>.env.local</code> and restart to enable admin.</p></div>;
  if (!(await isAdmin())) return (<div><PageHead title="Admin login" />
    <form action={login} className="panel max-w-sm p-4 space-y-3"><F n="password" l="Password" t="password" req />
      {sp.err && <p role="alert" className="text-sm text-red-700">Wrong password.</p>}<button className="btn-red w-full">Log in</button></form></div>);
  const [sales, venues, subs, rules, pending, contacts, log] = await Promise.all([getAllSales(), getVenues(), listSubscribers(), getDealRules(), listSubmissions(), listContacts(), listAudit(100)]);
  const found = sales.find((s) => s.slug === sp.sale);
  let draft: Partial<Sale> | null = null, importErr = "";
  if (sp.import) { try { draft = await importFromUrl(sp.import); } catch (e) { importErr = (e as Error).message; } }
  const es = (found ?? draft ?? undefined) as Sale | undefined; const ev = venues.find((v) => v.slug === sp.venue); const er = rules.find((r) => r.id === sp.rule);
  const vname = (s: string) => venues.find((v) => v.slug === s)?.name ?? s; const db = dbStatus();
  const isErr = sp.msg?.startsWith("Not saved");
  return (<div><PageHead title="Admin" sub={`Data: ${dataMode()}${db.configured && !db.up ? ` (database unreachable: ${db.lastError} — using JSON fallback)` : ""}`} />
    {sp.msg && <p role="status" className={`mb-3 border p-2 text-sm font-bold ${isErr ? "border-red-300 bg-red-50 text-red-800" : "border-line bg-paper"}`}>{sp.msg}</p>}
    <nav aria-label="Admin sections" className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"><form action={logout}><button className="btn-gray text-xs">Log out</button></form>
      <a href="#pending" className="underline">Pending ({pending.length})</a><a href="#sales" className="underline">Sales ({sales.length})</a><a href="#venues" className="underline">Venues ({venues.length})</a>
      <a href="#rules" className="underline">Deal rules ({rules.length})</a><a href="#subs" className="underline">Subscribers ({subs.length})</a><a href="#messages" className="underline">Messages ({contacts.length})</a><a href="#import" className="underline">CSV import</a><a href="#audit" className="underline">Audit log</a>
      <a href="/api/admin/subscribers" className="underline">Export CSV</a><a href="/digest/preview" className="underline" target="_blank" rel="noopener">Preview digest</a><a href="/api/calendar" className="underline">Calendar feed</a></nav>
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel id="pending" title={`Pending submissions (${pending.length})`}><ul className="text-sm">{pending.map((p) => <li key={p.id} className="border-b border-line px-3 py-2 last:border-0">
        <b>{p.sale.title}</b> <span className="text-xs text-gray-600">{p.sale.city} · {p.sale.days.map((d) => d.date).join(", ")} · from {p.email}</span>
        {p.sale.description && <p className="text-xs text-gray-600">{p.sale.description}</p>}
        {p.sale.sourceUrl && <a href={p.sale.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline">source</a>}
        <div className="mt-1 flex gap-3"><form action={reviewSubmission}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="approve" value="true" /><button className="text-xs font-bold text-teal hover:underline">Approve &amp; publish</button></form>
          <form action={reviewSubmission}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="approve" value="false" /><ConfirmButton message={`Reject "${p.sale.title}"?`}>Reject</ConfirmButton></form></div></li>)}
        {!pending.length && <li className="px-3 py-2 text-gray-600">No submissions waiting.</li>}</ul></Panel>
      <Panel id="messages" title={`Contact messages (${contacts.length})`}><ul className="text-sm">{[...contacts].reverse().map((c) => <li key={c.id} className="border-b border-line px-3 py-2 last:border-0">
        <b>{c.name}</b> <a className="text-xs underline" href={`mailto:${c.email}`}>{c.email}</a> <span className="text-xs text-gray-600">{c.at.slice(0, 16).replace("T", " ")}</span>
        <p className="whitespace-pre-wrap text-xs">{c.message}</p><form action={removeContact}><input type="hidden" name="id" value={c.id} /><ConfirmButton message="Delete this message?">delete</ConfirmButton></form></li>)}
        {!contacts.length && <li className="px-3 py-2 text-gray-600">No messages.</li>}</ul></Panel>

      <Panel title={found ? `Edit sale: ${found.slug}` : draft ? "Add sale (imported draft — review before saving)" : "Add sale"}>
        <form method="get" className="flex gap-2 border-b border-line p-3"><label className="sr-only" htmlFor="import">Listing URL</label><input id="import" name="import" type="url" placeholder="Paste EstateSales.net listing URL to prefill" className={inp + " mt-0"} defaultValue={sp.import} /><button className="btn-gray text-xs">Import</button></form>
        {importErr && <p role="alert" className="px-4 pt-2 text-sm text-red-700">Import failed: {importErr}</p>}
        <form action={saveSale} key={es?.slug ?? "new"} className="p-4 space-y-2">
          {found && <input type="hidden" name="slug" value={found.slug} />}
          <F n="title" l="Title" d={es?.title} req />
          <label className="block text-xs font-bold">Type<select name="type" defaultValue={es?.type ?? "estate"} className={inp}>{SALE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
          <div className="grid grid-cols-2 gap-2"><F n="city" l="City" d={es?.city} req /><F n="zip" l="ZIP" d={es?.zip} pattern="\d{5}" title="5-digit ZIP" /><F n="lat" l="Lat" d={es?.lat} {...LAT} /><F n="lng" l="Lng" d={es?.lng} {...LAT} /></div>
          <F n="sourceUrl" l="Source URL" d={es?.sourceUrl} t="url" /><F n="paymentMethods" l="Payment (comma-sep)" d={es?.paymentMethods?.join(", ") ?? "cash"} />
          <F n="tags" l={`Items to look for (comma-sep: ${TAGS.join(", ")})`} d={es?.tags?.join(", ")} />
          <label className="block text-xs font-bold">Description<textarea name="description" rows={2} maxLength={2000} defaultValue={es?.description} className={inp} /></label>
          <label className="block text-xs font-bold">Days — one per line: YYYY-MM-DD HH:MM HH:MM [discount%]<span className="text-red-700"> *</span><textarea name="days" rows={4} required defaultValue={es?.days?.map((d) => `${d.date} ${d.start} ${d.end} ${d.discountPct}`).join("\n")} className={inp + " font-mono"} /></label>
          <label className="flex items-center gap-2 text-xs font-bold"><input type="hidden" name="published" value="false" /><input type="checkbox" name="published" value="true" defaultChecked={es?.published !== false} /> Published (visible on the site)</label>
          <button className="btn-red">Save sale</button> {es && <Link href="/admin" className="text-sm underline">New instead</Link>}</form></Panel>
      <Panel id="venues" title={ev ? `Edit venue: ${ev.slug}` : "Add venue"}>
        <form action={saveVenue} key={ev?.slug ?? "newv"} className="p-4 space-y-2">
          {ev && <input type="hidden" name="slug" value={ev.slug} />}
          <F n="name" l="Name" d={ev?.name} req /><F n="org" l="Org key" d={ev?.org} />
          <label className="block text-xs font-bold">Type<select name="type" defaultValue={ev?.type ?? "thrift"} className={inp}>{VENUE_TYPES.map((t) => <option key={t}>{t}</option>)}</select></label>
          <F n="address" l="Address" d={ev?.address} />
          <div className="grid grid-cols-2 gap-2"><F n="city" l="City" d={ev?.city} req /><F n="zip" l="ZIP" d={ev?.zip} pattern="\d{5}" title="5-digit ZIP" /><F n="lat" l="Lat" d={ev?.lat} {...LAT} /><F n="lng" l="Lng" d={ev?.lng} {...LAT} /></div>
          <div className="grid grid-cols-2 gap-2"><F n="phone" l="Phone" d={ev?.phone ?? ""} t="tel" /><F n="hours" l="Hours (daily)" d={ev?.hoursJson ? Object.values(ev.hoursJson)[0] : ""} /></div>
          <F n="notes" l="Notes" d={ev?.notes} /><F n="sourceUrl" l="Source URL (where address/hours were verified)" d={ev?.sourceUrl} t="url" />
          <button className="btn-red">Save venue</button> {ev && <Link href="/admin" className="text-sm underline">New instead</Link>}</form></Panel>

      <Panel id="sales" title={`Sales (${sales.length})`}><ul className="text-sm">{sales.map((s) => <li key={s.slug} className={row}>
        <Link href={`/admin?sale=${s.slug}`} className="hover:underline">{s.title}</Link><span className="text-xs text-gray-600">{s.days[0]?.date}</span>
        {s.published === false && <span className="pill bg-gray-700">draft</span>}
        <span className="ml-auto flex gap-3"><form action={togglePublish}><input type="hidden" name="slug" value={s.slug} /><input type="hidden" name="published" value={String(s.published === false)} /><button className="text-xs underline">{s.published === false ? "publish" : "unpublish"}</button></form>
          <form action={removeSale}><input type="hidden" name="slug" value={s.slug} /><ConfirmButton message={`Delete sale "${s.title}"? This cannot be undone.`}>delete</ConfirmButton></form></span></li>)}
        {!sales.length && <li className="px-3 py-2 text-gray-600">No sales yet.</li>}</ul></Panel>
      <Panel title={`Venues (${venues.length})`}><ul className="text-sm">{venues.map((v) => <li key={v.slug} className={row}>
        <Link href={`/admin?venue=${v.slug}#venues`} className="hover:underline">{v.name}</Link> <span className="text-xs text-gray-600">{v.city}</span>
        <form action={removeVenue} className="ml-auto"><input type="hidden" name="slug" value={v.slug} /><ConfirmButton message={`Delete venue "${v.name}" and all its deal rules?`}>delete</ConfirmButton></form></li>)}
        {!venues.length && <li className="px-3 py-2 text-gray-600">No venues yet.</li>}</ul></Panel>

      <Panel id="rules" title={er ? `Edit deal rule` : "Add deal rule"}>
        <form action={saveRule} key={er?.id ?? "newr"} className="p-4 space-y-2">
          {er && <input type="hidden" name="id" value={er.id} />}
          <div className="grid grid-cols-2 gap-2">
            <label className="block text-xs font-bold">Venue<span className="text-red-700"> *</span><select name="venue" required defaultValue={er?.venue ?? ""} className={inp}><option value="" disabled>Choose…</option>{venues.map((v) => <option key={v.slug} value={v.slug}>{v.name}</option>)}</select></label>
            <label className="block text-xs font-bold">Day<select name="day" defaultValue={er?.day ?? 1} className={inp}>{DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}</select></label>
            <label className="block text-xs font-bold">Kind<select name="kind" defaultValue={er?.kind ?? "color_tag"} className={inp}>{DEAL_KINDS.map((k) => <option key={k}>{k}</option>)}</select></label>
            <F n="time" l="Time (HH:MM)" d={er?.time} pattern="\d{2}:\d{2}" title="HH:MM" /></div>
          <F n="label" l="Label" d={er?.label} req /><F n="discountPct" l="Discount %" d={er?.discountPct} t="number" />
          <label className="flex items-center gap-2 text-xs font-bold"><input type="checkbox" name="verified" defaultChecked={er?.verified} /> Verified with the store</label>
          <button className="btn-red">Save rule</button> {er && <Link href="/admin#rules" className="text-sm underline">New instead</Link>}</form>
        <ul className="border-t border-line text-sm">{rules.map((r) => <li key={r.id} className={row}>
          <Link href={`/admin?rule=${encodeURIComponent(r.id!)}#rules`} className="hover:underline">{DAYS[r.day]} · {r.label}</Link><span className="text-xs text-gray-600">{vname(r.venue)}{r.verified ? " · ✓ verified" : " · unverified"}</span>
          <form action={removeRule} className="ml-auto"><input type="hidden" name="id" value={r.id} /><ConfirmButton message={`Delete rule "${r.label}"?`}>delete</ConfirmButton></form></li>)}</ul></Panel>
      <Panel id="subs" title={`Digest subscribers (${subs.length})`}><ul className="max-h-96 overflow-y-auto text-sm">{subs.map((s) => <li key={s.email} className={row}>
        <span>{s.email}</span><span className="text-xs text-gray-600">{s.area} · {s.at.slice(0, 10)}</span>
        <form action={removeSub} className="ml-auto"><input type="hidden" name="email" value={s.email} /><ConfirmButton message={`Remove ${s.email} from the digest?`}>remove</ConfirmButton></form></li>)}
        {!subs.length && <li className="px-3 py-2 text-gray-600">No subscribers yet.</li>}</ul></Panel>
      <Panel id="import" title="Bulk import sales (CSV)"><CsvImport /></Panel>
      <Panel id="audit" title={`Audit log (latest ${log.length})`}><ul className="max-h-96 overflow-y-auto text-xs">{log.map((e, i) => <li key={i} className={row}>
        <time dateTime={e.at} className="text-gray-600">{new Date(e.at).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</time>
        <b>{e.action}</b><span className="min-w-0 truncate">{e.target}</span>{e.detail && <span className="min-w-0 truncate text-gray-600">{e.detail}</span>}</li>)}
        {!log.length && <li className="px-3 py-2 text-gray-600">No admin actions yet.</li>}</ul></Panel>
    </div></div>);
}
