import { InvalidPerformanceTimestampError } from "@/errors/InvalidPerformanceTimestampError";
import { ValueObject } from "./ValueObject";

/**
 * Immutable value object representing a performance timestamp.
 * 
 * This class encapsulates the complexity of working with performance timing values
 * that can be represented as either relative time (from navigation start) or 
 * absolute time (epoch timestamp). It handles the conversion between these formats
 * automatically and provides a consistent API for performance monitoring.
 * 
 * The timestamp is internally stored as relative time for accuracy and consistency,
 * but can be accessed in either format as needed.
 * 
 * @example
 * ```typescript
 * // Creating from performance entry (relative time)
 * const startTime = PerformanceTimestamp.fromRelativeTime(entry.startTime);
 * 
 * // Creating from absolute timestamp (for testing)
 * const mockTime = PerformanceTimestamp.fromAbsoluteTime(Date.now());
 * 
 * // Using the timestamp
 * console.log('Relative:', startTime.relative);  // e.g., 1234.56ms since navigation
 * console.log('Absolute:', startTime.absolute);  // e.g., 1703123456789.12 epoch time
 * 
 * // Calculating durations (use relative times)
 * const duration = endTime.relative - startTime.relative;
 * 
 * // Correlating events (use absolute times)
 * const occurredAt = new Date(event.timestamp.absolute);
 * ```
 */
export class PerformanceTimestamp implements ValueObject {
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
   * Creates a new PerformanceTimestamp instance.
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
   * Creates a PerformanceTimestamp from a relative time value.
   * 
   * Use this method when working with values from performance APIs like
   * PerformanceEntry.startTime, PerformanceEntry.responseStart, etc.
   * These values are typically relative to navigation start.
   * 
   * @param time - Time in milliseconds relative to navigation start
   * @returns New immutable PerformanceTimestamp instance
   * 
   * @example
   * ```typescript
   * const now = PerformanceTimestamp.fromRelativeTime(performance.now());
   * ```
   */
  static fromRelativeTime(time: number): PerformanceTimestamp {
    if (!Number.isFinite(time) || time < 0) {
      throw new InvalidPerformanceTimestampError();
    }
    return new PerformanceTimestamp(time);
  }

  /**
   * Creates a PerformanceTimestamp from an absolute timestamp.
   * 
   * Use this method when working with epoch timestamps (like Date.now())
   * or when creating mock timestamps for testing. The absolute time will
   * be converted to relative time internally.
   * 
   * @param time - Absolute timestamp in milliseconds since Unix epoch
   * @returns New immutable PerformanceTimestamp instance
   * 
   * @example
   * ```typescript
   * // For testing with known absolute time
   * const mockTimestamp = PerformanceTimestamp.fromAbsoluteTime(1703123456789);
   * 
   * // From Date.now()
   * const nowTimestamp = PerformanceTimestamp.fromAbsoluteTime(Date.now());
   * 
   */
  static fromAbsoluteTime(time: number): PerformanceTimestamp {
    if (!Number.isFinite(time)) {
      throw new InvalidPerformanceTimestampError();
    }

    const relative = time - performance.timeOrigin;
    return new PerformanceTimestamp(Math.max(0, relative));
  }

  /**
   * Gets the current timestamp as a PerformanceTimestamp.
   * 
   * This is a convenience method for creating a timestamp representing
   * the current time. It uses performance.now() to get a high-resolution
   * timestamp relative to the start of the navigation.
   * 
   * @returns Current timestamp as PerformanceTimestamp
   * 
   * @example
   * ```typescript
   * const now = PerformanceTimestamp.now();
   * console.log(`Current time: ${now}`);
   * ```
   */
  static now(): PerformanceTimestamp {
    return PerformanceTimestamp.fromRelativeTime(performance.now());
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
   * Two PerformanceTimestamp instances are considered equal if they
   * represent the same relative time, regardless of how they were created.
   * This implements value equality rather than reference equality.
   * 
   * @param other - Another PerformanceTimestamp to compare with
   * @returns True if both timestamps represent the same time
   * 
   * @example
   * ```typescript
   * const time1 = PerformanceTimestamp.fromRelativeTime(100);
   * const time2 = PerformanceTimestamp.fromRelativeTime(100);
   * const time3 = PerformanceTimestamp.fromAbsoluteTime(
   *   100 + performance.timeOrigin
   * );
   * 
   * console.log(time1.equals(time2)); // true - same relative time
   * console.log(time1.equals(time3)); // true - same time, different creation
   * ```
   */
  equals(other: PerformanceTimestamp): boolean {
    return this.relativeTime === other.relativeTime;
  }

  /**
   * Checks if this timestamp is greater than or equal to another.
   * 
   * @param other - Another PerformanceTimestamp to compare with
   * @returns True if this timestamp is greater than or equal to the other
   * 
   * @example
   * ```typescript
   * const time1 = PerformanceTimestamp.fromRelativeTime(100);
   * const time2 = PerformanceTimestamp.fromRelativeTime(200);
   * console.log(time1.isGreaterThanOrEqual(time2)); // false
   * console.log(time2.isGreaterThanOrEqual(time1)); // true
   * ```
   */
  isGreaterThanOrEqual(other: PerformanceTimestamp): boolean {
    return this.relativeTime >= other.relativeTime;
  }

  /**
   * Checks if this timestamp is greater than another.
   * 
   * @param other - Another PerformanceTimestamp to compare with
   * @returns True if this timestamp is greater than the other
   * 
   * @example
   * ```typescript
   * const time1 = PerformanceTimestamp.fromRelativeTime(100);
   * const time2 = PerformanceTimestamp.fromRelativeTime(200);
   * console.log(time1.isGreaterThan(time2)); // false
   * console.log(time2.isGreaterThan(time1)); // true
   * ```
   */
  isGreaterThan(other: PerformanceTimestamp): boolean {
    return this.relativeTime > other.relativeTime;
  }

  /**
   * Checks if this timestamp is less than or equal to another.
   * 
   * @param other - Another PerformanceTimestamp to compare with
   * @returns True if this timestamp is less than or equal to the other
   * 
   * @example
   * ```typescript
   * const time1 = PerformanceTimestamp.fromRelativeTime(100);
   * const time2 = PerformanceTimestamp.fromRelativeTime(200);
   * console.log(time1.isLessThanOrEqual(time2)); // true
   * console.log(time2.isLessThanOrEqual(time1)); // false
   * ```
   */
  isLessThanOrEqual(other: PerformanceTimestamp): boolean {
    return this.relativeTime <= other.relativeTime;
  }

  /**
   * Checks if this timestamp is less than another.
   * 
   * @param other - Another PerformanceTimestamp to compare with
   * @returns True if this timestamp is less than the other
   * 
   * @example
   * ```typescript
   * const time1 = PerformanceTimestamp.fromRelativeTime(100);
   * const time2 = PerformanceTimestamp.fromRelativeTime(200);
   * console.log(time1.isLessThan(time2)); // true
   * console.log(time2.isLessThan(time1)); // false
   * ```
   */
  isLessThan(other: PerformanceTimestamp): boolean {
    return this.relativeTime < other.relativeTime;
  }

  /**
   * Adds a duration to this timestamp.
   * 
   * @param value - Duration to add (in milliseconds)
   * @returns New PerformanceTimestamp with added duration
   * 
   * @example
   * ```typescript
   * const timestamp = PerformanceTimestamp.fromRelativeTime(1000);
   * const newTimestamp = timestamp.add(500);
   * console.log(newTimestamp); // 1500
   * 
   * const anotherTimestamp = PerformanceTimestamp.fromRelativeTime(200);
   * const yetAnotherTimestamp = newTimestamp.subtract(anotherTimestamp);
   * console.log(yetAnotherTimestamp); // -200
   * ```
   */
  add(value: number | PerformanceTimestamp): PerformanceTimestamp {
    const relativeValue = typeof value === "number" ? value : value.relativeTime;
    return PerformanceTimestamp.fromRelativeTime(this.relativeTime + relativeValue);
  }

  /**
   * Subtracts a duration from this timestamp.
   * 
   * @param value - Duration to subtract (in milliseconds)
   * @returns New PerformanceTimestamp with subtracted duration
   * 
   * @example
   * ```typescript
   * const timestamp = PerformanceTimestamp.fromRelativeTime(1000);
   * const newTimestamp = timestamp.subtract(500);
   * console.log(newTimestamp); // 500
   * 
   * const anotherTimestamp = PerformanceTimestamp.fromRelativeTime(200);
   * const yetAnotherTimestamp = newTimestamp.subtract(anotherTimestamp);
   * console.log(yetAnotherTimestamp); // -200
   * ```
   */
  subtract(value: number | PerformanceTimestamp): PerformanceTimestamp {
    const relativeValue = typeof value === "number" ? value : value.relativeTime;
    return PerformanceTimestamp.fromRelativeTime(this.relativeTime - relativeValue);
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
   * const timestamp = PerformanceTimestamp.fromRelativeTime(1234.56);
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
   * @returns Absolute timestamp as a number for JSON serialization
   * 
   * @example
   * ```typescript
   * const report = {
   *   id: 'example',
   *   timestamp: PerformanceTimestamp.fromRelativeTime(100)
   * };
   * 
   * JSON.stringify(report);
   * // Result: {"id":"example","timestamp":1703123456789.12}
   * ```
   */
  toJSON() {
    return this.absoluteTime;
  }
}
