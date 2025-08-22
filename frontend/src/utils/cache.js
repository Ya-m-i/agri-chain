// Simple cache utility for API responses (memory + localStorage fallback)
const memoryCache = {};

function getCacheKey(url, options) {
  // Only cache GET requests
  if (options && options.method && options.method !== 'GET') return null;
  return url;
}

export function getCachedData(url, options = {}) {
  const key = getCacheKey(url, options);
  if (!key) return null;
  if (memoryCache[key]) return memoryCache[key];
  try {
    const cached = localStorage.getItem('cache_' + key);
    if (cached) {
      const { data, expiry } = JSON.parse(cached);
      if (!expiry || expiry > Date.now()) {
        memoryCache[key] = data;
        return data;
      } else {
        localStorage.removeItem('cache_' + key);
      }
    }
  } catch {
    // ignore JSON parse/localStorage errors
  }
  return null;
}

export function setCachedData(url, options = {}, data, ttl = 60000) {
  const key = getCacheKey(url, options);
  if (!key) return;
  memoryCache[key] = data;
  try {
    localStorage.setItem('cache_' + key, JSON.stringify({ data, expiry: Date.now() + ttl }));
  } catch {
    // ignore localStorage errors
  }
}

export function clearCache(url, options = {}) {
  const key = getCacheKey(url, options);
  if (!key) return;
  delete memoryCache[key];
  try {
    localStorage.removeItem('cache_' + key);
  } catch {
    // ignore localStorage errors
  }
}
