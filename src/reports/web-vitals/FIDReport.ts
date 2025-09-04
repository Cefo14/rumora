import { WebVitalReport, WebVitalReportDTO } from "@/reports/web-vitals/WebVitalReport";
import { PerformanceTimestamp } from "@/shared/PerformanceTimestamp";

/**
 * First Input Delay (FID) report for measuring interactivity.
 * 
 * FID measures the time from when a user first interacts with a page (clicks a link,
 * taps on a button, or uses a custom JavaScript-powered control) to the time when the
 * browser is actually able to begin processing event handlers in response to that interaction.
 * 
 * Thresholds:
 * - Good: < 100ms
 * - Needs Improvement: 100ms - 300ms
 * - Poor: >= 300ms
 */
export class FIDReport extends WebVitalReport {
  public readonly name = "FIRST_INPUT_DELAY";
  public readonly goodThreshold = 100;
  public readonly poorThreshold = 300;

  private constructor(data: WebVitalReportDTO) {
    super(data);
    Object.freeze(this);
  }

  public static create(data: WebVitalReportDTO): FIDReport {
    return new FIDReport(data);
  }

  public static fromPerformanceEventTiming(id: string, entry: PerformanceEventTiming): FIDReport {
    const data: WebVitalReportDTO = {
      id,
      createdAt: PerformanceTimestamp.now(),
      occurredAt: PerformanceTimestamp.fromRelativeTime(entry.startTime),
      value: entry.startTime
    };
    return new FIDReport(data);
  }
}
