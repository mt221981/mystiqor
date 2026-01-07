import { useEffect } from 'react';

export default function PerformanceMonitor() {
  useEffect(() => {
    // Only run in development mode (checked via hostname)
    const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    if (!isDev) return;

    // Monitor performance metrics
    const logPerformance = () => {
      if ('performance' in window && performance.getEntriesByType) {
        const navigationTiming = performance.getEntriesByType('navigation')[0];
        
        if (navigationTiming) {
          console.log('[Performance] Page Load Time:', Math.round(navigationTiming.loadEventEnd - navigationTiming.fetchStart), 'ms');
          console.log('[Performance] DOM Content Loaded:', Math.round(navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart), 'ms');
        }

        // Log resource timings
        const resources = performance.getEntriesByType('resource');
        const slowResources = resources.filter(r => r.duration > 1000);
        
        if (slowResources.length > 0) {
          console.warn('[Performance] Slow resources detected:');
          slowResources.forEach(r => {
            console.warn(`  - ${r.name}: ${Math.round(r.duration)}ms`);
          });
        }
      }
    };

    // Log performance on load
    if (document.readyState === 'complete') {
      setTimeout(logPerformance, 1000);
    } else {
      window.addEventListener('load', () => {
        setTimeout(logPerformance, 1000);
      });
    }

    // Monitor long tasks (if supported)
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('[Performance] Long task detected:', Math.round(entry.duration), 'ms');
            }
          }
        });
        
        observer.observe({ entryTypes: ['longtask'] });
        
        return () => observer.disconnect();
      } catch (e) {
        // PerformanceObserver might not support longtask
      }
    }
  }, []);

  return null;
}