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
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
