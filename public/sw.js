// ThriftRadarFL service worker: network-first pages with offline fallback; saved sales cached for offline use.
const VERSION = "v2"; const PAGES = `tr-pages-${VERSION}`; const SAVED = "tr-saved"; const STATIC = `tr-static-${VERSION}`;
const PRECACHE = ["/offline", "/saved", "/icons/icon-192.png", "/icons/mark-64.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(STATIC).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => ![PAGES, SAVED, STATIC].includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("message", (e) => {
  const d = e.data || {};
  if (d.type === "save") e.waitUntil(caches.open(SAVED).then((c) => Promise.all([c.add(`/sales/${d.slug}`), c.add(`/api/ics/${d.slug}`)]).catch(() => {})));
  if (d.type === "unsave") e.waitUntil(caches.open(SAVED).then((c) => Promise.all([c.delete(`/sales/${d.slug}`), c.delete(`/api/ics/${d.slug}`)])));
  if (d.type === "sync") e.waitUntil(caches.open(SAVED).then(async (c) => { for (const s of d.slugs || []) { if (!(await c.match(`/sales/${s}`))) await c.add(`/sales/${s}`).catch(() => {}); } }));
});
self.addEventListener("fetch", (e) => {
  const req = e.request; const url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin || url.pathname.startsWith("/admin") || url.pathname.startsWith("/api/cron")) return;
  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) { // immutable assets: cache-first
    e.respondWith(caches.match(req).then((hit) => hit || fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(STATIC).then((c) => c.put(req, copy)); } return res; })));
    return;
  }
  if (req.mode === "navigate") {
    e.respondWith(fetch(req).then((res) => { if (res.ok) { const copy = res.clone(); caches.open(PAGES).then((c) => c.put(req, copy)); } return res; })
      .catch(async () => (await caches.match(req, { ignoreSearch: true })) || (await caches.match("/offline"))));
  }
});
