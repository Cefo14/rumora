
import type { Report } from '@/reports/Report';
import type { PerformanceTime } from '@/value-objects/PerformanceTime';

export interface ReportCollectionData<T extends Report = Report> {  
  id: string;
  createdAt: PerformanceTime;
  reports: T[];
}

/**
 * Generic collection and manager for Report instances.
 * This abstract class provides common functionality for managing a collection
 * of reports, including access to metadata and basic statistics.
 * Specific report types should extend this class to implement
 * type-specific behavior and representations.
 */
export abstract class ReportCollection<T extends Report> {
  public readonly id: string;
  public readonly createdAt: PerformanceTime;
  public readonly reports: readonly T[];

  constructor(data: ReportCollectionData<T>) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.reports = Object.freeze(Array.from(data.reports));
  }

  public get firstReport(): T | null {
    return this.reports.at(0) ?? null;
  }

  public get lastReport(): T | null {
    return this.reports.at(-1) ?? null;
  }

  public get totalReports(): number {
    return this.reports.length;
  }

  public get isEmpty(): boolean {
    return this.totalReports === 0;
  }

  abstract toString(): string;

  abstract toJSON(): unknown;
}
