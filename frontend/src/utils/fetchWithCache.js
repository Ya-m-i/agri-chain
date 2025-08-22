import { fetchWithRetry } from './fetchWithRetry';
import { getCachedData, setCachedData } from './cache';

// Fetch with cache-first, then background refresh (stale-while-revalidate)
export async function fetchWithCache(url, options = {}, cacheTtl = 60000, retries = 3, timeout = 15000) {
  const cached = getCachedData(url, options);
  if (cached) {
    // Start background refresh
    fetchWithRetry(url, options, retries, timeout)
      .then(data => setCachedData(url, options, data, cacheTtl))
      .catch(() => {});
    return cached;
  }
  // No cache, fetch and cache
  const data = await fetchWithRetry(url, options, retries, timeout);
  setCachedData(url, options, data, cacheTtl);
  return data;
}
