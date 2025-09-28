import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { type ReportCollectionData, ReportCollection } from '@/reports/ReportCollection';
import type { WebVitalRating, WebVitalRatingInfo } from './WebVitalReport';
import type { CLSReport } from './CLSReport';

export type CLSCollectionData = ReportCollectionData<CLSReport>;

export class CLSCollection extends ReportCollection<CLSReport> implements WebVitalRatingInfo {
  public readonly cumulativeShiftScore: number;
  public readonly goodThreshold = 0.1;
  public readonly poorThreshold = 0.25;

  private constructor(data: CLSCollectionData) {
    super(data);
    this.cumulativeShiftScore = this.reports.reduce((total, report) => total + report.value, 0);
    Object.freeze(this);
  }

  public static create(id: string, reports: CLSReport[]): CLSCollection {
    return new CLSCollection({
      id,
      createdAt: PerformanceTime.now(),
      reports
    });
  }

  public get rating(): WebVitalRating {
    if (this.cumulativeShiftScore < 0.1) return 'GOOD';
    if (this.cumulativeShiftScore < 0.25) return 'NEEDS_IMPROVEMENT';
    return 'POOR';
  }

  public get isGood(): boolean {
    return this.cumulativeShiftScore < this.goodThreshold;
  }

  public get isNeedsImprovement(): boolean {
    return (
      this.cumulativeShiftScore >= this.goodThreshold
      && this.cumulativeShiftScore < this.poorThreshold
    );
  }

  public get isPoor(): boolean {
    return this.cumulativeShiftScore >= this.poorThreshold;
  }

  toString(): string {
    return `CLSCollection: { id: ${this.id}, createdAt: ${this.createdAt.absoluteTime}, totalReports: ${this.totalReports} }`;
  }

  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt.absoluteTime,
      reports: this.reports,
      cumulativeShiftScore: this.cumulativeShiftScore,
    };
  }
}
