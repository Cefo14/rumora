/* eslint-disable @typescript-eslint/no-extraneous-class */

/**
 * Object Mother for PerformanceNavigationTiming test scenarios
 */
export class PerformanceNavigationTimingMother {
  /**
   * Fast page load scenario - typical SPA or optimized site
   */
  static fastPageLoad(): PerformanceNavigationTiming {
    return {
      // Required PerformanceEntry properties
      name: 'navigation',
      entryType: 'navigation',
      startTime: 0,
      duration: 1030,
      
      // Required PerformanceResourceTiming properties
      initiatorType: 'navigation',
      nextHopProtocol: 'h2',
      workerStart: 0,
      transferSize: 15000,
      encodedBodySize: 12000,
      decodedBodySize: 12000,
      responseStatus: 200,
      serverTiming: [],
      
      // DNS and Connection (very fast)
      fetchStart: 0,
      domainLookupStart: 0,
      domainLookupEnd: 10,
      connectStart: 10,
      connectEnd: 50,
      secureConnectionStart: 15,
      
      // Request/Response (fast)
      requestStart: 50,
      responseStart: 100,
      responseEnd: 200,
      
      // DOM Processing (optimized)
      domInteractive: 800,        // 800ms to interactive
      domComplete: 1000,          // 200ms processing after interactive
      
      // Events (minimal)
      domContentLoadedEventStart: 850,
      domContentLoadedEventEnd: 900,    // 50ms DOMContentLoaded
      loadEventStart: 1000,
      loadEventEnd: 1030,              // 30ms load event
      
      // Navigation specific
      unloadEventStart: 0,
      unloadEventEnd: 0,
      redirectStart: 0,
      redirectEnd: 0,
      type: 'navigate' as NavigationTimingType,
      redirectCount: 0,
      
      toJSON: () => ({})
    } as PerformanceNavigationTiming;
  }

  /**
   * Slow page load scenario - heavy site with network latency
   */
  static slowPageLoad(): PerformanceNavigationTiming {
    return {
      // Required PerformanceEntry properties
      name: 'navigation',
      entryType: 'navigation',
      startTime: 100,
      duration: 4650,
      
      // Required PerformanceResourceTiming properties
      initiatorType: 'navigation',
      nextHopProtocol: 'http/1.1',
      workerStart: 0,
      transferSize: 85000,
      encodedBodySize: 75000,
      decodedBodySize: 75000,
      responseStatus: 200,
      serverTiming: [],
      
      // DNS and Connection (slow network)
      fetchStart: 100,
      domainLookupStart: 100,
      domainLookupEnd: 200,
      connectStart: 200,
      connectEnd: 400,
      secureConnectionStart: 250,
      
      // Request/Response (slow server)
      requestStart: 400,
      responseStart: 800,
      responseEnd: 1500,
      
      // DOM Processing (heavy processing)
      domInteractive: 3100,       // 3000ms to interactive from startTime
      domComplete: 4600,          // 1500ms processing after interactive
      
      // Events (heavy event handlers)
      domContentLoadedEventStart: 3200,
      domContentLoadedEventEnd: 3400,   // 200ms DOMContentLoaded
      loadEventStart: 4600,
      loadEventEnd: 4750,              // 150ms load event
      
      // Navigation specific
      unloadEventStart: 0,
      unloadEventEnd: 0,
      redirectStart: 0,
      redirectEnd: 0,
      type: 'navigate' as NavigationTimingType,
      redirectCount: 0,
      
      toJSON: () => ({})
    } as PerformanceNavigationTiming;
  }

  /**
   * Minimal timing scenario - everything happens instantly or with minimal delay
   */
  static minimalTiming(): PerformanceNavigationTiming {
    return {
      // Required PerformanceEntry properties
      name: 'navigation',
      entryType: 'navigation',
      startTime: 0,
      duration: 1,
      
      // Required PerformanceResourceTiming properties
      initiatorType: 'navigation',
      nextHopProtocol: 'h2',
      workerStart: 0,
      transferSize: 500,
      encodedBodySize: 300,
      decodedBodySize: 300,
      responseStatus: 200,
      serverTiming: [],
      
      // DNS and Connection (cached/local)
      fetchStart: 0,
      domainLookupStart: 0,
      domainLookupEnd: 0,
      connectStart: 0,
      connectEnd: 0,
      secureConnectionStart: 0,
      
      // Request/Response (cached)
      requestStart: 0,
      responseStart: 0,
      responseEnd: 0,
      
      // DOM Processing (minimal DOM)
      domInteractive: 0,
      domComplete: 0,
      
      // Events (no significant event processing)
      domContentLoadedEventStart: 0,
      domContentLoadedEventEnd: 0,
      loadEventStart: 0,
      loadEventEnd: 1,           // Only load event has minimal time
      
      // Navigation specific
      unloadEventStart: 0,
      unloadEventEnd: 0,
      redirectStart: 0,
      redirectEnd: 0,
      type: 'navigate' as NavigationTimingType,
      redirectCount: 0,
      
      toJSON: () => ({})
    } as PerformanceNavigationTiming;
  }

  /**
   * Redirected navigation scenario - includes redirect timing
   */
  static withRedirects(): PerformanceNavigationTiming {
    return {
      // Required PerformanceEntry properties
      name: 'navigation',
      entryType: 'navigation',
      startTime: 0,
      duration: 1430,
      
      // Required PerformanceResourceTiming properties
      initiatorType: 'navigation',
      nextHopProtocol: 'h2',
      workerStart: 0,
      transferSize: 25000,
      encodedBodySize: 20000,
      decodedBodySize: 20000,
      responseStatus: 200,
      serverTiming: [],
      
      // Redirect timing
      redirectStart: 0,
      redirectEnd: 150,          // 150ms redirect
      redirectCount: 2,
      
      // DNS and Connection (after redirects)
      fetchStart: 150,
      domainLookupStart: 150,
      domainLookupEnd: 170,
      connectStart: 170,
      connectEnd: 220,
      secureConnectionStart: 180,
      
      // Request/Response
      requestStart: 220,
      responseStart: 300,
      responseEnd: 450,
      
      // DOM Processing
      domInteractive: 1200,       // 1050ms from fetchStart
      domComplete: 1400,          // 200ms processing
      
      // Events
      domContentLoadedEventStart: 1250,
      domContentLoadedEventEnd: 1300,   // 50ms DOMContentLoaded
      loadEventStart: 1400,
      loadEventEnd: 1430,              // 30ms load event
      
      // Navigation specific
      unloadEventStart: 0,
      unloadEventEnd: 0,
      type: 'reload' as NavigationTimingType,
      
      toJSON: () => ({})
    } as PerformanceNavigationTiming;
  }

  /**
   * Custom scenario builder for specific test cases
   */
  static custom(overrides: Partial<PerformanceNavigationTiming>): PerformanceNavigationTiming {
    const base = this.fastPageLoad();
    return {
      ...base,
      ...overrides,
      duration: overrides.loadEventEnd ?? overrides.duration ?? base.duration
    };
  }
}