import { WebVitalReport } from "@/reports/WebVitalReport";

export class TTFBReport extends WebVitalReport {
  readonly name = "TIME_TO_FIRST_BYTE";

  readonly goodThreshold = 800;
  readonly badThreshold = 1800;
}
