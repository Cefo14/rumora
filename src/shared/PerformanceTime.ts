/* eslint-disable @typescript-eslint/no-extraneous-class */

/**
 * Utility class for handling performance timing measurements with high precision.
 */
export class PerformanceTime {
  /**
   * Gets the current time as an absolute timestamp (epoch time) with high precision.
   * 
   * This method combines `performance.now()` (high-precision relative time) with
   * `performance.timeOrigin` (absolute navigation start time) to produce the most
   * accurate absolute timestamp possible.
   * @returns Current absolute timestamp in milliseconds since Unix epoch with
   *          sub-millisecond precision (e.g., 1703123456789.123)
   */
  static getAbsoluteTimestamp(): number {
    return performance.now() + performance.timeOrigin;
  }

  /**
   * Converts a relative performance time to an absolute timestamp.
   * 
   * Takes a time value from `performance.now()` or performance entries
   * and converts it to an absolute epoch timestamp by adding the navigation
   * start time (`performance.timeOrigin`).
   * 
   * @param relativeTime - Time in milliseconds relative to navigation start
   * @returns Absolute timestamp in milliseconds since Unix epoch
   * 
   */
  static toAbsoluteTime(relativeTime: number): number {
    return relativeTime + performance.timeOrigin;
  }

  /**
   * Gets the most accurate timestamp possible for report creation.
   * 
   * @alias PerformanceTime.getAbsoluteTimestamp
   * @returns Most accurate available timestamp in milliseconds since Unix epoch
   * ```
   */
  static now(): number {
    return this.getAbsoluteTimestamp();
  }
}