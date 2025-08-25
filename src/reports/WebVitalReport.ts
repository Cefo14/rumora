import type { PerformanceReport } from "@/reports/PerformanceReport";

export type WebVitalRating = 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR';

export abstract class WebVitalReport implements PerformanceReport {
  public abstract readonly name: string;
  public abstract readonly goodThreshold: number;
  public abstract readonly badThreshold: number;

  public readonly id: string;
  public readonly timestamp: number;
  public readonly value: number;

  constructor(value: number) {
    this.id = crypto.randomUUID();
    this.value = value;
    this.timestamp = Date.now();
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
      timestamp: this.timestamp,
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
