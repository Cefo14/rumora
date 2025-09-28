/* eslint-disable @typescript-eslint/no-extraneous-class */

import type { LCPReportData } from '@/reports/web-vitals/LCPReport';
import { LCPReport } from '@/reports/web-vitals/LCPReport';
import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { RATINGS } from '@/types/WebVitals';


export class LCPReportMothers {
  /**
   * Good LCP performance (< 2500ms)
   */
  static good(): LCPReport {
    const data: LCPReportData = {
      id: `lcp-${RATINGS.GOOD.toLowerCase()}`,
      value: 1800, // Good performance
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200),
      element: null
    };
    return LCPReport.create(data);
  }

  /**
   * Needs improvement LCP performance (2500ms - 4000ms)
   */
  static needsImprovement(): LCPReport {
    const data: LCPReportData = {
      id: `lcp-${RATINGS.NEEDS_IMPROVEMENT.toLowerCase().replace('_', '-')}`,
      value: 3200, // Needs improvement
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200),
      element: null
    };
    return LCPReport.create(data);
  }

  /**
   * Poor LCP performance (>= 4000ms)
   */
  static poor(): LCPReport {
    const data: LCPReportData = {
      id: `lcp-${RATINGS.POOR.toLowerCase()}`,
      value: 5500, // Poor performance
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200),
      element: null
    };
    return LCPReport.create(data);
  }

  /**
   * Custom LCP report with specific value
   */
  static withValue(value: number): LCPReport {
    const data: LCPReportData = {
      id: 'lcp-custom',
      value,
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200),
      element: null
    };
    return LCPReport.create(data);
  }

  /**
   * LCP report with a specific element reference
   */
  static withElement(element: Element): LCPReport {
    const data: LCPReportData = {
      id: 'lcp-with-element',
      value: 2000,
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200),
      element
    };
    return LCPReport.create(data);
  }

  /**
   * LCP report without element (null element)
   */
  static withoutElement(): LCPReport {
    const data: LCPReportData = {
      id: 'lcp-without-element',
      value: 2000,
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200),
      element: null
    };
    return LCPReport.create(data);
  }
}