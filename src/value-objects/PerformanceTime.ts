import { InvalidPerformanceTimeException } from '@/exceptions/PerformanceTimeExceptions';
import type { ValueObject } from './ValueObject';
import { UnsupportedPerformanceAPIException } from '@/exceptions/UnsupportedExceptions';

const isValidPerformanceTime = (time: number) => {
  return Number.isFinite(time) && time >= 0;
};

const isPerformanceAPIAvailable = () => (
  typeof window !== 'undefined' &&
  typeof performance !== 'undefined' &&
  typeof performance.timeOrigin === 'number' &&
  typeof performance.now === 'function'
);

/**
 * Immutable value object representing a performance timestamp.
 * 
 * Handles conversion between relative time (from navigation start) and 
 * absolute time (epoch timestamp) automatically. Internally stores as 
 * relative time for consistency with performance timing APIs.
 */
export class PerformanceTime implements ValueObject {
  public readonly relativeTime: number;
  public readonly absoluteTime: number;

  private constructor(relativeTime: number) {
    this.relativeTime = relativeTime;
    this.absoluteTime = relativeTime + performance.timeOrigin;
    Object.freeze(this);
  }

  /**
   * Creates a PerformanceTime from a relative time value.
   * Use with values from performance APIs (PerformanceEntry.startTime, etc.)
   */
  static fromRelativeTime(time: number): PerformanceTime {
    if (!isPerformanceAPIAvailable()) {
      throw new UnsupportedPerformanceAPIException();
    }
    if (!isValidPerformanceTime(time)) {
      throw new InvalidPerformanceTimeException();
    }
    return new PerformanceTime(time);
  }

  /**
   * Creates a PerformanceTime from an absolute timestamp.
   * Use with epoch timestamps (Date.now()) or for testing.
   */
  static fromAbsoluteTime(time: number): PerformanceTime {
    if (!isPerformanceAPIAvailable()) {
      throw new UnsupportedPerformanceAPIException();
    }
    if (!isValidPerformanceTime(time)) {
      throw new InvalidPerformanceTimeException();
    }

    const relative = time - performance.timeOrigin;
    return new PerformanceTime(Math.max(0, relative));
  }

  /**
   * Gets the current timestamp as a PerformanceTime.
   */
  static now(): PerformanceTime {
    return PerformanceTime.fromRelativeTime(performance.now());
  }

  /**
   * Compares this timestamp with another for equality.
   */
  equals(other: PerformanceTime): boolean {
    return this.relativeTime === other.relativeTime;
  }

  /**
   * Checks if this timestamp is greater than or equal to another.
   */
  isGreaterThanOrEqual(other: PerformanceTime): boolean {
    return this.relativeTime >= other.relativeTime;
  }

  /**
   * Checks if this timestamp is greater than another.
   */
  isGreaterThan(other: PerformanceTime): boolean {
    return this.relativeTime > other.relativeTime;
  }

  /**
   * Checks if this timestamp is less than or equal to another.
   */
  isLessThanOrEqual(other: PerformanceTime): boolean {
    return this.relativeTime <= other.relativeTime;
  }

  /**
   * Checks if this timestamp is less than another.
   */
  isLessThan(other: PerformanceTime): boolean {
    return this.relativeTime < other.relativeTime;
  }

  /**
   * Adds a duration to this timestamp.
   */
  add(value: number | PerformanceTime): PerformanceTime {
    const relativeValue = value instanceof PerformanceTime ? value.relativeTime : value;
    return PerformanceTime.fromRelativeTime(this.relativeTime + relativeValue);
  }

  /**
   * Subtracts a duration from this timestamp.
   */
  subtract(value: number | PerformanceTime): PerformanceTime {
    const relativeValue = value instanceof PerformanceTime ? value.relativeTime : value;
    return PerformanceTime.fromRelativeTime(this.relativeTime - relativeValue);
  }

  /**
   * Returns a string representation of the timestamp.
   */
  toString(): string {
    return this.absoluteTime.toString();
  }

  /**
   * Returns the JSON representation of the timestamp.
   */
  toJSON() {
    return {
      absolute: this.absoluteTime,
      relative: this.relativeTime,
    };
  }
}
