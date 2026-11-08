const CACHE_NAME = 'geofastpe-offline-v2';
const APP_SHELL = ['/', '/index.html'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('geofastpe-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  const isMapAsset = /\.(pbf|mvt|png|jpg|jpeg|webp|woff2?)$/i.test(url.pathname) || url.hostname.includes('openfreemap') || url.hostname.includes('mapterhorn');
  const isApiGet = /\/api\/v1\/(mapa\/puntos|eventos|reportes|servicios|ventas|solidaridad|emergencias|geo\/(buscar|ruta|clima))/.test(url.pathname);
  if (!isMapAsset && !isApiGet && url.origin !== self.location.origin) return;
  if (url.origin === self.location.origin && !isApiGet && !request.mode.includes('navigate') && !/\.(js|css|svg|png|ico|woff2?)$/i.test(url.pathname)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached && (isMapAsset || isApiGet || url.origin === self.location.origin)) {
      if (isApiGet) {
        fetch(request).then(response => { if (response.ok) cache.put(request, response.clone()); }).catch(() => {});
      }
      return cached;
    }
    try {
      const response = await fetch(request);
      if (response && (response.ok || response.type === 'opaque')) cache.put(request, response.clone()).catch(() => {});
      return response;
    } catch (error) {
      if (cached) return cached;
      if (request.mode === 'navigate') return (await cache.match('/index.html')) || Response.error();
      throw error;
    }
  })());
});
