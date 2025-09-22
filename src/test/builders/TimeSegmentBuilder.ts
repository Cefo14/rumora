import { TimeSegment } from '@/value-objects/TimeSegment';
import { PerformanceTime } from '@/value-objects/PerformanceTime';

export class TimeSegmentBuilder {
  private startTime = 100;
  private endTime = 200;

  static aDefault(): TimeSegmentBuilder {
    return new TimeSegmentBuilder();
  }

  static withZeroDuration(): TimeSegmentBuilder {
    return new TimeSegmentBuilder()
      .withStartTime(100)
      .withEndTime(100);
  }

  static withLongDuration(): TimeSegmentBuilder {
    return new TimeSegmentBuilder()
      .withStartTime(0)
      .withEndTime(2000); // 2 seconds
  }

  static withShortDuration(): TimeSegmentBuilder {
    return new TimeSegmentBuilder()
      .withStartTime(100)
      .withEndTime(150); // 50ms
  }

  withStartTime(time: number): TimeSegmentBuilder {
    this.startTime = time;
    return this;
  }

  withEndTime(time: number): TimeSegmentBuilder {
    this.endTime = time;
    return this;
  }

  withDuration(duration: number): TimeSegmentBuilder {
    this.endTime = this.startTime + duration;
    return this;
  }

  buildFromTiming(): TimeSegment {
    return TimeSegment.fromTiming(this.startTime, this.endTime);
  }

  buildFromTimestamps(): TimeSegment {
    const start = PerformanceTime.fromRelativeTime(this.startTime);
    const end = PerformanceTime.fromRelativeTime(this.endTime);
    return TimeSegment.fromTimestamps(start, end);
  }

  buildFromCreate(): TimeSegment {
    const start = PerformanceTime.fromRelativeTime(this.startTime);
    const end = PerformanceTime.fromRelativeTime(this.endTime);
    return TimeSegment.create({ start, end });
  }
}