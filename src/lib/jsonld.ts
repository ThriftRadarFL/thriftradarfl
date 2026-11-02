import type { Sale, Venue } from "./data";
import { SITE_URL, SITE_NAME } from "./site";
const ET = "-05:00"; // Central Florida (Eastern). Sale times are local wall-clock.
export function saleJsonLd(s: Sale) {
  const first = s.days[0], last = s.days.at(-1)!;
  return { "@context": "https://schema.org", "@type": "Event", name: s.title, description: s.description || `${s.title} in ${s.city}, FL`,
    eventStatus: "https://schema.org/EventScheduled", eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    startDate: `${first.date}T${first.start}:00${ET}`, endDate: `${last.date}T${last.end}:00${ET}`, url: `${SITE_URL}/sales/${s.slug}`,
    image: [`${SITE_URL}/sales/${s.slug}/opengraph-image`], isAccessibleForFree: true,
    ...(s.sourceUrl ? { sameAs: s.sourceUrl } : {}), organizer: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    location: { "@type": "Place", name: `${s.city}, FL`, address: { "@type": "PostalAddress", addressLocality: s.city, addressRegion: "FL", postalCode: s.zip, addressCountry: "US" },
      ...(s.lat && s.lng ? { geo: { "@type": "GeoCoordinates", latitude: s.lat, longitude: s.lng } } : {}) } };
}
export function venueJsonLd(v: Venue) {
  return { "@context": "https://schema.org", "@type": "Store", name: v.name, url: `${SITE_URL}/stores/${v.slug}`, ...(v.phone ? { telephone: v.phone } : {}),
    address: { "@type": "PostalAddress", streetAddress: v.address, addressLocality: v.city, addressRegion: "FL", postalCode: v.zip, addressCountry: "US" },
    ...(v.lat && v.lng ? { geo: { "@type": "GeoCoordinates", latitude: v.lat, longitude: v.lng } } : {}) };
}
export const siteJsonLd = () => ({ "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: SITE_URL,
  potentialAction: { "@type": "SearchAction", target: `${SITE_URL}/search?q={search_term_string}`, "query-input": "required name=search_term_string" } });
