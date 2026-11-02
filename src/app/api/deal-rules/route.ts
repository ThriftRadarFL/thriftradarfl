import { dealRules } from "@/lib/deal-rules";
import { json } from "@/lib/api";
export function GET(req: Request) {
  const v = new URL(req.url).searchParams.get("venue");
  const d = v ? dealRules.filter((r) => r.venue === v) : dealRules; return json({ data: d, count: d.length, note: "verified=false rules are unverified demo data" });
}
