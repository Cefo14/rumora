import { WebVitalReport } from "@/reports/WebVitalReport";

export class LCPReport extends WebVitalReport {
  readonly name = "LARGEST_CONTENTFUL_PAINT";

  readonly goodThreshold = 2500;
  readonly needsImprovementThreshold = 4000;
}
