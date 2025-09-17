import { vi } from 'vitest';

/**
 * Predictable timestamps for testing
 */
export const TEST_TIMESTAMPS = {
  // Simple epoch-based timestamp (day 2 of Unix epoch)
  TIME_ORIGIN: new Date('1970-01-02T00:00:00Z').getTime(), // 86400000
  
  // Common test values
  CURRENT_TIME: 1000,
  FAST_DURATION: 50,
  SLOW_DURATION: 2000,
  LONG_TASK_DURATION: 100
} as const;

/**
 * Sets up a mocked Performance API with predictable values
 */
export function setupPerformanceAPI() {
  // Mock performance.timeOrigin
  Object.defineProperty(performance, 'timeOrigin', {
    value: TEST_TIMESTAMPS.TIME_ORIGIN,
    writable: true,
    configurable: true
  });

  // Mock performance.now
  vi.spyOn(performance, 'now').mockReturnValue(TEST_TIMESTAMPS.CURRENT_TIME);

  // Mock other performance methods if needed
  vi.spyOn(performance, 'mark').mockImplementation((markName: string, _markOptions?: PerformanceMarkOptions) => {
    return {
      name: markName,
      entryType: 'mark',
      startTime: TEST_TIMESTAMPS.CURRENT_TIME,
      duration: 0,
      toJSON: () => ({})
    } as PerformanceMark;
  });
  vi.spyOn(performance, 'measure').mockImplementation((measureName: string, _startOrOptions?: string | PerformanceMeasureOptions, _endMark?: string) => {
    return {
      name: measureName,
      entryType: 'measure',
      startTime: TEST_TIMESTAMPS.CURRENT_TIME,
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
  return TEST_TIMESTAMPS.TIME_ORIGIN + relativeTime;
}
