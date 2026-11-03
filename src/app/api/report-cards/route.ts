import { loadReportCards } from "@/lib/report-card-load";
import { gradeCounts } from "@/lib/report-card";
import { cachedJson } from "@/lib/api";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams; const venue = sp.get("venue"); const grade = sp.get("grade")?.toUpperCase();
  const { today, cards } = await loadReportCards(); const data = cards.filter((c) => (!venue || c.slug === venue) && (!grade || c.grade === grade));
  if (venue && !data.length && !cards.some((c) => c.slug === venue)) return Response.json({ error: "unknown store" }, { status: 404 });
  return cachedJson(req, { date: today, note: "Grades how complete and fresh ThriftRadarFL's info is (hours, deal days, map pin, phone, source date) — not the store's quality. Color-tag counts are crowdsourced and not graded.", grades: gradeCounts(cards), data, count: data.length }, "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
}
