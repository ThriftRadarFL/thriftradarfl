/** Shareable saved-sales lists: /saved?list=slug1,slug2 (no account, nothing stored server-side). */
export const MAX_SHARED = 50;
const SLUG = /^[a-z0-9][a-z0-9-]{0,119}$/;
export function parseSharedList(raw: string | string[] | undefined | null): string[] {
  const s = Array.isArray(raw) ? raw.join(",") : raw ?? "";
  const out: string[] = [];
  for (const part of s.slice(0, 8000).split(/[,\s]+/)) { const x = part.trim().toLowerCase(); if (SLUG.test(x) && !out.includes(x)) out.push(x); if (out.length >= MAX_SHARED) break; }
  return out;
}
export const sharedListPath = (slugs: string[]) => `/saved?list=${slugs.slice(0, MAX_SHARED).map(encodeURIComponent).join(",")}`;
export const mergeFavs = (mine: string[], add: string[]) => [...mine, ...add.filter((x) => !mine.includes(x))];
