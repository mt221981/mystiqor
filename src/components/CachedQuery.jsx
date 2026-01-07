import { useQuery, useQueries } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

/**
 * OPTIMIZED CACHING LAYER - ENHANCED STABILITY
 * מערכת caching מתקדמת עם error handling חזק
 */

// Cache times optimization
export const CACHE_TIMES = {
  SHORT: 2 * 60 * 1000,      // 2 דקות - נתונים דינמיים
  MEDIUM: 5 * 60 * 1000,     // 5 דקות - נתונים סטנדרטיים
  LONG: 15 * 60 * 1000,      // 15 דקות - נתונים יציבים
  VERY_LONG: 60 * 60 * 1000  // שעה - נתונים כמעט סטטיים
};

/**
 * Hook אופטימלי לשליפת נתוני משתמש עם caching חכם ו-error handling
 */
export function useCachedQuery(queryKey, queryFn, options = {}) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error) {
        console.error(`Query ${queryKey.join('/')} failed:`, error);
        // Return null instead of throwing for non-critical data
        if (options.fallbackValue !== undefined) {
          return options.fallbackValue;
        }
        throw error;
      }
    },
    staleTime: options.staleTime || CACHE_TIMES.LONG,
    gcTime: options.gcTime || 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes('Unauthorized') || error?.message?.includes('401')) {
        return false;
      }
      // Retry up to 2 times for other errors
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    ...options
  });
}

/**
 * Hook לנתוני משתמש ספציפיים עם invalidation אוטומטי
 */
export function useUserDataQuery(queryKey, queryFn, options = {}) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error) {
        console.error(`User data query ${queryKey.join('/')} failed:`, error);
        if (options.fallbackValue !== undefined) {
          return options.fallbackValue;
        }
        throw error;
      }
    },
    staleTime: options.staleTime || CACHE_TIMES.MEDIUM,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
    ...options
  });
}

/**
 * Hook לנתונים סטטיים (TarotCard, Rulebook וכו')
 */
export function useStaticDataQuery(queryKey, queryFn, options = {}) {
  return useQuery({
    queryKey,
    queryFn: async () => {
      try {
        return await queryFn();
      } catch (error) {
        console.error(`Static data query ${queryKey.join('/')} failed:`, error);
        // For static data, we can be more aggressive with fallbacks
        if (options.fallbackValue !== undefined) {
          return options.fallbackValue;
        }
        throw error;
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 3,
    retryDelay: 1000,
    ...options
  });
}

/**
 * Prefetch נתונים קריטיים מראש עם error handling
 */
export async function prefetchCriticalData(queryClient) {
  const criticalQueries = [
    {
      queryKey: ['currentUser'],
      queryFn: async () => {
        try {
          return await base44.auth.me();
        } catch (error) {
          console.log('User not authenticated');
          return null;
        }
      },
      staleTime: CACHE_TIMES.VERY_LONG
    },
    {
      queryKey: ['userProfile'],
      queryFn: async () => {
        try {
          const profiles = await base44.entities.UserProfile.list('', 1);
          return profiles[0] || null;
        } catch (error) {
          console.log('Failed to load user profile');
          return null;
        }
      },
      staleTime: CACHE_TIMES.LONG
    },
    {
      queryKey: ['subscription'],
      queryFn: async () => {
        try {
          const subs = await base44.entities.Subscription.list('', 1);
          return subs[0] || null;
        } catch (error) {
          console.log('Failed to load subscription');
          return null;
        }
      },
      staleTime: CACHE_TIMES.MEDIUM
    }
  ];

  // Use Promise.allSettled to prevent one failure from blocking others
  const results = await Promise.allSettled(
    criticalQueries.map(query => 
      queryClient.prefetchQuery(query).catch(err => {
        console.log(`Failed to prefetch ${query.queryKey.join('/')}:`, err.message);
        return null;
      })
    )
  );

  // Log summary of prefetch results
  const successful = results.filter(r => r.status === 'fulfilled').length;
  console.log(`Prefetched ${successful}/${criticalQueries.length} critical queries`);
}

/**
 * Batch loading - טוען מספר entities בבת אחת עם error handling
 */
export function useBatchQuery(entityQueries) {
  const results = useQueries({
    queries: entityQueries.map(({ entityName, queryKey, filters, sort, limit, staleTime }) => ({
      queryKey: queryKey || [entityName, filters, sort, limit],
      queryFn: async () => {
        try {
          if (filters) {
            return await base44.entities[entityName].filter(filters, sort, limit);
          }
          return await base44.entities[entityName].list(sort, limit);
        } catch (error) {
          console.error(`Batch query for ${entityName} failed:`, error);
          return [];
        }
      },
      staleTime: staleTime || CACHE_TIMES.MEDIUM,
      retry: 1
    }))
  });

  return {
    data: results.map(q => q.data || []),
    isLoading: results.some(q => q.isLoading),
    isError: results.some(q => q.isError),
    errors: results.filter(q => q.error).map(q => q.error)
  };
}

export default useCachedQuery;