import { WebVitalReport, WebVitalReportDTO } from "@/reports/web-vitals/WebVitalReport";

interface INPReportDTO extends WebVitalReportDTO {
  eventName: string;
}

/**
 * Interaction to Next Paint (INP) report for measuring responsiveness.
 * 
 * INP measures the latency of all interactions that occur throughout the lifespan of a page.
 * The final INP value is the longest interaction observed, ignoring outliers. This metric
 * captures the end-to-end latency of individual events and provides a more comprehensive
 * view of overall responsiveness.
 * 
 * Thresholds:
 * - Good: < 200ms
 * - Needs Improvement: 200ms - 500ms
 * - Poor: >= 500ms
 */
export class INPReport extends WebVitalReport {
  public readonly name = "INTERACTION_TO_NEXT_PAINT";
  public readonly goodThreshold = 200;
  public readonly poorThreshold = 500;

  public readonly eventName: string;

  constructor(data: INPReportDTO) {
    super(data);
    this.eventName = data.eventName;
    Object.freeze(this);
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      eventName: this.eventName,
    };
  }
}
