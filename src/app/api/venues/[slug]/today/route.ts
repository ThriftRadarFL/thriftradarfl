// GET /api/venues/<slug>/today → "what's on at this store today" (Eastern date): hours, today's deals, next deal.
// Public + read-only; handy for phone shortcuts / home-screen widgets.
import { getVenue, getDealRules } from "@/lib/data";
import { handle, json, HttpError } from "@/lib/api";
import { storeToday } from "@/lib/store-today";
import { todayET } from "@/lib/cities";
export const dynamic = "force-dynamic";
export const GET = handle(async (_r: Request, { params }: { params: Promise<{ slug: string }> }) => {
  const v = await getVenue((await params).slug); if (!v) throw new HttpError(404, "not found");
  const t = storeToday(v.slug, await getDealRules(), todayET(), v.hoursJson);
  return json({ data: { store: { slug: v.slug, name: v.name, city: v.city }, date: t.date, day: t.dayName, hours: t.hours,
    today: t.today.map(({ label, discountPct, time, verified }) => ({ label, discountPct: discountPct ?? null, time: time ?? null, verified })),
    next: t.next && { date: t.next.date, inDays: t.next.inDays, label: t.next.rule.label, discountPct: t.next.rule.discountPct ?? null, verified: t.next.rule.verified } } });
});
