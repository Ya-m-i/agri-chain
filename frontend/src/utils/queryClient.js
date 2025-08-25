import { QueryClient } from '@tanstack/react-query'

// Create QueryClient with configuration optimized for weak WiFi and no caching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Data becomes stale immediately
      cacheTime: 0, // No caching of data
      refetchOnWindowFocus: false, // Don't refetch when window gains focus
      refetchOnReconnect: false, // Don't refetch when reconnecting to internet
      retry: 1, // Only retry failed requests once
      retryDelay: 2000, // Wait 2 seconds between retries
    },
    mutations: {
      retry: 1, // Only retry failed mutations once
      retryDelay: 2000, // Wait 2 seconds between retries
    },
  },
})