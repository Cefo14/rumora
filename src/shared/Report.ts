import { Entity } from "./Entity";
import { PerformanceTimestamp } from "./PerformanceTimestamp";

export interface Report extends Entity {
  readonly createdAt: PerformanceTimestamp;
  readonly occurredAt: PerformanceTimestamp;
}
