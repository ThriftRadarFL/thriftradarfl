// Manual, admin-triggered import of ONE public listing URL via its schema.org JSON-LD (Event/SaleEvent).
// Policy: no crawling, no image rehosting, always keep sourceUrl + link back. See BACKEND.md.
// Does not invent 17:00 end times or cash payment methods.
import type { Sale } from "./data";
import { isAllowedImportHost } from "./importer-hosts";
import { analyzeListing, extractJsonLd } from "./ingestion/parse";
export { isAllowedImportHost, extractJsonLd };

export function saleFromHtml(html: string, sourceUrl: string): Partial<Sale> | null {
  return analyzeListing(html, sourceUrl).sale;
}

export function saleFromHtmlDetailed(html: string, sourceUrl: string) {
  return analyzeListing(html, sourceUrl);
}

export async function importFromUrl(url: string) {
  if (!isAllowedImportHost(url)) throw new Error("host not on import allowlist");
  const r = await fetch(url, { headers: { "User-Agent": "ThriftRadarFL/0.1 (manual admin import; contact via site)" }, signal: AbortSignal.timeout(10_000) });
  if (!r.ok) throw new Error(`fetch failed: ${r.status}`);
  const parsed = analyzeListing(await r.text(), url);
  if (!parsed.sale) throw new Error("no schema.org Event found on page");
  return parsed.sale;
}
