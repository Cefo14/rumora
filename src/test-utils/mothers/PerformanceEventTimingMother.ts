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

  /**
   * Fast interaction - good performance
   */
  static withFastInteraction(): PerformanceEventTimingEntry {
    const startTime = 500;
    const duration = 80; // Good INP < 200ms
    
    return PerformanceEventTimingMother.withCustomValues({
      name: 'click',
      startTime,
      duration,
      processingStart: startTime + 10,
      processingEnd: startTime + duration,
      interactionId: 1
    });
  }

  /**
   * Slow interaction - poor performance
   */
  static withSlowInteraction(): PerformanceEventTimingEntry {
    const startTime = 1000;
    const duration = 600; // Poor INP >= 500ms
    
    return PerformanceEventTimingMother.withCustomValues({
      name: 'click',
      startTime,
      duration,
      processingStart: startTime + 20,
      processingEnd: startTime + duration,
      interactionId: 2
    });
  }

  /**
   * Keyboard interaction
   */
  static withKeyboardInteraction(): PerformanceEventTimingEntry {
    const startTime = 800;
    const duration = 250; // Needs improvement range
    
    return PerformanceEventTimingMother.withCustomValues({
      name: 'keydown',
      startTime,
      duration,
      processingStart: startTime + 5,
      processingEnd: startTime + duration,
      interactionId: 3,
      cancelable: true
    });
  }

  /**
   * Touch interaction for mobile
   */
  static withTouchInteraction(): PerformanceEventTimingEntry {
    const startTime = 300;
    const duration = 180; // Good performance
    
    return PerformanceEventTimingMother.withCustomValues({
      name: 'pointerdown',
      startTime,
      duration,
      processingStart: startTime + 15,
      processingEnd: startTime + duration,
      interactionId: 4,
      cancelable: false
    });
  }
}