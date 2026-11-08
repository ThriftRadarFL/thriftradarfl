import type { Sale, Venue } from "../data";

const DAYTONA: Venue = {
  slug: "city-thrift-daytona-beach",
  org: "city-thrift",
  name: "City Thrift - Daytona Beach",
  type: "thrift",
  address: "808 N Nova Road",
  city: "Daytona Beach",
  zip: "32117",
  lat: 29.22099,
  lng: -81.050323,
  phone: "(386) 257-2611",
  hoursJson: { "mon-sat": "9:00-21:00", sun: "11:00-18:00" },
  notes: "Official BuyThrift/City Thrift store locator record 125 (fetched 2026-11-06 11:59 PM EST, HTTP 200): 808 N Nova Road, Daytona Beach FL 32117; Mon–Sat 9am–9pm / Sun 11am–6pm; phone (386) 257-2611. Pin is the official locator point 29.22099,-81.050323 (NOT a surveyed rooftop; ArcGIS PointAddress for the same address is ~201m away and was not used). Source: https://buythrift.com/stores/",
  sourceUrl: "https://buythrift.com/stores/",
};

const SVDP_NOTE = "Official parish page https://smdmcc.org/st-vincent-de-paul names Nearly New Thrift Store at 400 S Daytona Avenue, Flagler Beach, phone 386-439-0071 (checked 2026-11-07). Hours still secondary (Mon/Wed/Fri/Sat 10am–3pm); Thursday not added. Pins kept. Confirm hours before visiting.";

export type PatchResult = { id: string; action: string; detail: string };

export async function applyReadyDataPatches(deps: {
  getVenue: (slug: string) => Promise<Venue | null>;
  getSaleAdmin: (slug: string) => Promise<Sale | null>;
  upsertVenue: (v: Venue) => Promise<unknown>;
  upsertSale: (s: Sale) => Promise<unknown>;
}): Promise<PatchResult[]> {
  const out: PatchResult[] = [];

  const golden = await deps.getVenue("salvation-army-orlando-thrift-store-2");
  if (golden) {
    if (Math.abs(golden.lat - 28.489625) < 1e-5 && Math.abs(golden.lng - -81.283752) < 1e-5) out.push({ id: "goldenrod-pin", action: "unchanged", detail: "already address-point" });
    else {
      await deps.upsertVenue({ ...golden, lat: 28.489625, lng: -81.283752, notes: `${golden.notes} Pin corrected 2026-11-07 to ArcGIS PointAddress 28.489625,-81.283752 (address-point, NOT rooftop).`.trim() });
      out.push({ id: "goldenrod-pin", action: "updated", detail: "28.489625,-81.283752" });
    }
  } else out.push({ id: "goldenrod-pin", action: "skipped", detail: "venue missing" });

  const existing = await deps.getVenue(DAYTONA.slug);
  if (existing && Math.abs(existing.lat - DAYTONA.lat) < 1e-5 && Math.abs(existing.lng - DAYTONA.lng) < 1e-5) out.push({ id: "city-thrift-daytona", action: "unchanged", detail: "locator pin present" });
  else {
    await deps.upsertVenue(existing ? { ...existing, ...DAYTONA, notes: DAYTONA.notes } : DAYTONA);
    out.push({ id: "city-thrift-daytona", action: existing ? "updated" : "inserted", detail: "locator id 125" });
  }

  const pins: Array<{ slug: string; lat: number; lng: number; descAdd: string }> = [
    { slug: "sherrington-estate-sale-5136183", lat: 29.324826327769, lng: -81.108846711511, descAdd: "Address: 14 Sherrington Dr, Ormond Beach, FL 32174. Pin is ArcGIS PointAddress (not ZIP centroid)." },
    { slug: "huge-estate-sale-disney-art-hallmark-lionel-trains-waterford-5130090", lat: 29.335467070032, lng: -81.115407730041, descAdd: "Address: 10 Needles Ln, Ormond Beach, FL 32174. Pin is ArcGIS PointAddress (not ZIP centroid)." },
  ];
  for (const p of pins) {
    const s = await deps.getSaleAdmin(p.slug);
    if (!s) { out.push({ id: p.slug, action: "skipped", detail: "sale missing" }); continue; }
    if (Math.abs(s.lat - p.lat) < 1e-5 && Math.abs(s.lng - p.lng) < 1e-5) out.push({ id: p.slug, action: "unchanged", detail: "address pin present" });
    else {
      const description = s.description && !s.description.includes("PointAddress") ? `${s.description} ${p.descAdd}` : (s.description || p.descAdd);
      await deps.upsertSale({ ...s, lat: p.lat, lng: p.lng, description });
      out.push({ id: p.slug, action: "updated", detail: `${p.lat},${p.lng}` });
    }
  }

  const svdp = await deps.getVenue("st-vincent-de-paul-nearly-new-flagler-beach");
  if (svdp) {
    if (svdp.notes.includes("smdmcc.org/st-vincent-de-paul")) out.push({ id: "svdp-flagler-provenance", action: "unchanged", detail: "parish note present" });
    else {
      await deps.upsertVenue({ ...svdp, notes: SVDP_NOTE, sourceUrl: "https://smdmcc.org/st-vincent-de-paul", phone: svdp.phone || "(386) 439-0071" });
      out.push({ id: "svdp-flagler-provenance", action: "updated", detail: "official parish page" });
    }
  } else out.push({ id: "svdp-flagler-provenance", action: "skipped", detail: "venue missing" });

  return out;
}

export const cityThriftDaytona = DAYTONA;
