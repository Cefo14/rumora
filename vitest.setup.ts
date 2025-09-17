import { beforeEach, vi } from 'vitest';

Object.defineProperty(globalThis, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
    timeOrigin: Date.now()
  },
  writable: true
});

// Mock PerformanceObserver
Object.defineProperty(globalThis, 'PerformanceObserver', {
  value: vi.fn().mockImplementation((_callback) => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(() => [])
  })),
  writable: true
});

beforeEach(() => {
  vi.clearAllMocks();
});