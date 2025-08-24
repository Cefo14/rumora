import { WebVitalReport } from "@/reports/WebVitalReport";

export class CLSReport extends WebVitalReport {
  readonly name = "CUMULATIVE_LAYOUT_SHIFT";

  readonly goodThreshold = 0.1;
  readonly badThreshold = 0.25;
}
