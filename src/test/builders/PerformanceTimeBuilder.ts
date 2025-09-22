import { PerformanceTime } from '@/value-objects/PerformanceTime';

export class PerformanceTimeBuilder {
  private relativeTime = 100;

  static aDefault(): PerformanceTimeBuilder {
    return new PerformanceTimeBuilder();
  }

  static withZeroTime(): PerformanceTimeBuilder {
    return new PerformanceTimeBuilder().withRelativeTime(0);
  }

  static withLargeTime(): PerformanceTimeBuilder {
    return new PerformanceTimeBuilder().withRelativeTime(5000);
  }

  withRelativeTime(time: number): PerformanceTimeBuilder {
    this.relativeTime = time;
    return this;
  }

  buildFromRelative(): PerformanceTime {
    return PerformanceTime.fromRelativeTime(this.relativeTime);
  }

  buildFromAbsolute(): PerformanceTime {
    const absoluteTime = this.relativeTime + performance.timeOrigin;
    return PerformanceTime.fromAbsoluteTime(absoluteTime);
  }
}