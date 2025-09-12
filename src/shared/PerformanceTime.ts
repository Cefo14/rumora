import { InvalidPerformanceTimeException } from "@/errors/PerformanceTimeExceptions";
import { ValueObject } from "./ValueObject";

const isValidPerformanceTime = (time: number) => {
  return Number.isFinite(time) && time >= 0;
};

/**
 * Immutable value object representing a performance timestamp.
 * 
 * This class encapsulates the complexity of working with performance timing values
 * that can be represented as either relative time (from navigation start) or 
 * absolute time (epoch timestamp). It handles the conversion between these formats
 * automatically and provides a consistent API for performance monitoring.
 * 
 * The timestamp is internally stored as relative time for accuracy and consistency,
 * but can be accessed in either format as needed.ccurredAt = new Date(event.timestamp.absolute);
 *
 */
export class PerformanceTime implements ValueObject {
  /** 
   * Internal storage of the timestamp as relative time from navigation start.
   * Stored as relative time for consistency with performance timing APIs.
   */
  private readonly _relativeTime: number;

  /** 
   * Internal storage of the timestamp as absolute time (epoch timestamp).
   * Calculated from relative time and performance.timeOrigin.
   */
  private readonly _absoluteTime: number;

  /**
   * Creates a new PerformanceTime instance.
   * 
   * @param relativeTime - Time in milliseconds relative to navigation start
   * @private Use static factory methods instead
   */
  private constructor(relativeTime: number) {
    this._relativeTime = relativeTime;
    this._absoluteTime = relativeTime + performance.timeOrigin;
    Object.freeze(this);
  }


  /**
   * Creates a PerformanceTime from a relative time value.
   * 
   * Use this method when working with values from performance APIs like
   * PerformanceEntry.startTime, PerformanceEntry.responseStart, etc.
   * These values are typically relative to navigation start.
   * 
   * @param time - Time in milliseconds relative to navigation start
   * @returns New immutable PerformanceTime instance
   * 
   * @example
   * ```typescript
   * const now = PerformanceTime.fromRelativeTime(performance.now());
   * ```
   */
  static fromRelativeTime(time: number): PerformanceTime {
    if (!isValidPerformanceTime(time)) {
      throw new InvalidPerformanceTimeException();
    }
    return new PerformanceTime(time);
  }

  /**
   * Creates a PerformanceTime from an absolute timestamp.
   * 
   * Use this method when working with epoch timestamps (like Date.now())
   * or when creating mock timestamps for testing. The absolute time will
   * be converted to relative time internally.
   * 
   * @param time - Absolute timestamp in milliseconds since Unix epoch
   * @returns New immutable PerformanceTime instance
   * 
   * @example
   * ```typescript
   * // For testing with known absolute time
   * const mockTimestamp = PerformanceTime.fromAbsoluteTime(1703123456789);
   * 
   * // From Date.now()
   * const nowTimestamp = PerformanceTime.fromAbsoluteTime(Date.now());
   * 
   */
  static fromAbsoluteTime(time: number): PerformanceTime {
    if (!isValidPerformanceTime(time)) {
      throw new InvalidPerformanceTimeException();
    }

    const relative = time - performance.timeOrigin;
    return new PerformanceTime(Math.max(0, relative));
  }

  /**
   * Gets the current timestamp as a PerformanceTime.
   * 
   * This is a convenience method for creating a timestamp representing
   * the current time. It uses performance.now() to get a high-resolution
   * timestamp relative to the start of the navigation.
   * 
   * @returns Current timestamp as PerformanceTime
   * 
   * @example
   * ```typescript
   * const now = PerformanceTime.now();
   * console.log(`Current time: ${now}`);
   * ```
   */
  static now(): PerformanceTime {
    return PerformanceTime.fromRelativeTime(performance.now());
  }

  /**
   * Gets the timestamp as relative time from navigation start.
   * 
   * Use this when calculating durations or working with other performance
   * timing values. Relative times are more accurate for duration calculations
   * as they avoid precision issues with large epoch timestamps.
   * 
   * @returns Time in milliseconds since navigation start
   * 
   * @example
   * ```typescript
   * // Calculate duration using relative times
   * const duration = endTime.relative - startTime.relative;
   * 
   * // Compare with performance.now()
   * const elapsed = performance.now() - timestamp.relative;
   * 
   * // Use in performance calculations
   * const isWithinBudget = timestamp.relative < performanceBudget;
   * ```
   */
  get relativeTime(): number {
    return this._relativeTime;
  }

  /**
   * Gets the timestamp as absolute time (epoch timestamp).
   * 
   * Use this when correlating events across different time contexts,
   * logging, or when you need actual wall-clock time. Absolute times
   * are useful for debugging and reporting but less accurate for durations.
   * 
   * @returns Absolute timestamp in milliseconds since Unix epoch
   * 
   * @example
   * ```typescript
   * // Convert to Date for logging
   * const eventTime = new Date(timestamp.absolute);
   * console.log(`Event occurred at: ${eventTime}`);
   * 
   * // Correlate with server logs
   * const serverLogTime = timestamp.absolute;
   * 
   * // JSON serialization (automatic)
   * JSON.stringify(report); // Uses absolute time by default
   * ```
   */
  get absoluteTime(): number {
    return this._absoluteTime;
  }

  /**
   * Compares this timestamp with another for equality.
   * 
   * Two PerformanceTime instances are considered equal if they
   * represent the same relative time, regardless of how they were created.
   * This implements value equality rather than reference equality.
   * 
   * @param other - Another PerformanceTime to compare with
   * @returns True if both timestamps represent the same time
   * 
   * @example
   * ```typescript
   * const time1 = PerformanceTime.fromRelativeTime(100);
   * const time2 = PerformanceTime.fromRelativeTime(100);
   * const time3 = PerformanceTime.fromAbsoluteTime(
   *   100 + performance.timeOrigin
   * );
   * 
   * console.log(time1.equals(time2)); // true - same relative time
   * console.log(time1.equals(time3)); // true - same time, different creation
   * ```
   */
  equals(other: PerformanceTime): boolean {
    return this.relativeTime === other.relativeTime;
  }

  /**
   * Checks if this timestamp is greater than or equal to another.
   * 
   * @param other - Another PerformanceTime to compare with
   * @returns True if this timestamp is greater than or equal to the other
   * 
   * @example
   * ```typescript
   * const time1 = PerformanceTime.fromRelativeTime(100);
   * const time2 = PerformanceTime.fromRelativeTime(200);
   * console.log(time1.isGreaterThanOrEqual(time2)); // false
   * console.log(time2.isGreaterThanOrEqual(time1)); // true
   * ```
   */
  isGreaterThanOrEqual(other: PerformanceTime): boolean {
    return this.relativeTime >= other.relativeTime;
  }

  /**
   * Checks if this timestamp is greater than another.
   * 
   * @param other - Another PerformanceTime to compare with
   * @returns True if this timestamp is greater than the other
   * 
   * @example
   * ```typescript
   * const time1 = PerformanceTime.fromRelativeTime(100);
   * const time2 = PerformanceTime.fromRelativeTime(200);
   * console.log(time1.isGreaterThan(time2)); // false
   * console.log(time2.isGreaterThan(time1)); // true
   * ```
   */
  isGreaterThan(other: PerformanceTime): boolean {
    return this.relativeTime > other.relativeTime;
  }

  /**
   * Checks if this timestamp is less than or equal to another.
   * 
   * @param other - Another PerformanceTime to compare with
   * @returns True if this timestamp is less than or equal to the other
   * 
   * @example
   * ```typescript
   * const time1 = PerformanceTime.fromRelativeTime(100);
   * const time2 = PerformanceTime.fromRelativeTime(200);
   * console.log(time1.isLessThanOrEqual(time2)); // true
   * console.log(time2.isLessThanOrEqual(time1)); // false
   * ```
   */
  isLessThanOrEqual(other: PerformanceTime): boolean {
    return this.relativeTime <= other.relativeTime;
  }

  /**
   * Checks if this timestamp is less than another.
   * 
   * @param other - Another PerformanceTime to compare with
   * @returns True if this timestamp is less than the other
   * 
   * @example
   * ```typescript
   * const time1 = PerformanceTime.fromRelativeTime(100);
   * const time2 = PerformanceTime.fromRelativeTime(200);
   * console.log(time1.isLessThan(time2)); // true
   * console.log(time2.isLessThan(time1)); // false
   * ```
   */
  isLessThan(other: PerformanceTime): boolean {
    return this.relativeTime < other.relativeTime;
  }

  /**
   * Adds a duration to this timestamp.
   * 
   * @param value - Duration to add (in milliseconds)
   * @returns New PerformanceTime with added duration
   * 
   * @example
   * ```typescript
   * const timestamp = PerformanceTime.fromRelativeTime(1000);
   * const newTimestamp = timestamp.add(500);
   * console.log(newTimestamp); // 1500
   * 
   * const anotherTimestamp = PerformanceTime.fromRelativeTime(200);
   * const yetAnotherTimestamp = newTimestamp.subtract(anotherTimestamp);
   * console.log(yetAnotherTimestamp); // -200
   * ```
   */
  add(value: number | PerformanceTime): PerformanceTime {
    const relativeValue = typeof value === "number" ? value : value.relativeTime;
    return PerformanceTime.fromRelativeTime(this.relativeTime + relativeValue);
  }

  /**
   * Subtracts a duration from this timestamp.
   * 
   * @param value - Duration to subtract (in milliseconds)
   * @returns New PerformanceTime with subtracted duration
   * 
   * @example
   * ```typescript
   * const timestamp = PerformanceTime.fromRelativeTime(1000);
   * const newTimestamp = timestamp.subtract(500);
   * console.log(newTimestamp); // 500
   * 
   * const anotherTimestamp = PerformanceTime.fromRelativeTime(200);
   * const yetAnotherTimestamp = newTimestamp.subtract(anotherTimestamp);
   * console.log(yetAnotherTimestamp); // -200
   * ```
   */
  subtract(value: number | PerformanceTime): PerformanceTime {
    const relativeValue = typeof value === "number" ? value : value.relativeTime;
    return PerformanceTime.fromRelativeTime(this.relativeTime - relativeValue);
  }

  /**
   * Returns a string representation of the timestamp.
   * 
   * Uses the absolute timestamp for string representation as it's more
   * meaningful for logging and debugging purposes.
   * 
   * @returns String representation of the absolute timestamp
   * 
   * @example
   * ```typescript
   * const timestamp = PerformanceTime.fromRelativeTime(1234.56);
   * console.log(`Event at: ${timestamp}`); // "Event at: 1703123456789.12"
   * ```
   */
  toString(): string {
    return this._absoluteTime.toString();
  }

  /**
   * Returns the JSON representation of the timestamp.
   * 
   * When serializing to JSON, the absolute timestamp is used by default
   * as it's more useful for analysis and storage. The absolute time allows
   * correlation with other systems and is more meaningful in reports.
   * 
   * @returns Object with absolute and relative time properties
   * 
   * @example
   * ```typescript
   * const timestamp = PerformanceTime.fromRelativeTime(1234.56);
   * const json = JSON.stringify(timestamp);
   * console.log(json); // '{"absolute":1703123456789.12,"relative":1234.56}'
   * ```
   */
  toJSON() {
    return {
      absolute: this._absoluteTime,
      relative: this._relativeTime,
    }
  }
}
