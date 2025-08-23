import type { Report } from "@/reports/Report";

export type WebVitalRating = 'GOOD' | 'NEEDS_IMPROVEMENT' | 'POOR';

export abstract class WebVitalReport implements Report {
  abstract readonly name: string;
  abstract readonly goodThreshold: number;
  abstract readonly needsImprovementThreshold: number;

  readonly id: string;
  readonly value: number;
  readonly timestamp: number;

  constructor(value: number) {
    this.id = this.generateUUID();
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
      && this.value < this.needsImprovementThreshold
    );
  }

  public isPoor(): boolean {
    return this.value >= this.needsImprovementThreshold;
  }

  private generateUUID(): string {
    const uuidTemplate = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    if (!('crypto' in window)) {
      return uuidTemplate.replace(/[xy]/g, (character) => {
        const random = Math.random() * 16 | 0;
        const value = character === 'x' ? random : (random & 0x3 | 0x8);
        return value.toString(16);
      });
    }

    if (!('randomUUID' in crypto)) {
      return uuidTemplate.replace(/[xy]/g, (character) => {
        const random = crypto.getRandomValues(new Uint8Array(1))[0] & 15;
        const value = character === 'x' ? random : (random & 0x3 | 0x8);
        return value.toString(16);
      });
    }

    return crypto.randomUUID();
  }
}
