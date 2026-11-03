import Link from "next/link";
import type { Metadata } from "next";
import { PageHead } from "@/components/ui";
import { API_DOCS } from "@/lib/api-docs";
import { SITE_URL } from "@/lib/site";
import { getSales } from "@/lib/data";
import { embedSnippet } from "@/lib/embed";
export const revalidate = 3600;
const title = "Developers — free JSON API, calendar feeds & embeds";
const description = "Free read-only JSON API, Atom and iCalendar feeds and an embeddable widget for Central Florida estate sales and thrift-store deal days. No key needed.";
export const metadata: Metadata = { title, description, alternates: { canonical: "/developers" } };
const TYPE: Record<string, [string, string]> = { json: ["JSON", "bg-royal"], atom: ["ATOM", "bg-coral"], ics: ["ICS", "bg-teal"], html: ["HTML", "bg-gray-700"] };
export default async function Developers() {
  const sample = (await getSales())[0]?.slug ?? "example-sale"; const fill = (p: string) => p.replace("{slug}", sample);
  return (<div><PageHead title="Developers" sub="Free, read-only, no API key · JSON, Atom, iCalendar and an embeddable widget" />
    <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
      <div className="min-w-0 space-y-4">{API_DOCS.map((d) => { const [lab, col] = TYPE[d.type]; const ex = d.example.includes("{slug}") ? fill(d.example) : d.example; return (
        <section key={d.path} id={d.path.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")} aria-labelledby={`h-${d.path}`} className="panel overflow-hidden">
          <h2 id={`h-${d.path}`} className="panel-head flex flex-wrap items-center gap-2 normal-case tracking-normal"><span className="rounded-sm bg-cta px-1.5 py-0.5 text-xs">{d.method}</span><code className="break-all font-mono">{d.path}</code><span className={`pill ml-auto ${col}`}>{lab}</span></h2>
          <div className="space-y-2 bg-gradient-to-b from-white to-paper p-4 text-sm"><p>{d.summary}</p>
            {d.params && <table className="w-full text-xs"><thead><tr className="border-b border-line text-left text-royal"><th scope="col" className="py-1 pr-3">Query param</th><th scope="col" className="py-1">Meaning</th></tr></thead>
              <tbody>{d.params.map(([k, v]) => <tr key={k} className="border-b border-line last:border-0"><td className="py-1 pr-3 font-mono font-bold">{k}</td><td className="py-1">{v}</td></tr>)}</tbody></table>}
            <p className="text-xs"><b>Try it:</b> <a className="link break-all font-mono" href={ex} target={d.type === "html" ? "_blank" : undefined} rel="noopener">{ex}</a></p>
            <pre className="max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-sm border border-line bg-[#0f1b33] p-2 text-xs text-[#d6e4ff]"><code>{d.returns}</code></pre></div></section>); })}</div>
      <aside className="min-w-0 space-y-4"><div className="panel"><div className="panel-head">The basics</div><ul className="list-disc space-y-1.5 p-4 pl-8 text-sm">
        <li>Base URL: <code className="break-all">{SITE_URL}</code></li><li>All read endpoints are public; CORS is not enabled, so call them from your server, a shortcut app or a feed reader.</li>
        <li>Errors are JSON: <code>{`{ "error": "…" }`}</code> with a 4xx/5xx status.</li><li>Dates are <b>Eastern time</b>, <code>YYYY-MM-DD</code>; times are 24-hour <code>HH:MM</code>.</li>
        <li>Deal rules marked <code>&quot;verified&quot;: false</code> come from third-party sources. Show that to your users.</li><li>Please cache: data changes a few times a day.</li>
        <li>Writes (<code>POST/PUT/DELETE</code>) need an admin token and aren&apos;t public.</li></ul></div>
        <div className="panel"><div className="panel-head">Embed a store</div><div className="space-y-2 p-4 text-sm"><p>Paste on any site:</p>
          <textarea readOnly rows={4} aria-label="Embed code" className="w-full rounded-sm border border-line bg-paper p-2 font-mono text-xs" value={embedSnippet(SITE_URL, "goodwill-port-orange")} />
          <p className="text-xs text-gray-600">Every store page has its own code under <i>Embed this store&apos;s deal days</i>. <Link href="/stores" className="link">Browse stores →</Link></p></div></div>
        <div className="panel"><div className="panel-head">Get listed</div><p className="p-4 text-sm">Running an estate sale? <Link href="/submit" className="link">Submit it free</Link>. Questions or a bigger use? <Link href="/contact" className="link">Contact us</Link>.</p></div></aside></div></div>);
}
