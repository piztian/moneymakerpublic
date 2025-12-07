// ============================================
// SERVICE WORKER - Task Money Maker PWA
// Maneja caché y funcionalidad offline
// ============================================

const CACHE_NAME = 'task-money-maker-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/dashboardmoneytareas/',
  '/config/',
  '/reportes/',
  '/resumensemanal/',
  '/como%20funciona/',
  'https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;800&family=Poppins:wght@400;600;700&display=swap',
];

// Instalar Service Worker
self.addEventListener('install', event => {
  console.log('📦 Service Worker instalándose...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('✅ Caché creado');
      // No cachear todo automáticamente, solo lo esencial
      return cache.addAll(['/']);
    }).catch(err => {
      console.log('⚠️ Error al cachear:', err);
    })
  );
  self.skipWaiting();
});

// Activar Service Worker
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activado');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando caché antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch - Estrategia: Red first, fallback a caché
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar solicitudes no-GET
  if (request.method !== 'GET') {
    return;
  }

  // No cachear solicitudes a Google Apps Script (APIs)
  if (url.hostname.includes('script.google.com') || 
      url.hostname.includes('script.googleusercontent.com')) {
    event.respondWith(
      fetch(request)
        .then(response => response)
        .catch(() => {
          return new Response(
            JSON.stringify({ 
              status: 'offline',
              message: 'Sin conexión. Los cambios se guardarán cuando vuelvas online.' 
            }),
            { 
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'application/json'
              })
            }
          );
        })
    );
    return;
  }

  // Para archivos estáticos (HTML, CSS, JS, fuentes), usar caché primero
  if (request.mode === 'navigate' || 
      url.pathname.endsWith('.js') || 
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.woff2') ||
      url.pathname.endsWith('.woff')) {
    
    event.respondWith(
      caches.match(request)
        .then(response => {
          if (response) {
            return response;
          }
          return fetch(request)
            .then(response => {
              // Cachear la respuesta positiva
              if (response && response.status === 200) {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(request, responseToCache);
                });
              }
              return response;
            })
            .catch(() => {
              // Fallback para páginas offline
              if (request.mode === 'navigate') {
                return caches.match('/');
              }
              return new Response('Recurso no disponible offline', {
                status: 404,
                statusText: 'Not Found'
              });
            });
        })
    );
    return;
  }

  // Para el resto (imágenes, etc), network first
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request)
          .then(response => {
            return response || new Response('Recurso no disponible', {
              status: 404,
              statusText: 'Not Found'
            });
          });
      })
  );
});

// Manejar mensajes desde la app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('✅ Caché limpiado');
    });
  }
});

// Sincronización en segundo plano
self.addEventListener('sync', event => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(
      // Aquí iría la lógica de sincronizar tareas guardadas
      Promise.resolve()
    );
  }
});

console.log('✅ Service Worker cargado correctamente');
