export interface Report {
  readonly id: string;
  readonly value: number;
  readonly timestamp: number;
  toJSON(): unknown;
  toString(): string;
}
