import { WebVitalReport } from "@/reports/web-vitals/WebVitalReport";

export class FCPReport extends WebVitalReport {
  readonly name = "FIRST_CONTENTFUL_PAINT";

  readonly goodThreshold = 1800;
  readonly badThreshold = 3000;
}
