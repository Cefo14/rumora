import { Entity } from "../reports/Entity";
import { PerformanceTime } from "../value-objects/PerformanceTime";

export interface Report extends Entity {
  readonly createdAt: PerformanceTime;
  readonly occurredAt: PerformanceTime;
}
