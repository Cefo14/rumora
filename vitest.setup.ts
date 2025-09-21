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

// Mock PerformanceObserver globally
Object.defineProperty(globalThis, 'PerformanceObserver', {
  value: vi.fn().mockImplementation((_callback) => ({
    observe: vi.fn(),
    disconnect: vi.fn(),
    takeRecords: vi.fn(() => [])
  })),
  writable: true
});

// Mock SecurityPolicyViolationEvent globally
Object.defineProperty(globalThis, 'SecurityPolicyViolationEvent', {
  value: class SecurityPolicyViolationEvent extends Event {
    public readonly effectiveDirective: string;
    public readonly blockedURI: string;
    public readonly sourceFile: string | undefined;
    public readonly lineNumber: number | undefined;
    public readonly columnNumber: number | undefined;
    public readonly violatedDirective: string;

    constructor(type: string, init: SecurityPolicyViolationEventInit) {
      super(type);
      this.effectiveDirective = init.effectiveDirective || '';
      this.blockedURI = init.blockedURI || '';
      this.sourceFile = init.sourceFile;
      this.lineNumber = init.lineNumber;
      this.columnNumber = init.columnNumber;
      this.violatedDirective = init.violatedDirective || '';
    }
  },
  writable: true,
  configurable: true
});

beforeEach(() => {
  vi.clearAllMocks();
});
