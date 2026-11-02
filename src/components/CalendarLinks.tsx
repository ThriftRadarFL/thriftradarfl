import { webcalUrl, googleCalUrl } from "@/lib/ics";
/** Subscribe (webcal), Google Calendar and one-off .ics download links for a calendar feed path. */
export default function CalendarLinks({ path, label = "deal days" }: { path: string; label?: string }) {
  const dl = path + (path.includes("?") ? "&" : "?") + "download=1";
  return <div className="flex flex-wrap gap-2 text-sm">
    <a className="btn-red" href={webcalUrl(path)}>📅 Subscribe to {label}</a>
    <a className="btn-gray" href={googleCalUrl(path)} target="_blank" rel="noopener noreferrer">Google Calendar ↗</a>
    <a className="btn-gray" href={dl} download>Download .ics</a></div>;
}
