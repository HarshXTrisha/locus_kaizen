'use client';

import { useEffect } from 'react';
import { preloadFirebase } from '@/lib/firebase-lazy';
import { initPerformanceTracking } from '@/lib/performance';

export function ClientInit() {
  useEffect(() => {
    preloadFirebase();
    initPerformanceTracking();
  }, []);

  return null;
}
