/* eslint-disable @typescript-eslint/no-extraneous-class */

import type { PerformanceLongTaskTimingEntry } from '@/types/PerformanceEntryTypes';

/**
 * Object Mother for PerformanceLongTaskTimingEntry test scenarios
 */
export class PerformanceLongTaskTimingEntryMother {
  /**
   * Low severity long task (50-100ms)
   */
  static lowSeverity(): PerformanceLongTaskTimingEntry {
    return {
      // Required PerformanceEntry properties
      name: 'self',
      entryType: 'longtask',
      startTime: 1000,
      duration: 75, // Low severity

      // Long task specific
      attribution: [
        {
          containerType: 'iframe',
          containerName: '',
          containerSrc: 'https://ads.example.com',
          containerId: 'ad-frame-1'
        }
      ],

      toJSON: () => ({})
    } as PerformanceLongTaskTimingEntry;
  }

  /**
   * Medium severity long task (100-200ms)
   */
  static mediumSeverity(): PerformanceLongTaskTimingEntry {
    return {
      // Required PerformanceEntry properties
      name: 'self',
      entryType: 'longtask',
      startTime: 2000,
      duration: 150, // Medium severity

      // Long task specific
      attribution: [
        {
          containerType: 'window',
          containerName: 'main',
          containerSrc: '',
          containerId: ''
        }
      ],

      toJSON: () => ({})
    } as PerformanceLongTaskTimingEntry;
  }

  /**
   * High severity long task (200ms+)
   */
  static highSeverity(): PerformanceLongTaskTimingEntry {
    return {
      // Required PerformanceEntry properties
      name: 'self',
      entryType: 'longtask',
      startTime: 3000,
      duration: 350, // High severity

      // Long task specific
      attribution: [
        {
          containerType: 'iframe',
          containerName: 'analytics',
          containerSrc: 'https://analytics.example.com/script.js',
          containerId: 'analytics-frame'
        },
        {
          containerType: 'script',
          containerName: 'heavy-computation',
          containerSrc: '/js/worker.js',
          containerId: 'worker-script'
        }
      ],

      toJSON: () => ({})
    } as PerformanceLongTaskTimingEntry;
  }

  /**
   * Long task without attribution data
   */
  static noAttribution(): PerformanceLongTaskTimingEntry {
    return {
      // Required PerformanceEntry properties
      name: 'self',
      entryType: 'longtask',
      startTime: 4000,
      duration: 120, // Medium severity

      // No attribution
      attribution: [],

      // Required by PerformanceLongTaskTimingEntry
      cancelable: false,
      processingEnd: 4120,
      processingStart: 4000,
      target: null,

      toJSON: () => ({})
    } as PerformanceLongTaskTimingEntry;
  }

  /**
   * Boundary case - exactly 100ms (low/medium boundary)
   */
  static boundary100ms(): PerformanceLongTaskTimingEntry {
    return {
      // Required PerformanceEntry properties
      name: 'self',
      entryType: 'longtask',
      startTime: 5000,
      duration: 100, // Exactly at boundary

      // Single attribution
      attribution: [
        {
          containerType: 'window',
          containerName: '',
          containerSrc: '',
          containerId: ''
        }
      ],

      toJSON: () => ({})
    } as PerformanceLongTaskTimingEntry;
  }

  /**
   * Boundary case - exactly 200ms (medium/high boundary)
   */
  static boundary200ms(): PerformanceLongTaskTimingEntry {
    return {
      // Required PerformanceEntry properties
      name: 'self',
      entryType: 'longtask',
      startTime: 6000,
      duration: 200, // Exactly at boundary

      // No attribution
      attribution: [],

      toJSON: () => ({})
    } as unknown as PerformanceLongTaskTimingEntry;
  }
}