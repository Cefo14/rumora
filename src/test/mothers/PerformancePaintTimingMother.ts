/* eslint-disable @typescript-eslint/no-extraneous-class */

import { PerformanceEntryBuilder } from '../builders/PerformanceEntryBuilder';

export class PerformancePaintTimingMother {
  /**
   * Default Paint Timing entry
   */
  static aDefault(): PerformancePaintTiming {
    const baseEntry = PerformanceEntryBuilder
      .create()
      .withName('first-contentful-paint')
      .withType('paint')
      .withStartTime(1500)
      .withDuration(0) // Paint events have zero duration
      .build();

    return {
      ...baseEntry
    } as PerformancePaintTiming;
  }

  /**
   * Custom Paint Timing entry with overrides
   */
  static withCustomValues(overrides: Partial<PerformancePaintTiming>): PerformancePaintTiming {
    const defaultEntry = PerformancePaintTimingMother.aDefault();
    return {
      ...defaultEntry,
      ...overrides
    };
  }

  /**
   * Fast FCP timing - good performance
   */
  static withFastFCP(): PerformancePaintTiming {
    return PerformancePaintTimingMother.withCustomValues({
      name: 'first-contentful-paint',
      startTime: 1200 // Good FCP < 1800ms
    });
  }

  /**
   * Slow FCP timing - poor performance
   */
  static withSlowFCP(): PerformancePaintTiming {
    return PerformancePaintTimingMother.withCustomValues({
      name: 'first-contentful-paint',
      startTime: 3500 // Poor FCP >= 3000ms
    });
  }

  /**
   * First Paint entry (different from FCP)
   */
  static withFirstPaint(): PerformancePaintTiming {
    return PerformancePaintTimingMother.withCustomValues({
      name: 'first-paint',
      startTime: 1000 // FP usually happens before FCP
    });
  }
}