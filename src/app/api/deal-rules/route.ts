import { getDealRules } from "@/lib/data";
import { json } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const v = new URL(req.url).searchParams.get("venue"); const all = await getDealRules();
  const d = v ? all.filter((r) => r.venue === v) : all; return json({ data: d, count: d.length, note: "verified=false rules are not yet confirmed with the store" });
}
