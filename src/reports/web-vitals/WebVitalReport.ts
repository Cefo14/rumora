import type { PerformanceReport } from "@/shared/PerformanceReport";

/**
 * Rating classification for Web Vital metrics based on Google's Core Web Vitals thresholds.
 */
export type WebVitalRating = 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR';

/**
 * Data transfer object for creating WebVitalReport instances.
 */
export interface WebVitalReportDTO {
  /** Unique identifier for the report */
  id: string;
  /** Timestamp when the performance event occurred */
  occurredAt: number;
  /** Timestamp when the report was created */
  createdAt: number;
  /** Measured value of the web vital metric */
  value: number;
}

/**
 * Abstract base class for all Web Vital performance reports.
 * 
 * Provides common functionality for measuring and categorizing web performance metrics
 * according to Google's Core Web Vitals standards. Each concrete implementation defines
 * specific thresholds and measurement logic for individual metrics (CLS, FCP, FID, INP, LCP).
 * 
 * @abstract
 */
export abstract class WebVitalReport implements PerformanceReport {
  /** Unique identifier for this performance report */
  public readonly id: string;
  
  /** Timestamp when this report was created */
  public readonly createdAt: number;
  
  /** The measured value of the web vital metric */
  public readonly value: number;
  
  /** Timestamp when the performance event occurred */
  public readonly occurredAt: number;

  /** Name of the web vital metric (must be implemented by subclasses) */
  public abstract readonly name: string;
  
  /** Threshold value below which the metric is considered 'good' */
  public abstract readonly goodThreshold: number;
  
  /** Threshold value at or above which the metric is considered 'poor' */
  public abstract readonly poorThreshold: number;

  /**
   * Creates a new WebVitalReport instance.
   * 
   * @param data - The data transfer object containing report information
   */
  constructor(data: WebVitalReportDTO) {
    this.id = data.id;
    this.createdAt = data.createdAt;

    this.value = data.value;
    this.occurredAt = data.occurredAt;

    Object.freeze(this);
  }

  /**
   * Returns a string representation of the web vital report.
   * 
   * @returns A formatted string showing the metric name, value, and rating
   * @example "LARGEST_CONTENTFUL_PAINT: 2500ms (NEEDS_IMPROVEMENT)"
   */
  toString(): string {
    return `[${this.name}]: ${this.value}ms (${this.rating})`;
  }

  /**
   * Gets the performance rating of this web vital metric based on its value and thresholds.
   * 
   * @returns The rating classification: 'GOOD', 'NEEDS_IMPROVEMENT', or 'POOR'
   */
  get rating(): WebVitalRating {
    if (this.isGood()) return 'GOOD';
    if (this.isNeedsImprovement()) return 'NEEDS_IMPROVEMENT';
    return 'POOR';
  }

  /**
   * Converts the web vital report to a JSON-serializable object.
   * 
   * @returns An object containing the essential report data for serialization
   */
  public toJSON() {
    return {
      name: this.name,
      id: this.id,
      value: this.value,
      createdAt: this.createdAt,
      rating: this.rating,
    };
  }

  /**
   * Determines if the web vital metric value is within the 'good' threshold.
   * 
   * @returns true if the value is below the good threshold, false otherwise
   */
  public isGood(): boolean {
    return this.value < this.goodThreshold;
  }

  /**
   * Determines if the web vital metric value is within the 'needs improvement' range.
   * 
   * @returns true if the value is between good and poor thresholds (inclusive of good threshold), false otherwise
   */
  public isNeedsImprovement(): boolean {
    return (
      this.value >= this.goodThreshold
      && this.value < this.poorThreshold
    );
  }

  /**
   * Determines if the web vital metric value is within the 'poor' threshold.
   * 
   * @returns true if the value is at or above the poor threshold, false otherwise
   */
  public isPoor(): boolean {
    return this.value >= this.poorThreshold;
  }
}
