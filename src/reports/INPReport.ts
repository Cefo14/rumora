import { WebVitalReport } from "@/reports/WebVitalReport";

export class INPReport extends WebVitalReport {
  readonly name = "INTERACTION_TO_NEXT_PAINT";

  readonly goodThreshold = 200;
  readonly badThreshold = 500;
}
