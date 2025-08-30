// A very simple service worker to make the app installable.
// This service worker doesn't do any caching for offline use yet,
// but it satisfies the PWA installation requirements.

self.addEventListener('install', (event) => {
  // This event is fired when the service worker is first installed.
  console.log('Service Worker: Installed');
});

self.addEventListener('activate', (event) => {
  // This event is fired when the service worker becomes active.
  console.log('Service Worker: Activated');
});

self.addEventListener('fetch', (event) => {
  // This event is fired every time the app makes a network request (e.g., for images, API calls, etc.).
  // We are not modifying the request, just letting it pass through.
  event.respondWith(fetch(event.request));
});