import { seedVenues, mockSales } from "./seed-data";
import { hasDb } from "@/db";
// MVP: return mock data until DATABASE_URL is configured; swap to Drizzle queries on Day 2.
export async function getVenues() { return seedVenues; }
export async function getVenue(slug: string) { return seedVenues.find((v) => v.slug === slug) ?? null; }
export async function getSales() { return mockSales; }
export async function getSale(slug: string) { return mockSales.find((s) => s.slug === slug) ?? null; }
export const dataMode = hasDb ? "db-configured (still using mock reads)" : "mock";
