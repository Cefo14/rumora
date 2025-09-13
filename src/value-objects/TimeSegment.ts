import { PerformanceTime } from '@/value-objects/PerformanceTime';
import type { ValueObject } from './ValueObject';
import { InvalidTimeSegmentException, InvalidEndTimeException } from '@/errors/TimeSegmentExceptions';

const isValidTime = (time: number) => Number.isFinite(time) && time >= 0;

/**
 * Data structure for creating a TimeSegment.
 */
interface TimeSegmentData {
  start: PerformanceTime;
  end: PerformanceTime;
}

/**
 * Value Object representing a timing segment with start, end, and duration.
 * 
 * Provides a consistent way to handle performance timing measurements across
 * all performance observers (ResourceTiming, NetworkTiming, LongTask, etc.).
 */
export class TimeSegment implements ValueObject {
  /** Start timestamp of the timing segment */
  public readonly start: PerformanceTime;

  /** End timestamp of the timing segment */
  public readonly end: PerformanceTime;


  /**
   * Creates a new TimeSegment instance.
   * 
   * @param data - Timing segment data
   * @private
   */
  private constructor(data: TimeSegmentData) {
    this.start = data.start;
    this.end = data.end;

    // Freeze the object to ensure immutability
    Object.freeze(this);
  }

  /**
   * Creates a TimeSegment from provided data.
   * 
   * @param data - Timing segment data
   * @returns New TimeSegment instance
   */
  public static create(data: TimeSegmentData): TimeSegment {
    return new TimeSegment(data);
  }

  /**
   * Creates a TimeSegment from start and end timestamps.
   * 
   * @param startTime - Start time in milliseconds (relative to performance.timeOrigin)
   * @param endTime - End time in milliseconds (relative to performance.timeOrigin)
   * @returns New TimeSegment with calculated duration
   */
  public static fromTiming(startTime: number, endTime: number): TimeSegment {
    if (!isValidTime(startTime)) throw new InvalidTimeSegmentException(startTime);
    if (!isValidTime(endTime)) throw new InvalidTimeSegmentException(endTime);
    if (endTime < startTime) throw new InvalidEndTimeException(startTime, endTime);

    const start = PerformanceTime.fromRelativeTime(startTime);
    const end = PerformanceTime.fromRelativeTime(endTime);
    return new TimeSegment({ start, end });
  }

  /**
   * Creates a TimeSegment from PerformanceTime objects.
   * 
   * @param start - Start PerformanceTime (optional)
   * @param end - End PerformanceTime (optional)
   * @returns New TimeSegment with calculated duration
   */
  public static fromTimestamps(
    start: PerformanceTime,
    end: PerformanceTime
  ): TimeSegment {
    if (!isValidTime(start.relativeTime)) throw new InvalidTimeSegmentException(start.relativeTime);
    if (!isValidTime(end.relativeTime)) throw new InvalidTimeSegmentException(end.relativeTime);
    if (end.relativeTime < start.relativeTime) throw new InvalidEndTimeException(start.relativeTime, end.relativeTime);
    return new TimeSegment({ start, end });
  }

  public get duration(): number {
    return this.end.relativeTime - this.start.relativeTime;
  }

  /**
   * Checks if the timing segment is empty (zero duration).
   * 
   * @returns True if duration is zero
   */
  public get isEmpty(): boolean {
    return this.duration === 0;
  }

  /**
   * Creates a human-readable string representation.
   * 
   * @returns String representation with duration and timing info
   */
  public toString(): string {
    return `TimeSegment: ${this.duration}ms (${this.start.relativeTime}ms → ${this.end.relativeTime}ms)`;
  }

  /**
   * Converts the timing segment to a JSON object suitable for serialization.
   * 
   * @returns JSON representation with timing data
   */
  public toJSON() {
    return {
      duration: this.duration,
      start: this.start.absoluteTime,
      end: this.end.absoluteTime,
    };
  }
}