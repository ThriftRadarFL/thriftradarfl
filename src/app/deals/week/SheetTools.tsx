"use client";
import { useState } from "react";
/** Print / copy-as-text / share buttons for the deal-day sheet. */
export default function SheetTools({ text, url }: { text: string; url: string }) {
  const [msg, setMsg] = useState("");
  const copy = async () => { try { await navigator.clipboard.writeText(text); setMsg("Copied — paste it into a text."); } catch { setMsg("Couldn't copy — use Print instead."); } };
  const share = async () => { if (navigator.share) { try { await navigator.share({ title: "ThriftRadarFL deal-day sheet", url }); } catch { /* cancelled */ } return; }
    try { await navigator.clipboard.writeText(url); setMsg("Link copied."); } catch { setMsg(url); } };
  return (<div className="flex flex-wrap items-center gap-2 print:hidden">
    <button type="button" onClick={() => window.print()} className="btn-red">🖨 Print sheet</button>
    <button type="button" onClick={copy} className="btn-gray">Copy as text</button>
    <button type="button" onClick={share} className="btn-gray">Share link</button>
    <p role="status" className="text-xs text-gray-600">{msg}</p></div>);
}
