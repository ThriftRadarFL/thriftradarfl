import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import path from "node:path";
let logo: string | null = null;
const logoSrc = () => (logo ??= `data:image/png;base64,${readFileSync(path.join(process.cwd(), "public/logo-horizontal-lg.png")).toString("base64")}`);
export const ogSize = { width: 1200, height: 630 };
export function ogCard({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return new ImageResponse(
    (<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0b3d91", color: "#fff", fontFamily: "sans-serif", padding: 64 }}>
      <div style={{ display: "flex", alignSelf: "flex-start", background: "#fff", borderRadius: 16, padding: "10px 16px", boxShadow: "0 2px 8px rgba(0,0,0,0.35)" }}>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img src={logoSrc()} width={438} height={120} /></div>
      <div style={{ display: "flex", marginTop: 48, fontSize: 30, color: "#f5b400", textTransform: "uppercase", letterSpacing: 2 }}>{kicker}</div>
      <div style={{ display: "flex", marginTop: 16, fontSize: title.length > 50 ? 60 : 76, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
      {sub && <div style={{ display: "flex", marginTop: 24, fontSize: 34, color: "#cfe0ff" }}>{sub}</div>}
      <div style={{ display: "flex", marginTop: "auto", height: 12, background: "#d4001a", marginLeft: -64, marginRight: -64, marginBottom: -64 }} />
    </div>), ogSize);
}
