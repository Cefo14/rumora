import { WebVitalReport } from "@/reports/web-vitals/WebVitalReport";

export class FIDReport extends WebVitalReport {
  readonly name = "FIRST_INPUT_DELAY";

  readonly goodThreshold = 100;
  readonly badThreshold = 300;
}
