/* eslint-disable @typescript-eslint/no-extraneous-class */

import { CLSReport } from '@/reports/web-vitals/CLSReport';
import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { RATINGS } from '@/types/WebVitals';
import type { WebVitalReportDTO } from '@/reports/web-vitals/WebVitalReport';

export class CLSReportMothers {
  /**
   * Good CLS performance (< 0.1)
   */
  static good(): CLSReport {
    const data: WebVitalReportDTO = {
      id: `cls-${RATINGS.GOOD.toLowerCase()}`,
      value: 0.05, // Good performance
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return CLSReport.create(data);
  }

  /**
   * Needs improvement CLS performance (0.1 - 0.25)
   */
  static needsImprovement(): CLSReport {
    const data: WebVitalReportDTO = {
      id: `cls-${RATINGS.NEEDS_IMPROVEMENT.toLowerCase().replace('_', '-')}`,
      value: 0.18, // Needs improvement
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return CLSReport.create(data);
  }

  /**
   * Poor CLS performance (>= 0.25)
   */
  static poor(): CLSReport {
    const data: WebVitalReportDTO = {
      id: `cls-${RATINGS.POOR.toLowerCase()}`,
      value: 0.35, // Poor performance
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return CLSReport.create(data);
  }

  /**
   * Custom CLS report with specific value
   */
  static withValue(value: number): CLSReport {
    const data: WebVitalReportDTO = {
      id: 'cls-custom',
      value,
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return CLSReport.create(data);
  }
}
