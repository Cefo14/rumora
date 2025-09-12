export interface ValueObject {
  toJSON(): unknown;
  toString(): string;
}
