/**
 * Service Worker מינימלי — PWA התקנה
 * לא כולל offline caching (ADV-03 הוא v2)
 * רק רישום SW נדרש כדי שהדפדפן יציע התקנה
 */

// Skip waiting and claim clients immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Network-only fetch — no caching (offline is v2)
// Only handle http/https requests — skip chrome-extension, data, etc.
self.addEventListener('fetch', (event) => {
  if (event.request.url.startsWith('http')) {
    event.respondWith(fetch(event.request).catch(() => new Response('', { status: 503 })));
  }
});
