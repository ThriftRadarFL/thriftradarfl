// Seed data/sales.json + data/venues.json from seed-data.ts: `npx tsx scripts/export-json.ts`
import { writeFileSync, mkdirSync } from "fs";
import { seedVenues, mockSales } from "../src/lib/seed-data";
mkdirSync("data", { recursive: true });
writeFileSync("data/sales.json", JSON.stringify(mockSales, null, 2) + "\n");
writeFileSync("data/venues.json", JSON.stringify(seedVenues, null, 2) + "\n");
