// Shared seed + mock data. lat/lng are APPROXIMATE placeholders — verify via geocoding.
export const seedOrgs = [
  { key: "gwcfl", name: "Goodwill Industries of Central Florida", type: "thrift_chain" as const, website: "https://www.goodwillcfl.org/locations/" },
  { key: "berners", name: "Berner's Auction, Inc", type: "auction_house" as const, website: "https://www.estatesales.net/FL/Daytona-Beach" },
];

export const seedVenues = [
  { slug: "goodwill-port-orange", org: "gwcfl", name: "Goodwill Port Orange", type: "thrift" as const, address: "1752 Dunlawton Ave", city: "Port Orange", zip: "32129", lat: 29.1385, lng: -81.0175, phone: "(386) 898-0308", hoursJson: { daily: "9:00-21:00" }, notes: "Tag-color schedule TBD (verify with store)." },
  { slug: "goodwill-daytona-isb", org: "gwcfl", name: "Goodwill Daytona Beach (Intl Speedway)", type: "thrift" as const, address: "141 W International Speedway Blvd", city: "Daytona Beach", zip: "32114", lat: 29.2108, lng: -81.0235, phone: null, hoursJson: null, notes: "Hours unverified." },
  { slug: "goodwill-pine-hills-outlet", org: "gwcfl", name: "Goodwill Pine Hills Outlet (Bins)", type: "outlet_bins" as const, address: "2633 N Hiawassee Rd", city: "Orlando", zip: "32818", lat: 28.5785, lng: -81.4565, phone: "(407) 203-8981", hoursJson: { daily: "8:00-17:00" }, notes: "Sources disagree on open time (8 vs 9 AM). Restock times unverified." },
  { slug: "goodwill-taft-outlet", org: "gwcfl", name: "Goodwill Taft Outlet (Bins)", type: "outlet_bins" as const, address: "1030 Crews Commerce Dr", city: "Orlando", zip: "32837", lat: 28.4140, lng: -81.3935, phone: "(407) 652-6787", hoursJson: { daily: "8:00-18:00" }, notes: "Restock times unverified." },
  { slug: "berners-auction-deland", org: "berners", name: "Berner's Auction", type: "auction_house" as const, address: "1500 Jacobs Rd", city: "DeLand", zip: "32724", lat: 29.0065, lng: -81.2870, phone: null, hoursJson: { wed: "18:30-22:00" }, notes: "Weekly Wednesday auction." },
];


export const seedTags = ["furniture", "mid-century", "tools", "jewelry", "vinyl", "art", "collectibles", "clothing"];

// Mock sale for demo (example based on a public EstateSales.net listing)
import { tagsFromTitle } from "./flip-tips";
// Tags are derived only from words in each title (no invented contents).
export const mockSales = ([
  { slug: "precious-finds-port-orange-2026-11", title: "Precious Finds in Port Orange", type: "estate" as const, city: "Port Orange", zip: "32127", lat: 29.115, lng: -81.03,
    sourceUrl: "https://www.estatesales.net/FL/Port-Orange/32127/5139969", paymentMethods: ["cash", "venmo", "zelle"],
    days: [ { date: "2026-11-12", start: "09:00", end: "15:00", discountPct: 0 }, { date: "2026-11-13", start: "09:00", end: "15:00", discountPct: 20 }, { date: "2026-11-14", start: "09:00", end: "15:00", discountPct: 50 } ] },
  { slug: "riverside-estate-daytona-2026-11", title: "Riverside Drive Estate — Full House", type: "estate" as const, city: "Daytona Beach", zip: "32118", lat: 29.22, lng: -81.0, sourceUrl: "https://www.estatesales.net/FL/Daytona-Beach", paymentMethods: ["cash", "card"],
    days: [ { date: "2026-11-06", start: "08:00", end: "14:00", discountPct: 0 }, { date: "2026-11-07", start: "08:00", end: "14:00", discountPct: 25 }, { date: "2026-11-08", start: "09:00", end: "13:00", discountPct: 50 } ] },
  { slug: "berners-auction-week-deland-2026-11", title: "Berner's Auction Week — Furniture & Tools", type: "auction" as const, city: "DeLand", zip: "32724", lat: 29.0065, lng: -81.287, sourceUrl: "https://www.estatesales.net/FL/Daytona-Beach", paymentMethods: ["cash", "card"],
    days: [ { date: "2026-11-04", start: "18:30", end: "22:00", discountPct: 0 }, { date: "2026-11-11", start: "18:30", end: "22:00", discountPct: 0 } ] },
  { slug: "ormond-thrift-half-off-2026-11", title: "Ormond Beach Thrift — Half-Off Saturday", type: "thrift" as const, city: "Ormond Beach", zip: "32174", lat: 29.285, lng: -81.056, sourceUrl: "https://www.goodwillcfl.org/locations/", paymentMethods: ["cash", "card"],
    days: [ { date: "2026-11-07", start: "09:00", end: "21:00", discountPct: 50 } ] },
  { slug: "nsb-multi-family-yard-2026-11", title: "New Smyrna Multi-Family Yard Sale", type: "yard" as const, city: "New Smyrna Beach", zip: "32169", lat: 29.025, lng: -80.927, sourceUrl: "https://www.estatesales.net/FL/New-Smyrna-Beach", paymentMethods: ["cash"],
    days: [ { date: "2026-11-07", start: "07:00", end: "12:00", discountPct: 0 }, { date: "2026-11-08", start: "07:00", end: "11:00", discountPct: 30 } ] },
  { slug: "spruce-creek-estate-port-orange-2026-11", title: "Spruce Creek Fly-In Estate — Mid-Century & Art", type: "estate" as const, city: "Port Orange", zip: "32128", lat: 29.08, lng: -81.05, sourceUrl: "https://www.estatesales.net/FL/Port-Orange", paymentMethods: ["cash", "venmo"],
    days: [ { date: "2026-11-13", start: "09:00", end: "15:00", discountPct: 0 }, { date: "2026-11-14", start: "09:00", end: "15:00", discountPct: 30 }, { date: "2026-11-15", start: "10:00", end: "14:00", discountPct: 50 } ] },
  { slug: "pine-hills-bins-restock-2026-11", title: "Pine Hills Outlet — Fresh Bins Monday", type: "outlet_bins" as const, city: "Orlando", zip: "32818", lat: 28.5785, lng: -81.4565, sourceUrl: "https://www.goodwillcfl.org/locations/", paymentMethods: ["cash", "card"],
    days: [ { date: "2026-11-09", start: "08:00", end: "17:00", discountPct: 0 } ] },
  // --- Additional DEMO sales (fictional, for layout/testing) ---
  { slug: "ormond-beach-mid-century-estate-2026-11", title: "Ormond Beach Mid-Century Estate — Teak & Barware", type: "estate" as const, city: "Ormond Beach", zip: "32176", lat: 29.30, lng: -81.06, sourceUrl: "https://www.estatesales.net/FL/Ormond-Beach", paymentMethods: ["cash", "card"],
    days: [ { date: "2026-11-19", start: "09:00", end: "15:00", discountPct: 0 }, { date: "2026-11-20", start: "09:00", end: "15:00", discountPct: 25 }, { date: "2026-11-21", start: "09:00", end: "13:00", discountPct: 50 } ] },
  { slug: "nsb-coastal-cottage-estate-2026-11", title: "New Smyrna Coastal Cottage Estate — Nautical & Art", type: "estate" as const, city: "New Smyrna Beach", zip: "32168", lat: 29.03, lng: -80.93, sourceUrl: "https://www.estatesales.net/FL/New-Smyrna-Beach", paymentMethods: ["cash", "venmo"],
    days: [ { date: "2026-11-20", start: "08:00", end: "14:00", discountPct: 0 }, { date: "2026-11-21", start: "08:00", end: "14:00", discountPct: 30 } ] },
  { slug: "deland-downtown-moving-sale-2026-11", title: "DeLand Historic District Moving Sale — Antiques & Books", type: "yard" as const, city: "DeLand", zip: "32720", lat: 29.03, lng: -81.30, sourceUrl: "https://www.estatesales.net/FL/DeLand", paymentMethods: ["cash"],
    days: [ { date: "2026-11-14", start: "07:30", end: "13:00", discountPct: 0 } ] },
  { slug: "daytona-beachside-condo-estate-2026-11", title: "Daytona Beachside Condo Estate — Furniture & Jewelry", type: "estate" as const, city: "Daytona Beach", zip: "32118", lat: 29.21, lng: -81.01, sourceUrl: "https://www.estatesales.net/FL/Daytona-Beach", paymentMethods: ["cash", "card", "zelle"],
    days: [ { date: "2026-11-20", start: "09:00", end: "15:00", discountPct: 0 }, { date: "2026-11-21", start: "09:00", end: "15:00", discountPct: 50 } ] },
  { slug: "port-orange-garage-tools-2026-11", title: "Port Orange Garage Sale — Tools & Fishing Gear", type: "yard" as const, city: "Port Orange", zip: "32127", lat: 29.12, lng: -80.99, sourceUrl: "https://www.estatesales.net/FL/Port-Orange", paymentMethods: ["cash"],
    days: [ { date: "2026-11-21", start: "07:00", end: "12:00", discountPct: 0 } ] },
  { slug: "berners-auction-thanksgiving-week-deland-2026-11", title: "Berner's Auction — Pre-Holiday Collectibles Night", type: "auction" as const, city: "DeLand", zip: "32724", lat: 29.0065, lng: -81.287, sourceUrl: "https://www.estatesales.net/FL/Daytona-Beach", paymentMethods: ["cash", "card"],
    days: [ { date: "2026-11-18", start: "18:30", end: "22:00", discountPct: 0 }, { date: "2026-11-25", start: "18:30", end: "22:00", discountPct: 0 } ] },
]).map((s) => ({ ...s, tags: tagsFromTitle(s.title) as string[] }));
