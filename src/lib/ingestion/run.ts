import { isAllowedImportHost } from "../importer-hosts";
import { getSaleAdmin, getAllSales, upsertSale, getVenue, upsertVenue } from "../data";
import type { Sale } from "../data";
import { DISCOVERY_SOURCES, INGEST_LIMITS } from "./sources";
import { analyzeListing, canonicalUrl, extractListingUrls, listingIdFromUrl } from "./parse";
import { fetchText, type FetchFn } from "./fetch";
import { acquireLease, getCandidate, latestRun, listCandidates, recordRun, releaseLease, upsertCandidate } from "./store";
import { applyReadyDataPatches, type PatchResult } from "./patches";

export type IngestOptions = {
  dryRun?: boolean;
  publish?: boolean;
  applyPatches?: boolean;
  fetchImpl?: FetchFn;
  now?: Date;
  extraUrls?: string[];
  owner?: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
function safeErr(e: unknown) {
  return String((e as Error).message ?? e).replace(/\b[a-z]+:\/\/\S+/gi, "<url>").replace(/(password|token|key|secret)\S*/gi, "<redacted>").slice(0, 160);
}

function envFlag(name: string, fallback: boolean) {
  const v = process.env[name];
  if (v == null || v === "") return fallback;
  return v === "1" || v.toLowerCase() === "true";
}

export function ingestFlags() {
  return {
    enabled: envFlag("INGEST_ENABLED", true) && process.env.INGEST_ENABLED !== "0",
    dryRun: envFlag("INGEST_DRY_RUN", true) && process.env.INGEST_PUBLISH !== "1",
    publish: envFlag("INGEST_PUBLISH", false),
    applyPatches: envFlag("INGEST_APPLY_PATCHES", false),
  };
}

async function findExisting(url: string, externalId: string | null): Promise<Sale | null> {
  const canon = (() => { try { return canonicalUrl(url); } catch { return url; } })();
  const byUrl = await getSaleAdmin(canon).catch(() => null);
  if (byUrl) return byUrl;
  const all = await getAllSales().catch(() => [] as Sale[]);
  // getSales is public/active-only; also try slug suffix via admin if we can derive it.
  const hit = all.find((s) => {
    try { return canonicalUrl(s.sourceUrl) === canon; } catch { return s.sourceUrl === url; }
  });
  if (hit) return await getSaleAdmin(hit.slug);
  if (externalId) {
    const guess = all.find((s) => s.slug.endsWith(`-${externalId}`) || s.sourceUrl.includes(externalId));
    if (guess) return await getSaleAdmin(guess.slug);
  }
  return null;
}

export async function runIngestion(opts: IngestOptions = {}) {
  const flags = ingestFlags();
  const dryRun = opts.dryRun ?? flags.dryRun;
  const publish = opts.publish ?? flags.publish;
  const applyPatches = opts.applyPatches ?? flags.applyPatches;
  const fetchImpl = opts.fetchImpl ?? fetch;
  const startedAt = (opts.now ?? new Date()).toISOString();
  const runId = `ing-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  const owner = opts.owner ?? `run-${runId}`;

  if (!flags.enabled && opts.dryRun === undefined) {
    return { disabled: true, runId, dryRun: true, summary: { reason: "INGEST_ENABLED=0" } };
  }

  const lease = await acquireLease("ingest", INGEST_LIMITS.leaseMs);
  if (!lease) return { disabled: false, runId, dryRun, skipped: "lease-held", summary: { reason: "another ingest run holds the lease" } };

  const counts = { indexes: 0, discovered: 0, fetched: 0, quarantined: 0, unchanged: 0, published: 0, errors: 0, retries: 0 };
  const exceptions: string[] = [];
  let patches: PatchResult[] = [];

  try {
    const urls: string[] = [...(opts.extraUrls ?? [])].filter((u) => isAllowedImportHost(u));
    const sources = DISCOVERY_SOURCES.filter((s) => s.enabled).slice(0, INGEST_LIMITS.maxIndexPages);
    for (const src of sources) {
      const page = await fetchText(src.url, fetchImpl);
      counts.indexes++;
      await sleep(INGEST_LIMITS.pauseMs);
      if (!page.ok) { counts.errors++; exceptions.push(`${src.id}: ${page.error}`); continue; }
      try {
        const dest = new URL(page.finalUrl).hostname;
        const orig = new URL(src.url).hostname;
        if (dest !== orig && !dest.endsWith(orig.replace(/^www\./, "")) && !isAllowedImportHost(page.finalUrl)) {
          exceptions.push(`${src.id}: redirect-off-allowlist`); continue;
        }
      } catch { exceptions.push(`${src.id}: bad-final-url`); continue; }
      urls.push(...extractListingUrls(page.text, page.finalUrl));
    }

    const unique = [...new Set(urls.map((u) => { try { return canonicalUrl(u); } catch { return u; } }))];
    counts.discovered = unique.length;
    const details = unique.slice(0, INGEST_LIMITS.maxDetailPages);

    for (const url of details) {
      const page = await fetchText(url, fetchImpl);
      await sleep(INGEST_LIMITS.pauseMs);
      if (!page.ok) { counts.errors++; exceptions.push(`${url}: ${page.error}`); continue; }
      counts.fetched++;
      let parsed;
      try { parsed = analyzeListing(page.text, page.finalUrl || url); }
      catch { counts.errors++; exceptions.push(`${url}: parse-exception`); continue; }

      const externalId = parsed.externalId ?? listingIdFromUrl(url) ?? canonicalUrl(url);
      const id = `${parsed.source}:${externalId}`;
      const prev = await getCandidate(id);
      const nowIso = new Date().toISOString();
      let status = parsed.publishable ? "ready" : "quarantined";
      const reasons = parsed.issues.length ? parsed.issues : (parsed.publishable ? [] : ["not-publishable"]);

      if (prev && prev.digest === parsed.digest) {
        status = prev.status === "published" ? "published" : (parsed.publishable ? "unchanged" : prev.status);
        counts.unchanged++;
      } else if (!parsed.publishable) counts.quarantined++;
      else counts.quarantined += 0;

      const existing = parsed.sale?.sourceUrl ? await findExisting(parsed.canonicalUrl, parsed.externalId) : null;
      if (existing && parsed.digest !== prev?.digest) {
        reasons.push("existing-record-needs-review");
        status = "quarantined";
        if (!parsed.issues.includes("existing-record-needs-review")) counts.quarantined++;
      }

      let publishedSlug: string | null | undefined = prev?.publishedSlug;
      if (!dryRun && publish && parsed.publishable && parsed.sale && !existing && status !== "quarantined") {
        const sale = { ...parsed.sale, published: true, paymentMethods: parsed.sale.paymentMethods ?? [] } as Sale;
        await upsertSale(sale);
        status = "published";
        publishedSlug = sale.slug;
        counts.published++;
      } else if (parsed.publishable && !existing && status === "ready") {
        /* ready but not published this run */
      } else if (status !== "unchanged" && status !== "published") {
        status = "quarantined";
      }

      if (!dryRun || true) {
        await upsertCandidate({
          id, source: parsed.source, externalId, sourceUrl: parsed.canonicalUrl, digest: parsed.digest,
          status, reasons: [...new Set(reasons)], payload: { sale: parsed.sale, issues: parsed.issues, parserVersion: parsed.parserVersion, publishable: parsed.publishable },
          fetchedAt: nowIso, lastSeenAt: nowIso, publishedSlug, runId,
        });
      }
    }

    // Curated pin/venue patches are independent of listing publish. dryRun only suppresses auto-publishing discovered sales.
    if (applyPatches) {
      patches = await applyReadyDataPatches({ getVenue, getSaleAdmin, upsertVenue, upsertSale });
    }

    const summary = { ...counts, discoveredUrls: unique.length, exceptions: [...new Set(exceptions)].slice(0, 20), patches, publish, dryRun };
    const run = { id: runId, startedAt, finishedAt: new Date().toISOString(), status: counts.errors && !counts.fetched ? "error" : "ok", dryRun, owner, summary };
    await recordRun(run);
    return { disabled: false, runId, dryRun, publish, summary };
  } catch (e) {
    const summary = { ...counts, exceptions: [...exceptions, "run-failed"], error: "run-failed", patches };
    await recordRun({ id: runId, startedAt, finishedAt: new Date().toISOString(), status: "error", dryRun, owner, summary });
    return { disabled: false, runId, dryRun, publish, summary, error: safeErr(e) };
  } finally {
    await releaseLease("ingest", lease.token);
  }
}

export async function ingestHealth() {
  const last = await latestRun();
  const cands = await listCandidates(20);
  const flags = ingestFlags();
  return {
    enabled: flags.enabled, dryRun: flags.dryRun, publish: flags.publish,
    lastRunAt: last?.startedAt ?? null, lastStatus: last?.status ?? null, lastSummary: last?.summary ?? null,
    recentCandidates: cands.length,
    quarantined: cands.filter((c) => c.status === "quarantined").length,
  };
}
