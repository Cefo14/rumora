import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { type ReportCollectionData, ReportCollection } from '@/reports/ReportCollection';
import type { INPReport } from './INPReport';

export type INPCollectionData = ReportCollectionData<INPReport>;

export class INPCollection extends ReportCollection<INPReport> {
  /**
   * The 98th percentile INP report in the collection.
   * This provides a more stable measure of interaction performance by excluding outliers.
   */
  public readonly percentile98: INPReport | null;

  /**
   *  The worst INP report in the collection based on the highest value.
   *  Returns null if the collection is empty.
   * 
   *  Note: For a more stable metric, consider using the 98th percentile report instead.
   * @see percentile98
   */
  public readonly worstReport: INPReport | null;

  private constructor(data: INPCollectionData) {
    super(data);
    this.percentile98 = this.getPercentile98();
    this.worstReport = this.getWorstReport();
    Object.freeze(this);
  }

  public static create(id: string, reports: INPReport[]): INPCollection {
    return new INPCollection({
      id,
      createdAt: PerformanceTime.now(),
      reports
    });
  }

  private getPercentile98(): INPReport | null {
    if (this.isEmpty) return null;
    
    const sorted = this.reports.toSorted((a, b) => a.value - b.value);
    const index = Math.floor(sorted.length * 0.98);
    return sorted[index] || sorted[sorted.length - 1];
  }

  private getWorstReport(): INPReport | null {
    if (this.isEmpty) return null;

    return this.reports.reduce((worst, current) =>
      current.value > worst.value ? current : worst
    );
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