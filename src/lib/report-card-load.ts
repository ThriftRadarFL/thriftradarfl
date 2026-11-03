import { getVenues, getDealRules, listTagReports } from "./data";
import { todayET } from "./cities";
import { reportCards, tagCountsThisWeek } from "./report-card";
import { tagVenues } from "./color-tag-board";
/** Loads live data and builds every store's report card (color-tag counts only for stores that take tag reports). */
export async function loadReportCards() {
  const today = todayET(); const [venues, rules, tags] = await Promise.all([getVenues(), getDealRules(), listTagReports().catch(() => [])]);
  const takes = new Set(tagVenues(venues).map((v) => v.slug));
  return { today, cards: reportCards(venues, rules, today, tagCountsThisWeek(tags, today), (v) => takes.has(v.slug)) };
}
