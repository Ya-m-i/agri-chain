// Utility to wrap fetch with retry and timeout for network resilience
export async function fetchWithRetry(url, options = {}, retries = 3, timeout = 15000, backoff = 1000) {
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      if (!res.ok) {
        let errorMsg = 'Request failed';
        try {
          const err = await res.json();
          errorMsg = err.message || errorMsg;
        } catch {
          // response body not JSON or couldn't be parsed; ignore
        }
        throw new Error(errorMsg);
      }
      return await res.json();
    } catch (err) {
      clearTimeout(id);
      if (i === retries - 1) throw err;
      // Only retry on network errors or timeouts
      if (err.name !== 'AbortError' && !err.message.includes('NetworkError') && !err.message.includes('Failed to fetch')) throw err;
      await new Promise(r => setTimeout(r, backoff * (i + 1)));
    }
  }
}
