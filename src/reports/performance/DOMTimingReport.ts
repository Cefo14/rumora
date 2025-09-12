import type { Report } from "@/reports/Report";
import { PerformanceTime } from "@/value-objects/PerformanceTime";

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
  /** Unique identifier for the report */
  public readonly id: string;
  
  /** Timestamp when the report was created */
  public readonly createdAt: PerformanceTime;

  /** Timestamp when the event occurred */
  public readonly occurredAt: PerformanceTime;

  /**
   * Time until DOM became interactive (DOMContentLoaded ready) in milliseconds.
   * 
   * Time from navigation start until DOM is ready for interaction.
   * This is when DOMContentLoaded event can fire. Good target: < 1500ms
   */
  public readonly interactiveTime: number;

  /**
   * Time spent processing DOM after interactive state in milliseconds.
   * 
   * Time from domInteractive to domComplete.
   * Includes additional resource loading and processing. Good target: < 500ms
   */
  public readonly processingTime: number;

  /**
   * Time spent executing DOMContentLoaded event listeners in milliseconds.
   * 
   * Should be minimal (< 50ms) for good performance.
   * Heavy listeners block further page processing.
   */
  public readonly contentLoadedDuration: number;

  /**
   * Time spent executing window.load event listeners in milliseconds.
   * 
   * Should be minimal (< 50ms) as it blocks onload completion.
   * Consider async/defer for heavy operations.
   */
  public readonly loadEventDuration: number;

  private constructor(data: DOMTimingData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.occurredAt = data.createdAt;
    this.interactiveTime = data.interactiveTime;
    this.processingTime = data.processingTime;
    this.contentLoadedDuration = data.contentLoadedDuration;
    this.loadEventDuration = data.loadEventDuration;

    Object.freeze(this);
  }

  /**
   * Creates a DOMTimingReport from provided data.
   * 
   * @param data - DOM timing data
   * @returns New DOMTimingReport instance
   */
  public static create(data: DOMTimingData): DOMTimingReport {
    return new DOMTimingReport(data);
  }

  /**
   * Creates a DOMTimingReport from PerformanceNavigationTiming data.
   * 
   * @param id - Unique identifier for the report
   * @param entry - PerformanceNavigationTiming entry from the browser
   * @returns New DOMTimingReport instance with calculated timings
   */
  public static fromPerformanceEntry(
    id: string, 
    entry: PerformanceNavigationTiming
  ): DOMTimingReport {
    const data: DOMTimingData = {
      id,
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(entry.startTime),
      interactiveTime: Math.max(0, entry.domInteractive - entry.startTime),
      processingTime: Math.max(0, entry.domComplete - entry.domInteractive),
      contentLoadedDuration: Math.max(0, entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart),
      loadEventDuration: Math.max(0, entry.loadEventEnd - entry.loadEventStart)
    };

    return new DOMTimingReport(data);
  }

  /**
   * Total time spent on event listener execution in milliseconds.
   * 
   * Combined DOMContentLoaded + Load event duration.
   * Good target: < 100ms combined
   * 
   * @returns Combined event listener execution time
   */
  get eventListenerTime(): number {
    return this.contentLoadedDuration + this.loadEventDuration;
  }

  /**
   * Total time from DOM interactive to complete load in milliseconds.
   * 
   * Represents the complete DOM processing time after it becomes interactive.
   * Good target: < 1000ms for optimal user experience.
   * 
   * @returns Time from domInteractive to loadEventEnd
   */
  get totalProcessingTime(): number {
    return this.processingTime + this.loadEventDuration;
  }

  /**
   * Complete page load time from navigation start in milliseconds.
   * 
   * Full page load time including DOM parsing, resources, and events.
   * Good target: < 3000ms for good user experience.
   * 
   * @returns Total time from navigation to complete load
   */
  get totalPageLoadTime(): number {
    return this.interactiveTime + this.totalProcessingTime;
  }

  /**
   * String representation of DOM timing metrics.
   * 
   * @returns Formatted string with key timing metrics
   */
  toString(): string {
    return `DOM: ${this.totalPageLoadTime}ms (Interactive: ${this.interactiveTime}ms, Events: ${this.eventListenerTime}ms})`;
  }

  /**
   * JSON representation for serialization.
   * 
   * @returns Object with all timing data and computed metrics
   */
  toJSON() {
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