// Performance monitoring utilities
export const performanceMetrics = {
  // Track Core Web Vitals
  trackLCP: () => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
        // Send to analytics service
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  },

  trackFID: () => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEventTiming;
          console.log('FID:', fidEntry.processingStart - fidEntry.startTime);
          // Send to analytics service
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    }
  },

  trackCLS: () => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            console.log('CLS:', clsValue);
            // Send to analytics service
          }
        });
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    }
  },

  // Track component load times
  trackComponentLoad: (componentName: string) => {
    const startTime = performance.now();
    return () => {
      const loadTime = performance.now() - startTime;
      console.log(`${componentName} load time:`, loadTime);
      // Send to analytics service
    };
  },

  // Track bundle size
  trackBundleSize: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const transferSize = navigation.transferSize;
        const decodedBodySize = navigation.decodedBodySize;
        console.log('Bundle size:', {
          transferSize: `${(transferSize / 1024).toFixed(2)} KB`,
          decodedBodySize: `${(decodedBodySize / 1024).toFixed(2)} KB`,
        });
      }
    }
  },
};

// Initialize performance tracking
export const initPerformanceTracking = () => {
  if (typeof window !== 'undefined') {
    performanceMetrics.trackLCP();
    performanceMetrics.trackFID();
    performanceMetrics.trackCLS();
    performanceMetrics.trackBundleSize();
  }
};
