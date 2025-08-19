'use client';

import { useEffect } from 'react';
import { usePerformanceTracking } from '@/lib/performance-monitor';

export function PerformanceMonitor() {
  const { trackPageLoad } = usePerformanceTracking();

  useEffect(() => {
    // Track initial page load
    const endTracking = trackPageLoad('Initial Load');
    
    // Track route changes
    const handleRouteChange = () => {
      const pageName = window.location.pathname || 'Unknown';
      trackPageLoad(pageName);
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      endTracking();
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [trackPageLoad]);

  // This component doesn't render anything visible
  return null;
}
