/* eslint-disable @typescript-eslint/no-extraneous-class */
import { CSPViolationErrorReport } from '@/reports/errors/CSPViolationErrorReport';
import { PerformanceTime } from '@/value-objects/PerformanceTime';

interface CSPViolationErrorData {
  id: string;
  createdAt: PerformanceTime;
  occurredAt: PerformanceTime;
  directive: string;
  blockedURI: string;
  sourceFile?: string;
  lineNumber?: number;
  columnNumber?: number;
}

export class CSPViolationErrorReportMothers {
  /**
   * Critical severity - inline script violation
   */
  static critical(): CSPViolationErrorReport {
    const data: CSPViolationErrorData = {
      id: 'csp-critical',
      directive: 'script-src',
      blockedURI: 'inline',
      sourceFile: 'https://example.com/index.html',
      lineNumber: 42,
      columnNumber: 10,
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return CSPViolationErrorReport.create(data);
  }

  /**
   * High severity - style-src violation
   */
  static high(): CSPViolationErrorReport {
    const data: CSPViolationErrorData = {
      id: 'csp-high',
      directive: 'style-src',
      blockedURI: 'https://fonts.googleapis.com/css',
      sourceFile: 'https://example.com/styles.css',
      lineNumber: 15,
      columnNumber: 5,
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return CSPViolationErrorReport.create(data);
  }

  /**
   * Medium severity - img-src violation
   */
  static medium(): CSPViolationErrorReport {
    const data: CSPViolationErrorData = {
      id: 'csp-medium',
      directive: 'img-src',
      blockedURI: 'https://untrusted.com/image.jpg',
      sourceFile: 'https://example.com/gallery.html',
      lineNumber: 78,
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return CSPViolationErrorReport.create(data);
  }

  /**
   * Low severity - object-src violation
   */
  static low(): CSPViolationErrorReport {
    const data: CSPViolationErrorData = {
      id: 'csp-low',
      directive: 'object-src',
      blockedURI: 'https://plugins.com/flash.swf',
      sourceFile: 'https://example.com/legacy.html',
      lineNumber: 234,
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return CSPViolationErrorReport.create(data);
  }

  /**
   * Eval violation
   */
  static evalViolation(): CSPViolationErrorReport {
    const data: CSPViolationErrorData = {
      id: 'csp-eval',
      directive: 'script-src',
      blockedURI: 'eval',
      sourceFile: 'https://example.com/dynamic.js',
      lineNumber: 123,
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return CSPViolationErrorReport.create(data);
  }

  /**
   * Third-party violation
   */
  static thirdParty(): CSPViolationErrorReport {
    const data: CSPViolationErrorData = {
      id: 'csp-third-party',
      directive: 'script-src',
      blockedURI: 'https://malicious.com/script.js',
      sourceFile: 'https://example.com/app.js',
      lineNumber: 56,
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return CSPViolationErrorReport.create(data);
  }

  /**
   * Custom CSP violation with specific properties
   */
  static withCustom(overrides: Partial<CSPViolationErrorData>): CSPViolationErrorReport {
    const defaultData: CSPViolationErrorData = {
      id: 'csp-custom',
      directive: 'script-src',
      blockedURI: 'https://example.com/blocked.js',
      sourceFile: 'https://example.com/app.js',
      lineNumber: 100,
      columnNumber: 5,
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return CSPViolationErrorReport.create({ ...defaultData, ...overrides });
  }
}