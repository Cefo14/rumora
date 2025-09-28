/* eslint-disable @typescript-eslint/no-extraneous-class */

import type { PerformanceEventTimingEntry } from '@/types/PerformanceEntryTypes';
import { PerformanceEntryBuilder } from '../builders/PerformanceEntryBuilder';

export class PerformanceEventTimingMother {
  /**
   * Default Event Timing entry
   */
  static aDefault(): PerformanceEventTiming {
    const baseEntry = PerformanceEntryBuilder
      .create()
      .withName('click')
      .withType('event')
      .withStartTime(1000)
      .withDuration(150) // processingEnd - startTime
      .build();

    return {
      ...baseEntry,
      processingStart: 1010,
      processingEnd: 1150, // startTime + duration
      interactionId: 123,
      cancelable: true,
      target: null
    } as PerformanceEventTimingEntry;
  }

  /**
   * Custom Event Timing entry with overrides
   */
  static withCustomValues(overrides: Partial<PerformanceEventTimingEntry>): PerformanceEventTimingEntry {
    const defaultEntry = PerformanceEventTimingMother.aDefault();
    const result = {
      ...defaultEntry,
      ...overrides
    };
    
    // Ensure processingEnd is consistent with startTime + calculated duration if not explicitly set
    if (overrides.startTime && !overrides.processingEnd && overrides.duration) {
      result.processingEnd = overrides.startTime + overrides.duration;
    }
    
    return result;
  }
}