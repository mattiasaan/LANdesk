const CACHE_NAME = 'pwa-cache-v1';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/files.html',
  '/note.html',
  '/tasks.html',
  '/style.css',
  '/index-script.js',
  '/files-script.js',
  '/note-script.js',
  '/task-script.js',
  '/manifest.json',
  '/images/icons/icon192.png',
  '/images/icons/icon512.png'
];


self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Service Worker: Caching app shell');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
});


self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Service Worker: Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Gestione richieste rete
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
