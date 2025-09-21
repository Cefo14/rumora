/* eslint-disable @typescript-eslint/no-extraneous-class */

import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { PERFORMANCE_TIMESTAMPS } from '../PerformanceAPIHelper';
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
      createdAt: PerformanceTime.fromAbsoluteTime(PERFORMANCE_TIMESTAMPS.TIME_ORIGIN),
      occurredAt: PerformanceTime.fromRelativeTime(0),
      interactiveTime: 800,   // 800ms to interactive
      processingTime: 200,    // 200ms processing
      contentLoadedDuration: 50,  // 50ms DOMContentLoaded
      loadEventDuration: 30       // 30ms load event
    };
  }

  /**
   * Slow page load scenario with heavy processing
   */
  static slowPageLoad() {
    return {
      id: 'slow-dom-timing-002',
      createdAt: PerformanceTime.fromAbsoluteTime(PERFORMANCE_TIMESTAMPS.TIME_ORIGIN + 1000),
      occurredAt: PerformanceTime.fromRelativeTime(100),
      interactiveTime: 3000,  // 3s to interactive
      processingTime: 1500,   // 1.5s processing
      contentLoadedDuration: 200, // 200ms DOMContentLoaded
      loadEventDuration: 150      // 150ms load event
    };
  }

  /**
   * Edge case: minimal timings (everything is 0 or very small)
   */
  static minimalTiming() {
    return {
      id: 'minimal-dom-timing-003',
      createdAt: PerformanceTime.fromAbsoluteTime(PERFORMANCE_TIMESTAMPS.TIME_ORIGIN),
      occurredAt: PerformanceTime.fromRelativeTime(0),
      interactiveTime: 0,
      processingTime: 0,
      contentLoadedDuration: 0,
      loadEventDuration: 1  // Only load event has minimal time
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