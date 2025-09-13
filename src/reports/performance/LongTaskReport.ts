import type { Report } from '@/reports/Report';
import type { PerformanceLongTaskTimingEntry } from '@/types/PerformanceEntryTypes';
import { PerformanceTime } from '@/value-objects/PerformanceTime';

interface TaskAttributionTiming {
  containerType: string;
  containerName: string;
  containerSrc: string;
  containerId: string;
}

interface LongTaskData {
  id: string;
  createdAt: PerformanceTime;
  occurredAt: PerformanceTime;
  duration: number;
  name: string;
  attribution?: TaskAttributionTiming[];
}

 /**
 * Report for Long Tasks API performance entries.
 * 
 * Long tasks are tasks that monopolize the main thread for 50ms or more,
 * potentially blocking user interactions and causing poor user experience.
 */
export class LongTaskReport implements Report {
  public readonly id: string;
  public readonly createdAt: PerformanceTime;
  public readonly occurredAt: PerformanceTime;
  public readonly duration: number;
  public readonly name: string;
  public readonly attribution?: TaskAttributionTiming[];

  private constructor(data: LongTaskData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.occurredAt = data.occurredAt;
    this.duration = data.duration;
    this.name = data.name;
    this.attribution = data.attribution;

    Object.freeze(this);
  }

  /**
   * Creates a LongTaskReport from provided data.
   */
  public static create(data: LongTaskData): LongTaskReport {
    return new LongTaskReport(data);
  }

  /**
   * Creates a LongTaskReport from a PerformanceLongTaskTimingEntry.
   */
  public static fromPerformanceLongTaskTimingEntry(
    id: string, 
    entry: PerformanceLongTaskTimingEntry
  ): LongTaskReport {
    return new LongTaskReport({
      id,
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(entry.startTime),
      duration: entry.duration,
      name: entry.name,
      attribution: entry.attribution
    });
  }

  /**
   * Basic severity classification based on duration.
   * 
   * - 50-100ms: Low (noticeable)
   * - 100-200ms: Medium (impacts UX) 
   * - 200ms+: High (significant blocking)
   */
  public get severity(): 'low' | 'medium' | 'high' {
    if (this.duration >= 200) return 'high';
    if (this.duration >= 100) return 'medium';
    return 'low';
  }

  /**
   * Gets the end time of the long task.
   */
  public get endTime(): PerformanceTime {
    return this.occurredAt.add(this.duration);
  }

  /**
   * Checks if attribution information is available.
   */
  public get hasAttribution(): boolean {
    return this.attribution !== undefined && this.attribution.length > 0;
  }

  /**
   * String representation of the long task.
   */
  public toString(): string {
    return `Long Task [${this.severity.toUpperCase()}]: ${this.duration}ms at ${this.occurredAt.relativeTime}ms`;
  }

  /**
   * JSON representation for serialization.
   */
  public toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt.absoluteTime,
      occurredAt: this.occurredAt.absoluteTime,
      duration: this.duration,
      endTime: this.endTime.absoluteTime,
      name: this.name,
      attribution: this.attribution,
      severity: this.severity,
      hasAttribution: this.hasAttribution,
    };
  }
}
