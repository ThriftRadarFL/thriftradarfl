import { promises as fs } from "fs";
import path from "path";
import { seedVenues, mockSales } from "./seed-data";
import { hasDb } from "@/db";
import * as pg from "./db-store";

export type Venue = Omit<(typeof seedVenues)[number], "hoursJson" | "phone" | "type"> & { type: string; phone: string | null; hoursJson: Record<string, string> | null };
export type SaleDay = { date: string; start: string; end: string; discountPct: number };
export type Sale = { slug: string; title: string; type: string; city: string; zip: string; lat: number; lng: number; sourceUrl: string; paymentMethods: string[]; days: SaleDay[] };

const DATA_DIR = path.join(process.cwd(), "data");
const salesFile = path.join(DATA_DIR, "sales.json");
const venuesFile = path.join(DATA_DIR, "venues.json");

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try { return JSON.parse(await fs.readFile(file, "utf8")) as T; } catch { return fallback; }
}
async function writeJson(file: string, data: unknown) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(file, JSON.stringify(data, null, 2) + "\n");
}

// MVP: JSON files under /data (seeded from seed-data.ts) until DATABASE_URL + Drizzle reads are wired.
export async function getVenues(): Promise<Venue[]> { if (hasDb) return pg.dbGetVenues(); return readJson<Venue[]>(venuesFile, seedVenues as Venue[]); }
export async function getVenue(slug: string) { return (await getVenues()).find((v) => v.slug === slug) ?? null; }
export async function getSales(): Promise<Sale[]> {
  const s = hasDb ? await pg.dbGetSales() : await readJson<Sale[]>(salesFile, mockSales as Sale[]);
  return [...s].sort((a, b) => (a.days[0]?.date ?? "").localeCompare(b.days[0]?.date ?? ""));
}
export async function getSale(slug: string) { return (await getSales()).find((s) => s.slug === slug) ?? null; }

export async function upsertSale(sale: Sale) {
  if (hasDb) return pg.dbUpsertSale(sale);
  const all = (await readJson<Sale[]>(salesFile, mockSales as Sale[])).filter((s) => s.slug !== sale.slug);
  await writeJson(salesFile, [...all, sale]);
}
export async function deleteSale(slug: string) {
  if (hasDb) return pg.dbDeleteSale(slug);
  await writeJson(salesFile, (await readJson<Sale[]>(salesFile, mockSales as Sale[])).filter((s) => s.slug !== slug));
}
export async function upsertVenue(v: Venue) {
  if (hasDb) return pg.dbUpsertVenue(v);
  const all = (await getVenues()).filter((x) => x.slug !== v.slug);
  await writeJson(venuesFile, [...all, v]);
}

export async function addDigestSubscriber(email: string, area: string) {
  if (hasDb) return pg.dbAddSubscriber(email, area);
  const file = path.join(DATA_DIR, "digest-subscribers.json");
  const list = await readJson<{ email: string; area: string; at: string }[]>(file, []);
  if (list.some((x) => x.email.toLowerCase() === email.toLowerCase())) return false;
  list.push({ email, area, at: new Date().toISOString() });
  await writeJson(file, list);
  return true;
}

export const CITIES: Record<string, string> = {
  "port-orange": "Port Orange", "daytona-beach": "Daytona Beach", deland: "DeLand", "new-smyrna-beach": "New Smyrna Beach", "ormond-beach": "Ormond Beach",
};
export const dataMode = hasDb ? "postgres" : "json";
