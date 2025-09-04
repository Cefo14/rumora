import { Entity } from "./Entity";

export interface PerformanceReport extends Entity {
  toJSON(): unknown;
  toString(): string;
}
