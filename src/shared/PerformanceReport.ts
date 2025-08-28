export interface PerformanceReport {
  readonly id: string;
  readonly createdAt: number;
  toJSON(): unknown;
  toString(): string;
}
