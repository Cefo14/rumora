/* eslint-disable @typescript-eslint/no-extraneous-class */

import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { PerformanceLongTaskTimingEntryMother } from './PerformanceLongTaskTimingEntryMother';
import type { PerformanceLongTaskTimingEntry } from '@/types/PerformanceEntryTypes';

/**
 * Object Mother for LongTaskReport test scenarios
 */
export class LongTaskReportMothers {
  /**
   * Low severity long task (50-100ms) with attribution
   */
  static lowSeverity() {
    return {
      id: 'low-long-task-001',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin),
      occurredAt: PerformanceTime.fromRelativeTime(1000),
      duration: 75,
      name: 'self',
      attribution: [
        {
          containerType: 'iframe',
          containerName: '',
          containerSrc: 'https://ads.example.com',
          containerId: 'ad-frame-1'
        }
      ]
    };
  }

  /**
   * Medium severity long task (100-200ms) with attribution
   */
  static mediumSeverity() {
    return {
      id: 'medium-long-task-002',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin + 500),
      occurredAt: PerformanceTime.fromRelativeTime(2000),
      duration: 150,
      name: 'self',
      attribution: [
        {
          containerType: 'window',
          containerName: 'main',
          containerSrc: '',
          containerId: ''
        }
      ]
    };
  }

  /**
   * High severity long task (200ms+) with multiple attributions
   */
  static highSeverity() {
    return {
      id: 'high-long-task-003',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin + 1000),
      occurredAt: PerformanceTime.fromRelativeTime(3000),
      duration: 350,
      name: 'self',
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
      ]
    };
  }

  /**
   * Long task without attribution data
   */
  static noAttribution() {
    return {
      id: 'no-attr-long-task-004',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin),
      occurredAt: PerformanceTime.fromRelativeTime(4000),
      duration: 120,
      name: 'self',
      attribution: undefined
    };
  }

  /**
   * Boundary case - exactly 100ms (should be medium severity)
   */
  static boundary100ms() {
    return {
      id: 'boundary-100ms-task-005',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin),
      occurredAt: PerformanceTime.fromRelativeTime(5000),
      duration: 100,
      name: 'self',
      attribution: [
        {
          containerType: 'window',
          containerName: '',
          containerSrc: '',
          containerId: ''
        }
      ]
    };
  }

  /**
   * Boundary case - exactly 200ms (should be high severity)
   */
  static boundary200ms() {
    return {
      id: 'boundary-200ms-task-006',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin),
      occurredAt: PerformanceTime.fromRelativeTime(6000),
      duration: 200,
      name: 'self',
      attribution: []
    };
  }

  /**
   * Minimal long task - only required properties
   */
  static minimal() {
    return {
      id: 'minimal-long-task-007',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin),
      occurredAt: PerformanceTime.fromRelativeTime(0),
      duration: 50, // Minimum for long task
      name: 'self',
      attribution: undefined
    };
  }

  /**
   * Creates a PerformanceLongTaskTimingEntry for testing fromPerformanceLongTaskTimingEntry
   */
  static createPerformanceLongTaskTimingEntry(
    scenario: 'low' | 'medium' | 'high' | 'noAttr' | 'boundary100' | 'boundary200' = 'low'
  ): PerformanceLongTaskTimingEntry {
    switch (scenario) {
      case 'low':
        return PerformanceLongTaskTimingEntryMother.lowSeverity();
      case 'medium':
        return PerformanceLongTaskTimingEntryMother.mediumSeverity();
      case 'high':
        return PerformanceLongTaskTimingEntryMother.highSeverity();
      case 'noAttr':
        return PerformanceLongTaskTimingEntryMother.noAttribution();
      case 'boundary100':
        return PerformanceLongTaskTimingEntryMother.boundary100ms();
      case 'boundary200':
        return PerformanceLongTaskTimingEntryMother.boundary200ms();
      default:
        return PerformanceLongTaskTimingEntryMother.lowSeverity();
    }
  }
}