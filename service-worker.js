const CACHE_NAME = 'jargon-sozluk-v1';
const urlsToCache = [
  'jargon_sozlugu.html',
  'manifest.json'
];

// Install event - cache dosyaları
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache açıldı');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate event - eski cache'leri temizle
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eski cache siliniyor:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Fetch event - cache-first stratejisi
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache'de varsa döndür
        if (response) {
          return response;
        }
        
        // Yoksa network'ten al
        return fetch(event.request).then(response => {
          // Geçerli değilse olduğu gibi döndür
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clone'la ve cache'e ekle
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // Offline durumunda fallback
        return caches.match('jargon_sozlugu.html');
      })
  );
});
