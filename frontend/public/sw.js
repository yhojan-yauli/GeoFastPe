const STATIC_CACHE = 'geofastpe-static-v4';
const RUNTIME_CACHE = 'geofastpe-runtime-v4';
const APP_SHELL = ['/', '/index.html'];
const MAP_HOSTS = ['openfreemap', 'mapterhorn', 'arcgisonline', 'routing.openstreetmap'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(c => c.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => ![STATIC_CACHE, RUNTIME_CACHE].includes(k)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // La API nunca se cachea: evita servir datos de otra sesión o desactualizados.
  if (url.pathname.startsWith('/api/')) return;

  const cacheable = url.hostname === location.hostname
    || MAP_HOSTS.some(host => url.hostname.includes(host));
  if (!cacheable) return;

  // Navegación: red primero, caché solo como respaldo sin conexión.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(cached => cached || caches.match('/index.html')))
    );
    return;
  }

  // Recursos estáticos: caché primero.
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        if (res && (res.ok || res.type === 'opaque')) {
          const copy = res.clone();
          caches.open(RUNTIME_CACHE).then(c => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
