// Performance Monitoring Utility for Locus
// Tracks key metrics and provides optimization insights

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  category: 'load-time' | 'database' | 'cache' | 'memory' | 'bundle';
}

interface PerformanceReport {
  summary: {
    totalMetrics: number;
    averageLoadTime: number;
    cacheHitRate: number;
    databaseQueryCount: number;
    memoryUsage: number;
  };
  metrics: PerformanceMetric[];
  recommendations: string[];
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private startTime: number = Date.now();
  private databaseQueries: number = 0;
  private cacheHits: number = 0;
  private cacheMisses: number = 0;

  /**
   * Track page load time
   */
  trackPageLoad(pageName: string, loadTime: number): void {
    this.metrics.push({
      name: `${pageName} Load Time`,
      value: loadTime,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'load-time'
    });
  }

  /**
   * Track database query performance
   */
  trackDatabaseQuery(queryName: string, duration: number, success: boolean = true): void {
    this.databaseQueries++;
    this.metrics.push({
      name: `DB Query: ${queryName}`,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'database'
    });

    if (!success) {
      console.warn(`⚠️ Slow database query: ${queryName} took ${duration}ms`);
    }
  }

  /**
   * Track cache performance
   */
  trackCacheAccess(cacheKey: string, hit: boolean, duration: number = 0): void {
    if (hit) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }

    this.metrics.push({
      name: `Cache: ${cacheKey}`,
      value: duration,
      unit: 'ms',
      timestamp: Date.now(),
      category: 'cache'
    });
  }

  /**
   * Track memory usage
   */
  trackMemoryUsage(): void {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const memory = (performance as any).memory;
      if (memory) {
        this.metrics.push({
          name: 'Memory Usage',
          value: memory.usedJSHeapSize / 1024 / 1024, // Convert to MB
          unit: 'MB',
          timestamp: Date.now(),
          category: 'memory'
        });
      }
    }
  }

  /**
   * Track bundle size impact
   */
  trackBundleImpact(componentName: string, size: number): void {
    this.metrics.push({
      name: `Bundle: ${componentName}`,
      value: size,
      unit: 'KB',
      timestamp: Date.now(),
      category: 'bundle'
    });
  }

  /**
   * Get performance report
   */
  getReport(): PerformanceReport {
    const loadTimeMetrics = this.metrics.filter(m => m.category === 'load-time');
    const databaseMetrics = this.metrics.filter(m => m.category === 'database');
    const cacheMetrics = this.metrics.filter(m => m.category === 'cache');
    const memoryMetrics = this.metrics.filter(m => m.category === 'memory');

    const averageLoadTime = loadTimeMetrics.length > 0 
      ? loadTimeMetrics.reduce((sum, m) => sum + m.value, 0) / loadTimeMetrics.length 
      : 0;

    const cacheHitRate = (this.cacheHits + this.cacheMisses) > 0 
      ? (this.cacheHits / (this.cacheHits + this.cacheMisses)) * 100 
      : 0;

    const averageMemoryUsage = memoryMetrics.length > 0 
      ? memoryMetrics.reduce((sum, m) => sum + m.value, 0) / memoryMetrics.length 
      : 0;

    const recommendations = this.generateRecommendations({
      averageLoadTime,
      cacheHitRate,
      databaseQueries: this.databaseQueries,
      memoryUsage: averageMemoryUsage
    });

    return {
      summary: {
        totalMetrics: this.metrics.length,
        averageLoadTime: Math.round(averageLoadTime),
        cacheHitRate: Math.round(cacheHitRate * 100) / 100,
        databaseQueryCount: this.databaseQueries,
        memoryUsage: Math.round(averageMemoryUsage * 100) / 100
      },
      metrics: this.metrics,
      recommendations,
      timestamp: Date.now()
    };
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(data: {
    averageLoadTime: number;
    cacheHitRate: number;
    databaseQueries: number;
    memoryUsage: number;
  }): string[] {
    const recommendations: string[] = [];

    // Load time recommendations
    if (data.averageLoadTime > 2000) {
      recommendations.push('🚀 Consider implementing code splitting to reduce initial bundle size');
    }
    if (data.averageLoadTime > 1000) {
      recommendations.push('⚡ Implement React.memo for expensive components');
    }

    // Cache recommendations
    if (data.cacheHitRate < 70) {
      recommendations.push('🧠 Increase cache TTL or implement more aggressive caching');
    }
    if (data.cacheHitRate < 50) {
      recommendations.push('💾 Consider implementing Redis for server-side caching');
    }

    // Database recommendations
    if (data.databaseQueries > 10) {
      recommendations.push('🗄️ Implement batch queries to reduce database calls');
    }
    if (data.databaseQueries > 5) {
      recommendations.push('📊 Add database indexes for frequently queried fields');
    }

    // Memory recommendations
    if (data.memoryUsage > 100) {
      recommendations.push('🧹 Implement cleanup for event listeners and subscriptions');
    }
    if (data.memoryUsage > 50) {
      recommendations.push('📦 Consider lazy loading for heavy components');
    }

    return recommendations;
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.databaseQueries = 0;
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.startTime = Date.now();
  }

  /**
   * Get metrics for a specific time range
   */
  getMetricsForTimeRange(startTime: number, endTime: number): PerformanceMetric[] {
    return this.metrics.filter(metric => 
      metric.timestamp >= startTime && metric.timestamp <= endTime
    );
  }

  /**
   * Export metrics for analysis
   */
  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      summary: this.getReport().summary,
      timestamp: Date.now()
    }, null, 2);
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Utility functions for easy tracking
export const trackPerformance = {
  pageLoad: (pageName: string, loadTime: number) => 
    performanceMonitor.trackPageLoad(pageName, loadTime),
  
  databaseQuery: (queryName: string, duration: number, success?: boolean) => 
    performanceMonitor.trackDatabaseQuery(queryName, duration, success),
  
  cacheAccess: (cacheKey: string, hit: boolean, duration?: number) => 
    performanceMonitor.trackCacheAccess(cacheKey, hit, duration),
  
  memoryUsage: () => performanceMonitor.trackMemoryUsage(),
  
  bundleImpact: (componentName: string, size: number) => 
    performanceMonitor.trackBundleImpact(componentName, size),
  
  getReport: () => performanceMonitor.getReport(),
  
  clear: () => performanceMonitor.clear(),
  
  export: () => performanceMonitor.exportMetrics()
};

// React Hook for performance tracking
export function usePerformanceTracking() {
  const trackPageLoad = (pageName: string) => {
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      trackPerformance.pageLoad(pageName, loadTime);
    };
  };

  const trackDatabaseQuery = (queryName: string) => {
    const startTime = performance.now();
    
    return (success: boolean = true) => {
      const duration = performance.now() - startTime;
      trackPerformance.databaseQuery(queryName, duration, success);
    };
  };

  const trackCacheAccess = (cacheKey: string) => {
    const startTime = performance.now();
    
    return (hit: boolean) => {
      const duration = performance.now() - startTime;
      trackPerformance.cacheAccess(cacheKey, hit, duration);
    };
  };

  return {
    trackPageLoad,
    trackDatabaseQuery,
    trackCacheAccess,
    getReport: trackPerformance.getReport,
    clear: trackPerformance.clear,
    export: trackPerformance.export
  };
}

// Performance monitoring middleware for API routes
export function withPerformanceMonitoring(handler: Function) {
  return async (req: any, res: any) => {
    const startTime = performance.now();
    const queryName = `${req.method} ${req.url}`;
    
    try {
      const result = await handler(req, res);
      const duration = performance.now() - startTime;
      trackPerformance.databaseQuery(queryName, duration, true);
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      trackPerformance.databaseQuery(queryName, duration, false);
      throw error;
    }
  };
}

// Performance monitoring decorator for functions
export function monitorPerformance(functionName: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const startTime = performance.now();
      
      try {
        const result = await method.apply(this, args);
        const duration = performance.now() - startTime;
        trackPerformance.databaseQuery(functionName, duration, true);
        return result;
      } catch (error) {
        const duration = performance.now() - startTime;
        trackPerformance.databaseQuery(functionName, duration, false);
        throw error;
      }
    };
  };
}

// Auto-cleanup for memory management
if (typeof window !== 'undefined') {
  // Track memory usage every 30 seconds
  setInterval(() => {
    trackPerformance.memoryUsage();
  }, 30000);

  // Clear old metrics every 5 minutes to prevent memory leaks
  setInterval(() => {
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const oldMetrics = performanceMonitor.getMetricsForTimeRange(0, fiveMinutesAgo);
    if (oldMetrics.length > 1000) {
      performanceMonitor.clear();
    }
  }, 5 * 60 * 1000);
}

export default performanceMonitor;
