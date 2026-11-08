import { promises as fs } from "fs";
import path from "path";
import { randomBytes } from "crypto";
import { eq, desc, lt } from "drizzle-orm";
import { getDb, hasDb } from "@/db";
import * as t from "@/db/schema";

export type IngestCandidate = {
  id: string;
  source: string;
  externalId: string;
  sourceUrl: string;
  digest: string;
  status: string;
  reasons: string[];
  payload: unknown;
  fetchedAt: string;
  lastSeenAt: string;
  publishedSlug?: string | null;
  runId: string;
};

export type IngestRun = {
  id: string;
  startedAt: string;
  finishedAt?: string | null;
  status: string;
  dryRun: boolean;
  owner?: string | null;
  summary: Record<string, unknown>;
};

const DATA_DIR = () => process.env.THRIFTRADAR_DATA_DIR ?? path.join(process.cwd(), "data");
const candidatesFile = () => path.join(DATA_DIR(), "ingestion-candidates.json");
const runsFile = () => path.join(DATA_DIR(), "ingestion-runs.json");
const leaseFile = () => path.join(DATA_DIR(), "ingestion-lease.json");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try { return JSON.parse(await fs.readFile(file, "utf8")) as T; } catch { return fallback; }
}
async function writeJson(file: string, value: unknown) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(value, null, 2) + "\n");
  await fs.rename(tmp, file);
}

const dbOk = () => !!getDb();

export async function upsertCandidate(c: IngestCandidate) {
  const db = getDb();
  if (hasDb && db) {
    try {
      const vals = {
        id: c.id, source: c.source, externalId: c.externalId, sourceUrl: c.sourceUrl, digest: c.digest,
        status: c.status, reasons: c.reasons, payload: c.payload, fetchedAt: new Date(c.fetchedAt),
        lastSeenAt: new Date(c.lastSeenAt), publishedSlug: c.publishedSlug ?? null, runId: c.runId,
      };
      await db.insert(t.ingestionCandidates).values(vals).onConflictDoUpdate({ target: t.ingestionCandidates.id, set: vals });
      return;
    } catch { /* JSON fallback */ }
  }
  const all = await readJson<IngestCandidate[]>(candidatesFile(), []);
  await writeJson(candidatesFile(), [...all.filter((x) => x.id !== c.id), c]);
}

export async function getCandidate(id: string): Promise<IngestCandidate | null> {
  const db = getDb();
  if (hasDb && db) {
    try {
      const [r] = await db.select().from(t.ingestionCandidates).where(eq(t.ingestionCandidates.id, id));
      if (r) return { id: r.id, source: r.source, externalId: r.externalId, sourceUrl: r.sourceUrl, digest: r.digest, status: r.status, reasons: r.reasons ?? [], payload: r.payload, fetchedAt: r.fetchedAt.toISOString(), lastSeenAt: r.lastSeenAt.toISOString(), publishedSlug: r.publishedSlug, runId: r.runId ?? "" };
    } catch { /* JSON */ }
  }
  return (await readJson<IngestCandidate[]>(candidatesFile(), [])).find((x) => x.id === id) ?? null;
}

export async function listCandidates(limit = 50): Promise<IngestCandidate[]> {
  const db = getDb();
  if (hasDb && db) {
    try {
      const rows = await db.select().from(t.ingestionCandidates).orderBy(desc(t.ingestionCandidates.lastSeenAt));
      return rows.slice(0, limit).map((r) => ({ id: r.id, source: r.source, externalId: r.externalId, sourceUrl: r.sourceUrl, digest: r.digest, status: r.status, reasons: r.reasons ?? [], payload: r.payload, fetchedAt: r.fetchedAt.toISOString(), lastSeenAt: r.lastSeenAt.toISOString(), publishedSlug: r.publishedSlug, runId: r.runId ?? "" }));
    } catch { /* JSON */ }
  }
  return (await readJson<IngestCandidate[]>(candidatesFile(), [])).sort((a, b) => b.lastSeenAt.localeCompare(a.lastSeenAt)).slice(0, limit);
}

export async function recordRun(run: IngestRun) {
  const db = getDb();
  if (hasDb && db) {
    try {
      const vals = { id: run.id, startedAt: new Date(run.startedAt), finishedAt: run.finishedAt ? new Date(run.finishedAt) : null, status: run.status, dryRun: run.dryRun, owner: run.owner ?? null, summary: run.summary };
      await db.insert(t.ingestionRuns).values(vals).onConflictDoUpdate({ target: t.ingestionRuns.id, set: vals });
      return;
    } catch { /* JSON */ }
  }
  const all = await readJson<IngestRun[]>(runsFile(), []);
  await writeJson(runsFile(), [...all.filter((x) => x.id !== run.id), run].slice(-40));
}

export async function latestRun(): Promise<IngestRun | null> {
  const db = getDb();
  if (hasDb && db) {
    try {
      const [r] = await db.select().from(t.ingestionRuns).orderBy(desc(t.ingestionRuns.startedAt)).limit(1);
      if (r) return { id: r.id, startedAt: r.startedAt.toISOString(), finishedAt: r.finishedAt?.toISOString() ?? null, status: r.status, dryRun: r.dryRun, owner: r.owner, summary: (r.summary ?? {}) as Record<string, unknown> };
    } catch { /* JSON */ }
  }
  const all = await readJson<IngestRun[]>(runsFile(), []);
  return all.sort((a, b) => b.startedAt.localeCompare(a.startedAt))[0] ?? null;
}

export async function acquireLease(name: string, ms: number): Promise<{ owner: string; token: string } | null> {
  const owner = `${process.pid}-${Date.now()}`;
  const token = randomBytes(8).toString("hex");
  const until = new Date(Date.now() + ms);
  const db = getDb();
  if (hasDb && db) {
    try {
      const vals = { name, owner, token, until };
      const rows = await db.insert(t.ingestionLeases).values(vals)
        .onConflictDoUpdate({ target: t.ingestionLeases.name, set: { owner, token, until }, setWhere: lt(t.ingestionLeases.until, new Date()) })
        .returning({ token: t.ingestionLeases.token });
      if (!rows.length || rows[0].token !== token) return null;
      return { owner, token };
    } catch { /* JSON */ }
  }
  const all = await readJson<Record<string, { owner: string; token: string; until: string }>>(leaseFile(), {});
  const cur = all[name];
  if (cur && Date.parse(cur.until) > Date.now()) return null;
  all[name] = { owner, token, until: until.toISOString() };
  await writeJson(leaseFile(), all);
  return { owner, token };
}

export async function releaseLease(name: string, token: string) {
  const db = getDb();
  if (hasDb && db) {
    try {
      const [cur] = await db.select().from(t.ingestionLeases).where(eq(t.ingestionLeases.name, name));
      if (cur?.token === token) await db.delete(t.ingestionLeases).where(eq(t.ingestionLeases.name, name));
      return;
    } catch { /* JSON */ }
  }
  const all = await readJson<Record<string, { token?: string }>>(leaseFile(), {});
  if (all[name]?.token === token) { delete all[name]; await writeJson(leaseFile(), all); }
}

void dbOk;
