/* eslint-disable @typescript-eslint/no-extraneous-class */

import { FCPReport } from '@/reports/web-vitals/FCPReport';
import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { RATINGS } from '@/types/WebVitals';
import type { WebVitalReportDTO } from '@/reports/web-vitals/WebVitalReport';

export class FCPReportMothers {
  /**
   * Good FCP performance (< 1800ms)
   */
  static good(): FCPReport {
    const data: WebVitalReportDTO = {
      id: `fcp-${RATINGS.GOOD.toLowerCase()}`,
      value: 1400, // Good performance
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return FCPReport.create(data);
  }

  /**
   * Needs improvement FCP performance (1800ms - 3000ms)
   */
  static needsImprovement(): FCPReport {
    const data: WebVitalReportDTO = {
      id: `fcp-${RATINGS.NEEDS_IMPROVEMENT.toLowerCase().replace('_', '-')}`,
      value: 2400, // Needs improvement
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return FCPReport.create(data);
  }

  /**
   * Poor FCP performance (>= 3000ms)
   */
  static poor(): FCPReport {
    const data: WebVitalReportDTO = {
      id: `fcp-${RATINGS.POOR.toLowerCase()}`,
      value: 4200, // Poor performance
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return FCPReport.create(data);
  }

  /**
   * Custom FCP report with specific value
   */
  static withValue(value: number): FCPReport {
    const data: WebVitalReportDTO = {
      id: 'fcp-custom',
      value,
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return FCPReport.create(data);
  }
}