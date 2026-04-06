import React, { useEffect, useCallback } from 'react';

/**
 * Performance optimization utilities
 */

// Debounce function for expensive operations
export const useDebounce = (callback, delay) => {
  const debouncedFn = useCallback(
    (() => {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => callback(...args), delay);
      };
    })(),
    [callback, delay]
  );

  return debouncedFn;
};

// Throttle function for scroll/resize handlers
export const useThrottle = (callback, limit) => {
  const throttledFn = useCallback(
    (() => {
      let inThrottle;
      return (...args) => {
        if (!inThrottle) {
          callback(...args);
          inThrottle = true;
          setTimeout(() => (inThrottle = false), limit);
        }
      };
    })(),
    [callback, limit]
  );

  return throttledFn;
};

// Intersection Observer for lazy rendering
export const useIntersectionObserver = (ref, options = {}) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, options]);

  return isIntersecting;
};

// Prefetch data on hover for better UX
export const usePrefetch = (queryKey, queryFn, queryClient) => {
  const prefetch = useCallback(() => {
    queryClient.prefetchQuery({
      queryKey,
      queryFn,
      staleTime: 30000
    });
  }, [queryKey, queryFn, queryClient]);

  return prefetch;
};

// Memory cleanup on unmount
export const useCleanup = (cleanupFn) => {
  useEffect(() => {
    return cleanupFn;
  }, [cleanupFn]);
};