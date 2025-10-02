import { vi } from 'vitest';
import { WebApiMock } from './WebApiMock';

class PerformanceAPIHelper extends WebApiMock {
  private originalPerformance: Performance | undefined;
  
  // Timestamps predictables para testing
  public readonly TIME_ORIGIN = 86400000; // Jan 2, 1970, 00:00:00 GMT
  public readonly CURRENT_TIME = 86400000 + 1000; // Jan 2, 1970, 00:00:01 GMT

  /**
   * Mock performance API with predictable values
   */
  mock() {
    // Store original performance if first mock
    if (!this.hasBeenMocked && typeof globalThis.performance !== 'undefined') {
      this.originalPerformance = globalThis.performance;
    }

    Object.defineProperty(globalThis, 'performance', {
      value: {
        now: vi.fn(() => this.CURRENT_TIME),
        mark: vi.fn(),
        measure: vi.fn(),
        getEntriesByType: vi.fn(() => []),
        getEntriesByName: vi.fn(() => []),
        clearMarks: vi.fn(),
        clearMeasures: vi.fn(),
        timeOrigin: this.TIME_ORIGIN
      },
      writable: true,
      configurable: true
    });

    this.hasBeenMocked = true;
  }

  /**
   * Restore original performance API
   */
  unmock() {
    if (this.hasBeenMocked && this.originalPerformance !== undefined) {
      Object.defineProperty(globalThis, 'performance', {
        value: this.originalPerformance,
        writable: true,
        configurable: true
      });
    }
    this.hasBeenMocked = false;
  }

  /**
   * Get expected absolute time from relative time
   */
  public toAbsoluteTime(relativeTime: number): number {
    return this.TIME_ORIGIN + relativeTime;
  }
}

// Singleton instance
export const performanceAPIHelper = new PerformanceAPIHelper();