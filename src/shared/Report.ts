import { Entity } from "./Entity";
import { PerformanceTime } from "./PerformanceTime";

export interface Report extends Entity {
  readonly createdAt: PerformanceTime;
  readonly occurredAt: PerformanceTime;
}
