import { getPrices, recency, filterByWindow } from "@/lib/prices";
import { todayET } from "@/lib/cities";
import { handle, cachedJson } from "@/lib/api";
export const dynamic = "force-dynamic";
export const GET = handle(async (req: Request) => {
  const u = new URL(req.url); const win = u.searchParams.get("window") ?? "all"; const today = todayET();
  const data = filterByWindow(getPrices(), today, win).map(({ history: _h, ...i }) => ({ ...i, recency: recency(i, today) }));
  return cachedJson(req, { window: win, today, note: "Medians are as sourced (eBay sold search pages); the window filter only uses each item's sold date range — prices are never recomputed or estimated.", data, count: data.length });
});
