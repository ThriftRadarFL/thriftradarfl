import { ImageResponse } from "next/og";
export const ogSize = { width: 1200, height: 630 };
export function ogCard({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return new ImageResponse(
    (<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#0b3d91", color: "#fff", fontFamily: "sans-serif", padding: 64 }}>
      <div style={{ display: "flex", alignItems: "center", fontSize: 34, fontWeight: 700 }}><span style={{ color: "#fff" }}>ThriftRadar</span><span style={{ marginLeft: 8, background: "#d4001a", padding: "2px 12px", borderRadius: 6 }}>FL</span></div>
      <div style={{ display: "flex", marginTop: 72, fontSize: 30, color: "#f5b400", textTransform: "uppercase", letterSpacing: 2 }}>{kicker}</div>
      <div style={{ display: "flex", marginTop: 16, fontSize: title.length > 50 ? 60 : 76, fontWeight: 700, lineHeight: 1.1 }}>{title}</div>
      {sub && <div style={{ display: "flex", marginTop: 24, fontSize: 34, color: "#cfe0ff" }}>{sub}</div>}
      <div style={{ display: "flex", marginTop: "auto", height: 12, background: "#d4001a", marginLeft: -64, marginRight: -64, marginBottom: -64 }} />
    </div>), ogSize);
}
