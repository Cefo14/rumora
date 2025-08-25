export interface Report {
  readonly id: string;
  toJSON(): unknown;
  toString(): string;
}
