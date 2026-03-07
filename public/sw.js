const STATIC_CACHE = 'stoic-static-v2';
const TEXTURE_CACHE = 'stoic-textures-v2';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// Паттерны для кэширования
const CACHE_PATTERNS = {
  textures: [
    '/book-covers/',
    '/book-spines/',
  ],
  static: [
    '/_next/static/',
  ],
};

const isCacheable = (url) => {
  try {
    const parsed = new URL(url, location.origin);
    return parsed.origin === location.origin;
  } catch {
    return false;
  }
};

// Установка SW - кэширование статики
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Активация - очистка старых кэшей
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((name) => 
          name.startsWith('stoic-') && 
          name !== STATIC_CACHE && 
          name !== TEXTURE_CACHE
        ).map((name) => caches.delete(name))
      )
    ).then(() => {
      self.clients.claim();
    })
  );
});

// Стратегия кэширования
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Только GET запросы
  if (request.method !== 'GET') return;
  
  // Не кэшируем чужие ресурсы
  if (!isCacheable(request.url)) return;
  
  // Определяем тип запроса
  const isTexture = CACHE_PATTERNS.textures.some(pattern => request.url.includes(pattern));
  const isStatic = CACHE_PATTERNS.static.some(pattern => request.url.includes(pattern));
  
  if (isTexture) {
    // Для текстур: cache-first с network fallback
    event.respondWith(
      caches.open(TEXTURE_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) {
          return cached;
        }
        
        try {
          const response = await fetch(request);
          if (response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        } catch {
          // Offline - возвращаем placeholder
          return new Response('', { status: 408, statusText: 'Offline' });
        }
      })
    );
  } else if (isStatic) {
    // Для статики: cache-first
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          if (response.status === 200) {
            caches.open(STATIC_CACHE).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        });
      })
    );
  } else {
    // Для остального: network-first с cache fallback
    event.respondWith(
      fetch(request).then((response) => {
        if (response?.status === 200) {
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, response.clone()));
        }
        return response;
      }).catch(() => {
        return caches.match(request);
      })
    );
  }
});

// Сообщение для обновления кэша текстур
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_TEXTURE') {
    const { url, response } = event.data;
    
    event.waitUntil(
      caches.open(TEXTURE_CACHE).then((cache) => {
        return cache.put(url, new Response(response));
      })
    );
  }
  
  // Пропуск ожидания для обновления
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
