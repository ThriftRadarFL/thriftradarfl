/** Bounded public discovery inputs. Official listing-index pages only (no undocumented APIs). */
export type DiscoverySource = {
  id: string;
  url: string;
  label: string;
  enabled: boolean;
};

// Conservative Central Florida indexes already used in Nov 7 research (server HTML, public GET).
export const DISCOVERY_SOURCES: DiscoverySource[] = [
  { id: "esn-orlando", url: "https://www.estatesales.net/FL/Orlando", label: "estatesales.net Orlando", enabled: true },
  { id: "esn-daytona-beach", url: "https://www.estatesales.net/FL/Daytona-Beach", label: "estatesales.net Daytona Beach", enabled: true },
  { id: "eso-orlando", url: "https://www.estatesales.org/estate-sales/fl/orlando", label: "estatesales.org Orlando", enabled: true },
];

export const INGEST_LIMITS = {
  maxIndexPages: 3,
  maxDetailPages: 8,
  fetchTimeoutMs: 8_000,
  pauseMs: 350,
  maxRetries: 3,
  maxBodyBytes: 1_200_000,
  leaseMs: 90_000,
};

/** Manual holds: time conflicts / timezone provenance unresolved (Nov 7 research). Never auto-publish. */
export const HOLD_EXTERNAL_IDS = new Set(["5147001", "2472421"]);

export const PARSER_VERSION = "ingest-1";
export const USER_AGENT = "ThriftRadarFL/1.0 (+https://thriftradarfl.vercel.app/contact; public listing ingest)";
