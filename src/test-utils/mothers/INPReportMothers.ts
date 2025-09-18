/* eslint-disable @typescript-eslint/no-extraneous-class */

import { INPReport } from '@/reports/web-vitals/INPReport';
import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { RATINGS } from '@/types/WebVitals';
import type { INPReportDTO } from '@/reports/web-vitals/INPReport';

export class INPReportMothers {
  /**
   * Good INP performance (< 200ms)
   */
  static good(): INPReport {
    const data: INPReportDTO = {
      id: `inp-${RATINGS.GOOD.toLowerCase()}`,
      value: 150, // Good performance
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200),
      eventName: 'click'
    };
    return INPReport.create(data);
  }

  /**
   * Needs improvement INP performance (200ms - 500ms)
   */
  static needsImprovement(): INPReport {
    const data: INPReportDTO = {
      id: `inp-${RATINGS.NEEDS_IMPROVEMENT.toLowerCase().replace('_', '-')}`,
      value: 350, // Needs improvement
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200),
      eventName: 'keydown'
    };
    return INPReport.create(data);
  }

  /**
   * Poor INP performance (>= 500ms)
   */
  static poor(): INPReport {
    const data: INPReportDTO = {
      id: `inp-${RATINGS.POOR.toLowerCase()}`,
      value: 750, // Poor performance
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200),
      eventName: 'click'
    };
    return INPReport.create(data);
  }

  /**
   * Custom INP report with specific value and event
   */
  static withValue(value: number, eventName = 'click'): INPReport {
    const data: INPReportDTO = {
      id: 'inp-custom',
      value,
      occurredAt: PerformanceTime.fromRelativeTime(100),
      createdAt: PerformanceTime.fromRelativeTime(200),
      eventName
    };
    return INPReport.create(data);
  }
}