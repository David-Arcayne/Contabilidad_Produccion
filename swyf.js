// sw.js
const CACHE_NAME = 'yofinanciero-v12'; // Actualiza la versión de la caché

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return Promise.all([
        cache.add('/'),
        cache.add('/index.html'),
        cache.add('/assets/css/styles.css'),
        cache.add('/assets/css/cards.css'),
        cache.add('/main.js'),
        cache.add('/assets/img/icon.png')
      ]).then(function() {
        console.log('Recursos almacenados en caché correctamente');
      }).catch(function(error) {
        console.error('Error al almacenar en caché:', error);
      });
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          // Filtrar cachés antiguas que tengan el prefijo yofinanciero- pero no la versión actual
          return cacheName.startsWith('yofinanciero-') && cacheName !== CACHE_NAME;
        }).map(function(cacheName) {
          return caches.delete(cacheName); // Eliminar las cachés antiguas
        })
      );
    })
  );
});

self.addEventListener('fetch', function(event) {
  const dominioPermitido = 'yofinanciero.com'; 
  
  // Obtener la URL de la solicitud
  const url = new URL(event.request.url);
  
  // Verificar si la solicitud proviene del dominio correcto
  if (url.hostname !== dominioPermitido) {
    // Si la solicitud no proviene del dominio correcto, responder con un error
    event.respondWith(
      new Response('Acceso denegado. Esta PWA solo puede acceder al dominio ' + dominioPermitido, {
        status: 403,
        statusText: 'Forbidden'
      })
    );
    return;
  }
  
  // Si la solicitud proviene del dominio correcto, continuar con la solicitud normalmente
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
