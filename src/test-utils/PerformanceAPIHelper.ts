import { vi } from 'vitest';

/**
 * Predictable timestamps for testing
 */
export const PERFORMANCE_TIMESTAMPS = {
  TIME_ORIGIN: 86400000, // Jan 2, 1970, 00:00:00 GMT
  CURRENT_TIME: 86400000 + 1000, // Jan 2, 1970, 00:00:01 GMT
} as const;

class PerformanceAPIHelper {
  private originalTimeOrigin: number | undefined;

  /**
   * Mock performance API with predictable values
   */
  mockPerformanceAPI() {
    const timeOrigin = PERFORMANCE_TIMESTAMPS.TIME_ORIGIN;
    const currentTime = PERFORMANCE_TIMESTAMPS.CURRENT_TIME;


    // Mock performance.timeOrigin
    Object.defineProperty(performance, 'timeOrigin', {
      value: timeOrigin,
      writable: true,
      configurable: true
    });

    // Mock performance.now
    vi.spyOn(performance, 'now').mockReturnValue(currentTime);

    return { timeOrigin, currentTime };
  }

  /**
   * Restore original performance API
   */
  restorePerformanceAPI() {
    vi.restoreAllMocks();

    Object.defineProperty(performance, 'timeOrigin', {
      value: this.originalTimeOrigin,
        writable: true,
        configurable: true
      }
    );
  }

  /**
   * Get expected absolute time from relative time
   */
  getExpectedAbsoluteTime(relativeTime: number): number {
    return PERFORMANCE_TIMESTAMPS.TIME_ORIGIN + relativeTime;
  }

}

// Singleton instance
export const performanceAPIHelper = new PerformanceAPIHelper();
