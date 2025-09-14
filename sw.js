/**
 * LiveLong - Service Worker
 * Implements a cache-first strategy for offline access.
 */

const CACHE_NAME = 'livelong-v1';

// Assets to be cached on installation.
const CORE_ASSETS = [
  '/', // Caches index.html at the root
  'index.html',
  'src/styles.css',
  'src/main.js',
  'src/data/routine.json',
];

const OPTIONAL_ASSETS = [
  'src/assets/audio/calm-loop.mp3', // For offline music playback
];

self.addEventListener('install', (event) => {
  console.log('Service Worker: Install event in progress.');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching app shell and content.');
      cache.addAll(CORE_ASSETS);

      // Try to cache optional assets, but don't fail installation if they are missing.
      return Promise.all(
        OPTIONAL_ASSETS.map(url => cache.add(url).catch(err => console.warn(`SW: Optional asset ${url} failed to cache.`, err)))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // If we have a match in the cache, return it. Otherwise, fetch from the network.
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => Promise.all(cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))))
  );
});