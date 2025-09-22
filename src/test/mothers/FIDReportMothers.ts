/* eslint-disable @typescript-eslint/no-extraneous-class */

import { FIDReport } from '@/reports/web-vitals/FIDReport';
import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { RATINGS } from '@/types/WebVitals';
import type { WebVitalReportDTO } from '@/reports/web-vitals/WebVitalReport';

export class FIDReportMothers {
  /**
   * Good FID performance (< 100ms)
   */
  static good(): FIDReport {
    const data: WebVitalReportDTO = {
      id: `fid-${RATINGS.GOOD.toLowerCase()}`,
      value: 80, // Good performance
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return FIDReport.create(data);
  }

  /**
   * Needs improvement FID performance (100ms - 300ms)
   */
  static needsImprovement(): FIDReport {
    const data: WebVitalReportDTO = {
      id: `fid-${RATINGS.NEEDS_IMPROVEMENT.toLowerCase().replace('_', '-')}`,
      value: 200, // Needs improvement
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return FIDReport.create(data);
  }

  /**
   * Poor FID performance (>= 300ms)
   */
  static poor(): FIDReport {
    const data: WebVitalReportDTO = {
      id: `fid-${RATINGS.POOR.toLowerCase()}`,
      value: 450, // Poor performance
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return FIDReport.create(data);
  }

  /**
   * Custom FID report with specific value
   */
  static withValue(value: number): FIDReport {
    const data: WebVitalReportDTO = {
      id: 'fid-custom',
      value,
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200)
    };
    return FIDReport.create(data);
  }
}