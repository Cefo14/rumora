import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { type ReportCollectionData, ReportCollection } from '@/reports/ReportCollection';
import type { WebVitalRating, WebVitalRatingInfo } from './WebVitalReport';
import type { CLSReport } from './CLSReport';

export type CLSCollectionData = ReportCollectionData<CLSReport>;

export class CLSCollection extends ReportCollection<CLSReport> implements WebVitalRatingInfo {
  /**
   * The cumulative layout shift score for the collection, calculated by summing the values of all CLS reports.
   */
  public readonly cumulativeShiftScore: number;
  
  /**
   * Threshold below which the CLS score is considered "Good".
   */
  public readonly goodThreshold = 0.1;
  /**
   * Threshold above which the CLS score is considered "Poor".
   */
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

  /**
   * The overall rating for the CLS collection based on the cumulative shift score.
   * - "GOOD" if the score is less than 0.1
   * - "NEEDS_IMPROVEMENT" if the score is between 0.1 and 0.25
   * - "POOR" if the score is 0.25 or higher
   */
  public get rating(): WebVitalRating {
    if (this.cumulativeShiftScore < 0.1) return 'GOOD';
    if (this.cumulativeShiftScore < 0.25) return 'NEEDS_IMPROVEMENT';
    return 'POOR';
  }

  /**
   * Indicates if the CLS performance is considered "Good".
   */
  public get isGood(): boolean {
    return this.cumulativeShiftScore < this.goodThreshold;
  }

  /**
   * Indicates if the CLS performance "Needs Improvement".
   */
  public get isNeedsImprovement(): boolean {
    return (
      this.cumulativeShiftScore >= this.goodThreshold
      && this.cumulativeShiftScore < this.poorThreshold
    );
  }

  /**
   * Indicates if the CLS performance is considered "Poor".
   */
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
