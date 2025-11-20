// Utility to wrap fetch with retry and timeout for network resilience
// Optimized for low connection scenarios with adaptive timeouts and better retry logic
export async function fetchWithRetry(url, options = {}, retries = 3, timeout = 15000, backoff = 1000) {
  let lastError = null;
  
  // Detect connection quality (if available)
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const isSlowConnection = connection && (
    connection.effectiveType === 'slow-2g' || 
    connection.effectiveType === '2g' ||
    connection.downlink < 1.5
  );
  
  // Adjust timeout for slow connections
  const adaptiveTimeout = isSlowConnection ? Math.max(timeout * 2, 45000) : timeout;
  
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    let timeoutId = null;
    
    // Set up timeout with adaptive value
    timeoutId = setTimeout(() => {
      controller.abort();
    }, adaptiveTimeout);
    
    try {
      // Add keepalive for better connection handling
      const fetchOptions = {
        ...options,
        signal: controller.signal,
        keepalive: true,
        // Add cache control for login requests
        cache: options.method === 'POST' ? 'no-cache' : 'default'
      };
      
      const startTime = Date.now();
      const res = await fetch(url, fetchOptions);
      const duration = Date.now() - startTime;
      
      // Clear timeout on success
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      
      // Log slow requests for debugging
      if (duration > 5000) {
        console.log(`Slow request detected: ${duration}ms for ${url}`);
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
        if (err.name === 'AbortError' || err.message.includes('timeout')) {
          const timeoutSeconds = adaptiveTimeout / 1000;
          throw new Error(`Request timed out after ${timeoutSeconds} seconds. ${isSlowConnection ? 'Slow connection detected. ' : ''}Please check your internet connection and try again.`);
        }
        throw err;
      }
      
      // Only retry on network errors, timeouts, or abort errors
      const isRetryableError = 
        err.name === 'AbortError' || 
        err.name === 'TimeoutError' ||
        err.message.includes('NetworkError') || 
        err.message.includes('Failed to fetch') ||
        err.message.includes('timeout') ||
        err.message.includes('network') ||
        err.message.includes('Network request failed');
      
      if (!isRetryableError) {
        // Don't retry for non-network errors (like 400, 401, etc.)
        throw err;
      }
      
      // Wait before retrying with exponential backoff (longer for slow connections)
      const baseWaitTime = isSlowConnection ? backoff * 2 : backoff;
      const waitTime = baseWaitTime * Math.pow(2, i); // Exponential backoff
      const maxWaitTime = 10000; // Cap at 10 seconds
      const finalWaitTime = Math.min(waitTime, maxWaitTime);
      
      console.log(`Request failed (attempt ${i + 1}/${retries}), retrying in ${finalWaitTime}ms...`, err.message);
      await new Promise(r => setTimeout(r, finalWaitTime));
    }
  }
  
  // Should never reach here, but just in case
  throw lastError || new Error('Request failed after all retries');
}
