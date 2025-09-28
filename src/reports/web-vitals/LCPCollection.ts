import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { type ReportCollectionData, ReportCollection } from '@/reports/ReportCollection';
import type { LCPReport } from './LCPReport';

export type LCPCollectionData = ReportCollectionData<LCPReport>;

export class LCPCollection extends ReportCollection<LCPReport> {
  private constructor(data: LCPCollectionData) {
    super(data);
    Object.freeze(this);
  }

  public static create(id: string, reports: LCPReport[]): LCPCollection {
    return new LCPCollection({
      id,
      createdAt: PerformanceTime.now(),
      reports
    });
  }


  toString(): string {
    return `LCPCollection: { id: ${this.id}, createdAt: ${this.createdAt.absoluteTime}, totalReports: ${this.totalReports} }`;
  }

  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt.absoluteTime,
      reports: this.reports,
    };
  }
}
