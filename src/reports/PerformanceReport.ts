export interface PerformanceReport {
  readonly id: string;
  toJSON(): unknown;
  toString(): string;
}
