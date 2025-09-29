/* eslint-disable @typescript-eslint/no-extraneous-class */

import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { PerformanceNavigationTimingMother } from './PerformanceNavigationTimingMother';

/**
 * Object Mother for DOMTimingReport test scenarios
 */
export class DOMTimingReportMothers {
  /**
   * Standard fast page load scenario
   */
  static fastPageLoad() {
    return {
      id: 'fast-dom-timing-001',
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(0),
      timeToInteractive: 800,        // 800ms to interactive (800 - 0)
      timeToContentLoaded: 900,      // 900ms to DOMContentLoaded (900 - 0)
      timeToDOMComplete: 1000,       // 1000ms to DOM complete (1000 - 0)
      timeToFullLoad: 1030,          // 1030ms to full load (1030 - 0)
      domContentLoadedDuration: 50,  // 50ms DOMContentLoaded
      loadEventDuration: 30          // 30ms load event
    };
  }

  /**
   * Slow page load scenario with heavy processing
   */
  static slowPageLoad() {
    return {
      id: 'slow-dom-timing-002',
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(100),
      timeToInteractive: 3000,       // 3s to interactive (3100 - 100)
      timeToContentLoaded: 3300,     // 3.3s to DOMContentLoaded (3400 - 100)
      timeToDOMComplete: 4500,       // 4.5s to DOM complete (4600 - 100)
      timeToFullLoad: 4650,          // 4.65s to full load (4750 - 100)
      domContentLoadedDuration: 200, // 200ms DOMContentLoaded
      loadEventDuration: 150         // 150ms load event
    };
  }

  /**
   * Edge case: minimal timings (everything is 0 or very small)
   */
  static minimalTiming() {
    return {
      id: 'minimal-dom-timing-003',
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(0),
      timeToInteractive: 0,
      timeToContentLoaded: 0,
      timeToDOMComplete: 0,
      timeToFullLoad: 1,          // Only full load has minimal time
      domContentLoadedDuration: 0,
      loadEventDuration: 1        // Only load event has minimal time
    };
  }

  /**
   * Creates a mock PerformanceNavigationTiming for testing fromPerformanceEntry
   */
  static createPerformanceNavigationTiming(scenario: 'fast' | 'slow' | 'minimal' = 'fast'): PerformanceNavigationTiming {
    switch (scenario) {
      case 'fast':
        return PerformanceNavigationTimingMother.fastPageLoad();
      case 'slow':
        return PerformanceNavigationTimingMother.slowPageLoad();
      case 'minimal':
        return PerformanceNavigationTimingMother.minimalTiming();
      default:
        return PerformanceNavigationTimingMother.fastPageLoad();
    }
  }
}