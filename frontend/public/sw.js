const STATIC_CACHE = 'geofastpe-static-v3';
const RUNTIME_CACHE = 'geofastpe-runtime-v3';
const APP_SHELL = ['/', '/index.html'];
self.addEventListener('install', event => { event.waitUntil(caches.open(STATIC_CACHE).then(c => c.addAll(APP_SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => ![STATIC_CACHE, RUNTIME_CACHE].includes(k)).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const privateApi = url.pathname.includes('/api/v1/auth') || url.pathname.includes('/api/v1/conversaciones') || url.pathname.includes('/api/v1/users');
  const cacheable = !privateApi && (req.mode === 'navigate' || url.hostname.includes('openfreemap') || url.hostname.includes('mapterhorn') || url.hostname.includes('arcgisonline') || url.hostname.includes('routing.openstreetmap') || url.hostname === location.hostname);
  if (!cacheable) return;
  event.respondWith(caches.match(req).then(cached => {
    const network = fetch(req).then(res => { if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(RUNTIME_CACHE).then(c => c.put(req, copy)); } return res; }).catch(() => cached || caches.match('/index.html'));
    return cached || network;
  }));
});
