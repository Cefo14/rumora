import type { Report } from '@/reports/Report';
import { PerformanceTime } from '@/value-objects/PerformanceTime';

interface DOMTimingData {
  id: string;
  createdAt: PerformanceTime;
  occurredAt: PerformanceTime;
  interactiveTime: number;
  processingTime: number;
  contentLoadedDuration: number;
  loadEventDuration: number;
}

/**
 * Report for measuring DOM processing and event timing performance.
 * 
 * Tracks the time spent in different phases of DOM processing, from initial
 * parsing to complete load, including event listener execution times.
 */
export class DOMTimingReport implements Report {
  public readonly id: string;
  public readonly createdAt: PerformanceTime;
  public readonly occurredAt: PerformanceTime;
  public readonly interactiveTime: number;
  public readonly processingTime: number;
  public readonly contentLoadedDuration: number;
  public readonly loadEventDuration: number;

  private constructor(data: DOMTimingData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.occurredAt = data.occurredAt; // Fixed: was data.createdAt
    this.interactiveTime = data.interactiveTime;
    this.processingTime = data.processingTime;
    this.contentLoadedDuration = data.contentLoadedDuration;
    this.loadEventDuration = data.loadEventDuration;

    Object.freeze(this);
  }

  /**
   * Creates a DOMTimingReport from provided data.
   */
  public static create(data: DOMTimingData): DOMTimingReport {
    return new DOMTimingReport(data);
  }

  /**
   * Creates a DOMTimingReport from PerformanceNavigationTiming data.
   */
  public static fromPerformanceEntry(
    id: string, 
    entry: PerformanceNavigationTiming
  ): DOMTimingReport {
    return new DOMTimingReport({
      id,
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(entry.startTime),
      interactiveTime: Math.max(0, entry.domInteractive - entry.startTime),
      processingTime: Math.max(0, entry.domComplete - entry.domInteractive),
      contentLoadedDuration: Math.max(0, entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart),
      loadEventDuration: Math.max(0, entry.loadEventEnd - entry.loadEventStart)
    });
  }

  /**
   * Combined DOMContentLoaded + Load event duration.
   */
  public get eventListenerTime(): number {
    return this.contentLoadedDuration + this.loadEventDuration;
  }

  /**
   * Time from DOM interactive to complete load.
   */
  public get totalProcessingTime(): number {
    return this.processingTime + this.loadEventDuration;
  }

  /**
   * Complete page load time from navigation start.
   */
  public get totalPageLoadTime(): number {
    return this.interactiveTime + this.totalProcessingTime;
  }

  /**
   * String representation of DOM timing metrics.
   */
  public toString(): string {
    return `DOM Timing: ${this.totalPageLoadTime}ms (Interactive: ${this.interactiveTime}ms, Events: ${this.eventListenerTime}ms)`;
  }

  /**
   * JSON representation for serialization.
   */
  public toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt.absoluteTime,
      occurredAt: this.occurredAt.absoluteTime,
      interactiveTime: this.interactiveTime,
      processingTime: this.processingTime,
      contentLoadedDuration: this.contentLoadedDuration,
      loadEventDuration: this.loadEventDuration,
      eventListenerTime: this.eventListenerTime,
      totalProcessingTime: this.totalProcessingTime,
      totalPageLoadTime: this.totalPageLoadTime,
    };
  }
}
