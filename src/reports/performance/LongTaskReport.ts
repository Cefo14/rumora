import { PerformanceLongTaskTimingEntry } from "@/shared/PerformanceEntryTypes";
import { PerformanceReport } from "@/shared/PerformanceReport";
import { PerformanceTimestamp } from "@/shared/PerformanceTimestamp";

interface TaskAttributionTiming {
  containerType: string;
  containerName: string;
  containerSrc: string;
  containerId: string;
}

interface LongTaskData {
  id: string;
  createdAt: PerformanceTimestamp;
  occuredAt: PerformanceTimestamp;
  duration: number;
  name: string;
  attribution?: TaskAttributionTiming[];
}

/**
 * Report for Long Tasks API performance entries.
 * 
 * Long tasks are tasks that monopolize the main thread for extended periods 
 * (50ms or more), potentially blocking user interactions and causing poor 
 * user experience.
 * 
 * This report captures detailed information about these 
 * blocking tasks to help identify performance bottlenecks.
 *
 */
export class LongTaskReport implements PerformanceReport {
  /** Unique identifier for the report */
  public readonly id: string;
  
  /** Timestamp when the report was created (in milliseconds) */
  public readonly createdAt: PerformanceTimestamp;

  /** Timestamp when the long task occurred (in milliseconds) */
  public readonly occuredAt: PerformanceTimestamp;

  /** Duration of the long task in milliseconds */
  public readonly duration: number;
  
  /** Name of the long task entry */
  public readonly name: string;
  
  /** Attribution information about what caused the long task */
  public readonly attribution?: TaskAttributionTiming[];

  /**
   * Creates a new LongTaskReport instance.
   * 
   * @param data - Long task data
   * @private
   */
  private constructor(data: LongTaskData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.occuredAt = data.occuredAt;
    this.duration = data.duration;
    this.name = data.name;
    this.attribution = data.attribution;
  }

  /**
   * Creates a LongTaskReport from provided data.
   * 
   * @param data - Long task data
   * @returns New LongTaskReport instance
   */
  public static create(data: LongTaskData): LongTaskReport {
    return new LongTaskReport(data);
  }

  /**
   * Creates a LongTaskReport from a PerformanceLongTaskTimingEntry.
   * 
   * @param id - Unique identifier for the report
   * @param entry - PerformanceLongTaskTimingEntry from Long Tasks API
   * @returns New LongTaskReport instance with extracted data
   */
  public static fromPerformanceLongTaskTimingEntry(id: string, entry: PerformanceLongTaskTimingEntry): LongTaskReport {
    const { duration, name, attribution } = entry;
    return new LongTaskReport({
      id,
      createdAt: PerformanceTimestamp.now(),
      occuredAt: PerformanceTimestamp.fromRelativeTime(entry.startTime),
      duration,
      name,
      attribution
    });
  }

  /**
   * Determines the severity level of the long task based on its duration.
   * 
   * - 50-100ms: Low severity (noticeable but acceptable)
   * - 100-200ms: Medium severity (impacts user experience)
   * - 200ms+: High severity (significant blocking, poor UX)
   * 
   * @returns Severity level of the long task
   */
  public get severity(): 'low' | 'medium' | 'high' {
    if (this.duration >= 200) return 'high';
    if (this.duration >= 100) return 'medium';
    return 'low';
  }

  /**
   * Checks if the long task has attribution information available.
   * Attribution helps identify the source of the blocking task.
   * 
   * @returns True if attribution information is available
   */
  public get hasAttribution(): boolean {
    return this.attribution !== undefined && this.attribution.length > 0;
  }

  /**
   * Gets the end time of the long task.
   * 
   * @returns End time relative to navigation start (in milliseconds)
   */
  public get endTime(): number {
    return this.occuredAt.relativeTime + this.duration;
  }

  /**
   * Creates a human-readable string representation of the long task report.
   * 
   * @returns String representation including severity, duration, and timing
   */
  public toString(): string {
    const severity = this.severity.toUpperCase();
    return `LONG-TASK [${severity}]: ${this.duration}ms at ${this.occuredAt.relativeTime}ms`;
  }

  /**
   * Converts the report to a JSON object suitable for serialization.
   * 
   * @returns JSON representation of the long task report
   */
  public toJSON(): unknown {
    return {
      id: this.id,
      createdAt: this.createdAt,
      occuredAt: this.occuredAt,
      duration: this.duration,
      endTime: this.endTime,
      name: this.name,
      attribution: this.attribution,
      severity: this.severity,
      hasAttribution: this.hasAttribution,
    };
  }
}
