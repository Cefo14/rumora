import type { PerformanceReport } from "@/reports/PerformanceReport";

export type WebVitalRating = 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR';

export interface WebVitalReportDTO {
  id: string;
  timestamp: number;
  createdAt: number;
  value: number;
}

export abstract class WebVitalReport implements PerformanceReport {
  public readonly id: string;
  // Timestamp of when the report was created
  public readonly createdAt: number;
  public readonly value: number;
  // Timestamp of when the event was occurred
  public readonly timestamp: number;

  public abstract readonly name: string;
  public abstract readonly goodThreshold: number;
  public abstract readonly badThreshold: number;

  constructor(data: WebVitalReportDTO) {
    this.id = data.id;
    this.value = data.value;
    this.timestamp = data.timestamp;
    this.createdAt = data.createdAt;
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
