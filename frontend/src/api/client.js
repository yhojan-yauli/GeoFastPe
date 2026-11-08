export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const TOKEN_KEY = 'geofastpe_token';
const CACHE_PREFIX = 'geofastpe_api_cache:';
const QUEUE_KEY = 'geofastpe_offline_queue';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY)
};

const hashIdentity = () => { const token = tokenStorage.get() || 'public'; let h = 5381; for (let i = 0; i < token.length; i++) h = ((h * 33) ^ token.charCodeAt(i)) >>> 0; return h.toString(36); };
const cacheKey = (url) => CACHE_PREFIX + hashIdentity() + ':' + url;
const NO_CACHE_ENDPOINTS = ['/conversaciones', '/conversaciones/publicas', '/users'];
const shouldCache = (endpoint, method) => method === 'GET' && !NO_CACHE_ENDPOINTS.some((path) => endpoint === path || endpoint.startsWith(path + '/'));
const readCache = (url) => { try { const raw = localStorage.getItem(cacheKey(url)); return raw ? JSON.parse(raw) : null; } catch { return null; } };
const writeCache = (url, data) => { try { localStorage.setItem(cacheKey(url), JSON.stringify({ savedAt: Date.now(), data })); } catch {} };

export class ApiError extends Error {
  constructor(message, status, code) { super(message); this.name = 'ApiError'; this.status = status; this.code = code; }
}

const queueMutation = (entry) => {
  try {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    queue.push({ ...entry, authKey: hashIdentity(), queuedAt: Date.now() });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {}
};

export async function flushOfflineQueue() {
  if (!navigator.onLine) return;
  let queue;
  try { queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { queue = []; }
  if (!queue.length) return;
  const remaining = [];
  for (const item of queue) {
    if (item.authKey && item.authKey !== hashIdentity()) { remaining.push(item); continue; }
    try {
      await apiRequest(item.endpoint, { method: item.method, body: item.body, _skipQueue: true });
    } catch { remaining.push(item); }
  }
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining)); } catch {}
}

export async function apiRequest(endpoint, { method = 'GET', body, query, formData, _skipQueue = false } = {}) {
  const params = new URLSearchParams();
  Object.entries(query || {}).forEach(([key, value]) => { if (value !== undefined && value !== null && value !== '') params.set(key, String(value)); });
  const queryString = params.toString();
  const url = `${API_BASE}${endpoint}${queryString ? `?${queryString}` : ''}`;
  const headers = { Accept: 'application/json' };
  const token = tokenStorage.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (formData) payload = formData;
  else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }

  if (!navigator.onLine) {
    if (method === 'GET') { const cached = readCache(url); if (cached) return cached.data; }
    if (!_skipQueue && !formData && method !== 'GET' && !endpoint.startsWith('/auth/')) { queueMutation({ endpoint, method, body }); return { ...body, id: `offline-${Date.now()}`, offline: true, queued: true }; }
    throw new ApiError('Sin conexión. Se usará la información guardada cuando esté disponible.', 0, 'OFFLINE');
  }

  try {
    const response = await fetch(url, { method, headers, body: payload });
    if (!response.ok) {
      let data = null; try { data = await response.json(); } catch {}
      throw new ApiError(data?.message || `Error HTTP ${response.status}`, response.status, data?.code);
    }
    if (response.status === 204) return null;
    const data = await response.json();
    if (shouldCache(endpoint, method)) writeCache(url, data);
    return data;
  } catch (error) {
    if (error instanceof ApiError && error.status !== 0) throw error;
    if (method === 'GET') { const cached = readCache(url); if (cached) return cached.data; }
    if (!_skipQueue && !formData && method !== 'GET' && !endpoint.startsWith('/auth/')) { queueMutation({ endpoint, method, body }); return { ...body, id: `offline-${Date.now()}`, offline: true, queued: true }; }
    throw new ApiError('No se pudo conectar con el servidor. Verifica que el backend este en ejecucion.', 0, 'NETWORK');
  }
}

window.addEventListener('online', () => flushOfflineQueue());
