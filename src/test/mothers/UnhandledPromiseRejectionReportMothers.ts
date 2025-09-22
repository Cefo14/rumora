/* eslint-disable @typescript-eslint/no-extraneous-class */

import { UnhandledPromiseRejectionReport } from '@/reports/errors/UnhandledPromiseRejectionReport';
import { PerformanceTime } from '@/value-objects/PerformanceTime';

interface PromiseErrorData {
  id: string;
  createdAt: PerformanceTime;
  occurredAt: PerformanceTime;
  errorMessage: string;
  errorName?: string;
  stack?: string;
}

export class UnhandledPromiseRejectionReportMothers {
  /**
   * Critical severity - chunk load error
   */
  static critical(): UnhandledPromiseRejectionReport {
    const data: PromiseErrorData = {
      id: 'promise-critical',
      errorMessage: 'Loading chunk 0 failed',
      errorName: 'Error',
      stack: 'Error: Loading chunk 0 failed\n    at loadChunk (/app.js:123:10)',
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return UnhandledPromiseRejectionReport.create(data);
  }

  /**
   * High severity - network error
   */
  static high(): UnhandledPromiseRejectionReport {
    const data: PromiseErrorData = {
      id: 'promise-high',
      errorMessage: 'Failed to fetch',
      errorName: 'TypeError',
      stack: 'TypeError: Failed to fetch\n    at fetchData (/api.js:45:12)',
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return UnhandledPromiseRejectionReport.create(data);
  }

  /**
   * Medium severity - timeout error
   */
  static medium(): UnhandledPromiseRejectionReport {
    const data: PromiseErrorData = {
      id: 'promise-medium',
      errorMessage: 'Request timeout after 5000ms',
      errorName: 'Error',
      stack: 'Error: Request timeout\n    at timeout (/http.js:67:8)',
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return UnhandledPromiseRejectionReport.create(data);
  }

  /**
   * Low severity - generic error
   */
  static low(): UnhandledPromiseRejectionReport {
    const data: PromiseErrorData = {
      id: 'promise-low',
      errorMessage: 'Something went wrong',
      errorName: 'Error',
      stack: 'Error: Something went wrong\n    at handler (/utils.js:89:5)',
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return UnhandledPromiseRejectionReport.create(data);
  }

  /**
   * Network-related error
   */
  static networkRelated(): UnhandledPromiseRejectionReport {
    const data: PromiseErrorData = {
      id: 'promise-network',
      errorMessage: 'Network connection lost',
      errorName: 'Error',
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return UnhandledPromiseRejectionReport.create(data);
  }

  /**
   * JavaScript runtime error
   */
  static jsError(): UnhandledPromiseRejectionReport {
    const data: PromiseErrorData = {
      id: 'promise-js-error',
      errorMessage: 'Cannot read property length of undefined',
      errorName: 'TypeError',
      stack: 'TypeError: Cannot read property length of undefined\n    at process (/data.js:34:7)',
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return UnhandledPromiseRejectionReport.create(data);
  }

  /**
   * Custom promise rejection with specific properties
   */
  static withCustom(overrides: Partial<PromiseErrorData>): UnhandledPromiseRejectionReport {
    const defaultData: PromiseErrorData = {
      id: 'promise-custom',
      errorMessage: 'Custom promise rejection',
      errorName: 'Error',
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return UnhandledPromiseRejectionReport.create({ ...defaultData, ...overrides });
  }
}