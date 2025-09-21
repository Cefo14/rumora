import { vi } from 'vitest';

/**
 * Predictable timestamps for testing
 */
export const PERFORMANCE_TIMESTAMPS = {
  // Simple epoch-based timestamp (day 2 of Unix epoch)
  TIME_ORIGIN: 86400000, // Jan 2, 1970, 00:00:00 GMT

  // Current time for tests (can be adjusted as needed)
  CURRENT_TIME: 86400000 + 1000, // Jan 2, 1970, 00:00:01 GMTa
} as const;

/**
 * Sets up a mocked Performance API with predictable values
 */
export function setupPerformanceAPI() {
  // Mock performance.timeOrigin
  Object.defineProperty(performance, 'timeOrigin', {
    value: PERFORMANCE_TIMESTAMPS.TIME_ORIGIN,
    writable: true,
    configurable: true
  });

  // Mock performance.now
  vi.spyOn(performance, 'now').mockReturnValue(PERFORMANCE_TIMESTAMPS.CURRENT_TIME);

  // Mock other performance methods if needed
  vi.spyOn(performance, 'mark').mockImplementation((markName: string, _markOptions?: PerformanceMarkOptions) => {
    return {
      name: markName,
      entryType: 'mark',
      startTime: PERFORMANCE_TIMESTAMPS.CURRENT_TIME,
      duration: 0,
      toJSON: () => ({})
    } as PerformanceMark;
  });
  vi.spyOn(performance, 'measure').mockImplementation((measureName: string, _startOrOptions?: string | PerformanceMeasureOptions, _endMark?: string) => {
    return {
      name: measureName,
      entryType: 'measure',
      startTime: PERFORMANCE_TIMESTAMPS.CURRENT_TIME,
      duration: 0,
      toJSON: () => ({})
    } as PerformanceMeasure;
  });
}

/**
 * Resets all performance mocks
 */
export function cleanupPerformanceAPI() {
  vi.restoreAllMocks();
}

/**
 * Creates a custom timeOrigin for specific test scenarios
 */
export function setupCustomTimeOrigin(customTimeOrigin: number) {
  Object.defineProperty(performance, 'timeOrigin', {
    value: customTimeOrigin,
    writable: true,
    configurable: true
  });
}

/**
 * Helper to calculate expected absolute time from relative
 */
export function getExpectedAbsoluteTime(relativeTime: number): number {
  return PERFORMANCE_TIMESTAMPS.TIME_ORIGIN + relativeTime;
}
