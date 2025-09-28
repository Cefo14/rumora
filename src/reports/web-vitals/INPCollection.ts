import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { type ReportCollectionData, ReportCollection } from '@/reports/ReportCollection';
import type { INPReport } from './INPReport';

export type INPCollectionData = ReportCollectionData<INPReport>;

export class INPCollection extends ReportCollection<INPReport> {
  private constructor(data: INPCollectionData) {
    super(data);
    Object.freeze(this);
  }

  public static create(id: string, reports: INPReport[]): INPCollection {
    return new INPCollection({
      id,
      createdAt: PerformanceTime.now(),
      reports
    });
  }

  public get worstReport(): INPReport | null {
    if (this.isEmpty) return null;

    return this.reports.reduce((worst, current) =>
      current.value > worst.value ? current : worst
    );
  }

  public get percentile98(): INPReport | null {
    if (this.isEmpty) return null;
    
    const sorted = this.reports.toSorted((a, b) => a.value - b.value);
    const index = Math.floor(sorted.length * 0.98);
    return sorted[index] || sorted[sorted.length - 1];
  }

  toString(): string {
    return `INPCollection: { id: ${this.id}, createdAt: ${this.createdAt.absoluteTime}, totalReports: ${this.totalReports} }`;
  }

  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt.absoluteTime,
      reports: this.reports,
    };
  }
}