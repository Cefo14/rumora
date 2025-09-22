/* eslint-disable @typescript-eslint/no-extraneous-class */

import { UnhandledJavaScriptErrorReport } from '@/reports/errors/UnhandledJavaScriptErrorReport';
import { PerformanceTime } from '@/value-objects/PerformanceTime';

interface JavaScriptErrorData {
  id: string;
  createdAt: PerformanceTime;
  occurredAt: PerformanceTime;
  errorMessage: string;
  errorName?: string;
  stack?: string;
  filename?: string;
  lineNumber?: number;
  columnNumber?: number;
}

export class UnhandledJavaScriptErrorReportMothers {
  /**
   * Critical severity error
   */
  static critical(): UnhandledJavaScriptErrorReport {
    const data: JavaScriptErrorData = {
      id: 'error-critical',
      errorMessage: 'Unexpected token',
      errorName: 'SyntaxError',
      stack: 'SyntaxError: Unexpected token\n    at Parser.parse (/app.js:15:10)',
      filename: 'https://example.com/app.js',
      lineNumber: 15,
      columnNumber: 10,
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return UnhandledJavaScriptErrorReport.create(data);
  }

  /**
   * High severity error
   */
  static high(): UnhandledJavaScriptErrorReport {
    const data: JavaScriptErrorData = {
      id: 'error-high',
      errorMessage: 'Cannot read property \'length\' of undefined',
      errorName: 'TypeError',
      stack: 'TypeError: Cannot read property \'length\' of undefined\n    at process (/utils.js:42:5)',
      filename: 'https://example.com/utils.js',
      lineNumber: 42,
      columnNumber: 5,
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return UnhandledJavaScriptErrorReport.create(data);
  }

  /**
   * Medium severity error
   */
  static medium(): UnhandledJavaScriptErrorReport {
    const data: JavaScriptErrorData = {
      id: 'error-medium',
      errorMessage: 'Maximum call stack size exceeded',
      errorName: 'RangeError',
      stack: 'RangeError: Maximum call stack size exceeded\n    at recursive (/recursive.js:89:1)',
      filename: 'https://example.com/recursive.js',
      lineNumber: 89,
      columnNumber: 1,
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return UnhandledJavaScriptErrorReport.create(data);
  }

  /**
   * Low severity error
   */
  static low(): UnhandledJavaScriptErrorReport {
    const data: JavaScriptErrorData = {
      id: 'error-low',
      errorMessage: 'Something went wrong',
      errorName: 'Error',
      stack: 'Error: Something went wrong\n    at handler (/handler.js:200:15)',
      filename: 'https://example.com/handler.js',
      lineNumber: 200,
      columnNumber: 15,
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return UnhandledJavaScriptErrorReport.create(data);
  }

  /**
   * Third-party script error
   */
  static thirdParty(): UnhandledJavaScriptErrorReport {
    const data: JavaScriptErrorData = {
      id: 'error-third-party',
      errorMessage: 'Analytics initialization failed',
      errorName: 'Error',
      filename: 'https://cdn.analytics.com/tracker.js',
      lineNumber: 1,
      columnNumber: 1,
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return UnhandledJavaScriptErrorReport.create(data);
  }

  /**
   * Custom error with specific properties
   */
  static withCustom(overrides: Partial<JavaScriptErrorData>): UnhandledJavaScriptErrorReport {
    const defaultData: JavaScriptErrorData = {
      id: 'error-custom',
      errorMessage: 'Custom error message',
      errorName: 'Error',
      filename: 'https://example.com/custom.js',
      lineNumber: 100,
      columnNumber: 5,
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return UnhandledJavaScriptErrorReport.create({ ...defaultData, ...overrides });
  }
}