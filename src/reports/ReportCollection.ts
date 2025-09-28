
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
  protected readonly _reports: T[];

  constructor(data: ReportCollectionData<T>) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this._reports = data.reports;
  }

  public get reports(): readonly T[] {
    const reports = Array.from(this._reports);
    return Object.freeze(reports);
  }

  public get firstReport(): T | null {
    return this._reports.at(0) ?? null;
  }

  public get lastReport(): T | null {
    return this._reports.at(-1) ?? null;
  }

  public get totalReports(): number {
    return this._reports.length;
  }

  public get isEmpty(): boolean {
    return this.totalReports === 0;
  }

  abstract toString(): string;

  abstract toJSON(): unknown;
}
