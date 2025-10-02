/* eslint-disable @typescript-eslint/no-extraneous-class */

import type { TimeSegment } from '@/value-objects/TimeSegment';
import { TimeSegmentBuilder } from '../builders/TimeSegmentBuilder';

export class TimeSegmentMothers {
  static fastResourceLoad(): TimeSegment {
    return TimeSegmentBuilder
      .aDefault()
      .withStartTime(0)
      .withDuration(50) // 50ms - fast
      .buildFromTiming();
  }

  static slowResourceLoad(): TimeSegment {
    return TimeSegmentBuilder
      .aDefault()
      .withStartTime(0)
      .withDuration(2000) // 2s - slow
      .buildFromTiming();
  }

  static longTaskSegment(): TimeSegment {
    return TimeSegmentBuilder
      .aDefault()
      .withStartTime(500)
      .withDuration(100) // >50ms threshold for long task
      .buildFromTiming();
  }

  static zeroTimingSegment(): TimeSegment {
    return TimeSegmentBuilder
      .withZeroDuration()
      .buildFromTiming();
  }

  static typicalNavigationSegment(): TimeSegment {
    return TimeSegmentBuilder
      .aDefault()
      .withStartTime(0)
      .withDuration(1200) // Typical page load
      .buildFromTiming();
  }
}