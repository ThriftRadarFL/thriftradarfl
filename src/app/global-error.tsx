"use client";
// Last-resort boundary: replaces the root layout if the layout itself (nav/footer) throws. Self-contained inline styles
// so it still renders when the app CSS or layout failed.
import { useEffect } from "react";
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (<html lang="en"><body style={{ margin: 0, fontFamily: "Arial, Helvetica, sans-serif", background: "#eef1f5", color: "#1a1a1a" }}>
    <main style={{ maxWidth: 560, margin: "48px auto", background: "#fff", border: "1px solid #a9b2bf", boxShadow: "0 2px 6px rgba(0,0,0,.15)" }}>
      <h1 style={{ margin: 0, padding: "10px 16px", fontSize: 16, textTransform: "uppercase", color: "#fff", background: "linear-gradient(#0b3d91,#072a66)" }}>ThriftRadarFL hit a snag</h1>
      <div role="alert" style={{ padding: 16, fontSize: 14 }}>
        <p>Something broke while loading the site. It&apos;s not you — please try again.</p>
        {error.digest && <p style={{ fontSize: 12, color: "#555" }}>Reference: {error.digest}</p>}
        <p style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button type="button" onClick={reset} style={{ padding: "8px 16px", fontWeight: 700, color: "#fff", border: "1px solid #a30014", borderRadius: 3, background: "linear-gradient(#e8233a,#d4001a)", cursor: "pointer" }}>Try again</button>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" style={{ color: "#0b3d91" }}>Back to home</a></p></div></main></body></html>);
}
