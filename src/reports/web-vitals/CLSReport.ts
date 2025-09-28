import type { LayoutShiftAttributionEntry, LayoutShiftEntry } from '@/types/PerformanceEntryTypes';
import { PerformanceTime } from '@/value-objects/PerformanceTime';
import type { Report } from '../Report';

export interface CLSReportData {
  id: string;
  createdAt: PerformanceTime;
  occurredAt: PerformanceTime;
  value: number;
  sources: LayoutShiftAttributionEntry[];
}

/**
 * Cumulative Layout Shift (CLS) report for measuring visual stability.
 */
export class CLSReport implements Report {
  public readonly id: string;
  public readonly createdAt: PerformanceTime;
  public readonly occurredAt: PerformanceTime;
  public readonly value: number;
  public readonly sources: LayoutShiftAttributionEntry[];

  private constructor(data: CLSReportData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.occurredAt = data.occurredAt;
    this.value = data.value;
    this.sources = data.sources;
    Object.freeze(this);
  }

  public static create(data: CLSReportData): CLSReport {
    return new CLSReport(data);
  }

  public static fromLayoutShiftEntry(id: string, entry: LayoutShiftEntry): CLSReport {
    const data: CLSReportData = {
      id,
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(entry.startTime),
      value: entry.value,
      sources: entry.sources,
    };
    return new CLSReport(data);
  }

  public toString(): string {
    return `${this.constructor.name}: ${this.value}`;
  }

  public toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt.absoluteTime,
      occurredAt: this.occurredAt.relativeTime,
      value: this.value,
      sources: this.sources,
    };
  }
}
