import { INGEST_LIMITS, USER_AGENT } from "./sources";

export type FetchFn = typeof fetch;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function fetchText(url: string, fetchImpl: FetchFn = fetch, timeoutMs = INGEST_LIMITS.fetchTimeoutMs): Promise<{ ok: true; text: string; finalUrl: string } | { ok: false; status: number; error: string }> {
  let last = "fetch-failed";
  for (let attempt = 1; attempt <= INGEST_LIMITS.maxRetries; attempt++) {
    try {
      const r = await fetchImpl(url, { headers: { "User-Agent": USER_AGENT, Accept: "text/html,application/xhtml+xml" }, redirect: "follow", signal: AbortSignal.timeout(timeoutMs) });
      if (r.status === 429 || r.status >= 500) {
        last = `http-${r.status}`;
        const ra = Number(r.headers.get("retry-after"));
        await sleep(Math.min(8_000, (Number.isFinite(ra) ? ra * 1000 : 400 * 2 ** attempt) + Math.floor(Math.random() * 200)));
        continue;
      }
      if (!r.ok) return { ok: false, status: r.status, error: `http-${r.status}` };
      const finalUrl = r.url || url;
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length > INGEST_LIMITS.maxBodyBytes) return { ok: false, status: r.status, error: "body-too-large" };
      return { ok: true, text: buf.toString("utf8"), finalUrl };
    } catch (e) {
      last = (e as Error).name === "TimeoutError" ? "timeout" : "network-error";
      await sleep(200 * attempt + Math.floor(Math.random() * 150));
    }
  }
  return { ok: false, status: 0, error: last };
}
