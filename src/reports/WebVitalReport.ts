import { PerformanceReport } from "@/reports/PerformanceReport";

export type WebVitalRating = 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR';

interface WebVitalReportData {
  id: string;
  startTime: number;
  value: number;
}

export abstract class WebVitalReport extends PerformanceReport {
  public abstract readonly name: string;
  public abstract readonly goodThreshold: number;
  public abstract readonly badThreshold: number;

  public readonly value: number;
  public readonly timestamp: number;

  constructor(data: WebVitalReportData) {
    super(data.id);
    this.value = data.value;
    this.timestamp = performance.timeOrigin + data.startTime;
  }

  toString(): string {
    return `${this.name}: ${this.value}ms`;
  }

  get rating(): WebVitalRating {
    if (this.isGood()) return 'GOOD';
    if (this.isNeedsImprovement()) return 'NEEDS_IMPROVEMENT';
    return 'POOR';
  }

  public toJSON(): object {
    return {
      name: this.name,
      id: this.id,
      value: this.value,
      createdAt: this.createdAt,
      rating: this.rating,
    };
  }

  public isGood(): boolean {
    return this.value < this.goodThreshold;
  }

  public isNeedsImprovement(): boolean {
    return (
      this.value >= this.goodThreshold
      && this.value < this.badThreshold
    );
  }

  public isPoor(): boolean {
    return this.value >= this.badThreshold;
  }
}
