// Utility to wrap fetch with retry and timeout for network resilience
export async function fetchWithRetry(url, options = {}, retries = 3, timeout = 15000, backoff = 1000) {
  let lastError = null;
  
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    let timeoutId = null;
    
    // Set up timeout
    timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);
    
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      
      // Clear timeout on success
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
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
      // Clear timeout on error
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      lastError = err;
      
      // If this is the last retry, throw the error
      if (i === retries - 1) {
        // Provide more helpful error message for timeout
        if (err.name === 'AbortError') {
          throw new Error(`Request timed out after ${timeout / 1000} seconds. The server may be slow. Please try again.`);
        }
        throw err;
      }
      
      // Only retry on network errors, timeouts, or abort errors
      const isRetryableError = 
        err.name === 'AbortError' || 
        err.name === 'TimeoutError' ||
        err.message.includes('NetworkError') || 
        err.message.includes('Failed to fetch') ||
        err.message.includes('timeout');
      
      if (!isRetryableError) {
        // Don't retry for non-network errors (like 400, 401, etc.)
        throw err;
      }
      
      // Wait before retrying with exponential backoff
      const waitTime = backoff * Math.pow(2, i); // Exponential backoff
      console.log(`Request failed (attempt ${i + 1}/${retries}), retrying in ${waitTime}ms...`, err.message);
      await new Promise(r => setTimeout(r, waitTime));
    }
  }
  
  // Should never reach here, but just in case
  throw lastError || new Error('Request failed after all retries');
}
