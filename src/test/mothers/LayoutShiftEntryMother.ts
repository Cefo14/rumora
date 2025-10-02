/* eslint-disable @typescript-eslint/no-extraneous-class */

import { PerformanceEntryBuilder } from '../builders/PerformanceEntryBuilder';
import type { LayoutShiftEntry } from '@/types/PerformanceEntryTypes';

export class LayoutShiftEntryMother {
  /**
   * Default Layout Shift entry
   */
  static aDefault(): LayoutShiftEntry {
    const baseEntry = PerformanceEntryBuilder
      .create()
      .withName('layout-shift')
      .withType('layout-shift')
      .withStartTime(1000)
      .withDuration(0) // Layout shifts have zero duration
      .build();

    return {
      ...baseEntry,
      value: 0.05, // Good CLS value
      hadRecentInput: false,
      lastInputTime: 0,
      sources: []
    } as LayoutShiftEntry;
  }

  /**
   * Custom Layout Shift entry with overrides
   */
  static withCustomValues(overrides: Partial<LayoutShiftEntry>): LayoutShiftEntry {
    const defaultEntry = LayoutShiftEntryMother.aDefault();
    return {
      ...defaultEntry,
      ...overrides
    };
  }

  /**
   * Low impact layout shift - good stability
   */
  static withLowImpact(): LayoutShiftEntry {
    return LayoutShiftEntryMother.withCustomValues({
      value: 0.02, // Very good CLS
      startTime: 500,
      hadRecentInput: false
    });
  }

  /**
   * High impact layout shift - poor stability
   */
  static withHighImpact(): LayoutShiftEntry {
    return LayoutShiftEntryMother.withCustomValues({
      value: 0.35, // Poor CLS
      startTime: 2000,
      hadRecentInput: false
    });
  }

  /**
   * Layout shift caused by user input (should be ignored)
   */
  static withUserInput(): LayoutShiftEntry {
    return LayoutShiftEntryMother.withCustomValues({
      value: 0.15,
      startTime: 1500,
      hadRecentInput: true,
      lastInputTime: 1400 // Input 100ms before shift
    });
  }

  /**
   * Medium impact layout shift - needs improvement
   */
  static withMediumImpact(): LayoutShiftEntry {
    return LayoutShiftEntryMother.withCustomValues({
      value: 0.18, // Needs improvement range
      startTime: 1200,
      hadRecentInput: false
    });
  }
}