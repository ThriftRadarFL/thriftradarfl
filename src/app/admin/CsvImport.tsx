"use client";
import { useActionState, useState } from "react";
import { importCsv, type CsvResult } from "./actions";
import { SALE_CSV_TEMPLATE } from "@/lib/csv";
export default function CsvImport() {
  const [res, act, pending] = useActionState<CsvResult | null, FormData>(importCsv, null); const [text, setText] = useState(""); const [fname, setFname] = useState("");
  const tpl = `data:text/csv;charset=utf-8,${encodeURIComponent(SALE_CSV_TEMPLATE)}`;
  return (<form action={act} className="space-y-2 p-4 text-sm" onSubmit={(e) => { const sub = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null; if (sub?.value === "import" && !confirm("Import these rows? Existing sales with the same slug will be overwritten.")) e.preventDefault(); }}>
    <p className="text-xs text-gray-600">Columns: title, type, city, zip, lat, lng, sourceUrl, paymentMethods, tags, description, days (<code>YYYY-MM-DD HH:MM HH:MM pct; …</code>), published. <a href={tpl} download="thriftradar-sales-template.csv" className="underline">Download template</a></p>
    <label className="block text-xs font-bold">CSV file{fname && <span className="font-normal text-gray-600"> · loaded {fname}</span>}<input type="file" accept=".csv,text/csv" className="mt-1 block w-full text-sm" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; if (f.size > 1_000_000) { alert("File over 1 MB"); return; } setText(await f.text()); setFname(f.name); }} /></label>
    <label className="block text-xs font-bold">…or paste CSV<textarea name="csv" rows={4} value={text} onChange={(e) => setText(e.target.value)} className="mt-1 block w-full border border-line px-2 py-1.5 font-mono text-xs font-normal" /></label>
    <div className="flex gap-2"><button name="mode" value="preview" className="btn-gray text-xs" disabled={pending}>{pending ? "Working…" : "Preview"}</button>
      <button name="mode" value="import" className="btn-red text-xs" disabled={pending || !res || res.mode !== "preview" || !!res.bad.length || !res.ok.length}>{`Import ${res?.mode === "preview" ? res.ok.length : ""} rows`}</button></div>
    {res && <div role="status" className="space-y-1 border-t border-line pt-2">
      {res.warnings.map((w) => <p key={w} className="text-xs text-amber-800">⚠ {w}</p>)}
      <p className="text-xs font-bold">{res.mode === "import" && !res.bad.length && res.ok.length ? `✓ Imported ${res.ok.length} sales` : `${res.ok.length} valid · ${res.bad.length} with errors`}</p>
      {res.bad.map((b) => <p key={b.row} className="text-xs text-red-700">Row {b.row}: {b.errors.join("; ")}</p>)}
      <ul className="max-h-40 overflow-y-auto text-xs">{res.ok.map((o) => <li key={o.slug}>{o.exists ? "↻ update" : "+ new"} · {o.title} <span className="text-gray-600">({o.slug})</span></li>)}</ul></div>}
  </form>);
}
