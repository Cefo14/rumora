export interface Entity {
  readonly id: string;
  toJSON(): unknown;
  toString(): string;
}
