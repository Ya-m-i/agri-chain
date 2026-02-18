import { QueryClient } from '@tanstack/react-query'

// QueryClient: cache enabled for faster navigation and fewer requests
const STALE_TIME_MS = 60 * 1000       // 1 min – data fresh, no refetch
const GC_TIME_MS = 5 * 60 * 1000      // 5 min – keep unused data in cache

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      gcTime: GC_TIME_MS, // v5: was cacheTime – keep cache for 5 min after unmount
      refetchOnWindowFocus: false,
      refetchOnReconnect: true, // Refetch when back online
      retry: 1,
      retryDelay: 2000,
    },
    mutations: {
      retry: 1,
      retryDelay: 2000,
    },
  },
})