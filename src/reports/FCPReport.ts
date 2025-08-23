import { WebVitalReport } from "@/reports/WebVitalReport";

export class FCPReport extends WebVitalReport {
  readonly name = "FIRST_CONTENTFUL_PAINT";

  readonly goodThreshold = 1800;
  readonly needsImprovementThreshold = 3000;
}
