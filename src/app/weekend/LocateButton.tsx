"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
/** "Use my location" → /weekend?lat=&lng=&r= (coords rounded to ~1 km; never stored or sent anywhere else). */
export default function LocateButton({ radius }: { radius: number }) {
  const router = useRouter(); const [msg, setMsg] = useState("");
  const go = () => {
    if (!navigator.geolocation) return setMsg("Location isn't available in this browser — enter a ZIP instead.");
    setMsg("Finding you…");
    navigator.geolocation.getCurrentPosition((p) => { setMsg("");
      router.push(`/weekend?lat=${p.coords.latitude.toFixed(2)}&lng=${p.coords.longitude.toFixed(2)}&r=${radius || "any"}`); },
    () => setMsg("Couldn't get your location — enter a ZIP instead."), { timeout: 10000, maximumAge: 600000 });
  };
  return <div className="flex flex-col"><button type="button" onClick={go} className="btn-gray text-sm">📍 Use my location</button>
    <span role="status" className="text-xs text-gray-600">{msg}</span></div>;
}
