import { WebVitalReport, WebVitalReportDTO } from "@/reports/web-vitals/WebVitalReport";
import { PerformanceTime } from "@/value-objects/PerformanceTime";

/**
 * Largest Contentful Paint (LCP) report for measuring loading performance.
 * 
 * LCP measures the time from when the page starts loading to when the largest text block
 * or image element is rendered on the screen. This metric provides insight into when the
 * main content of a page has finished loading and is ready for user interaction.
 * 
 * Thresholds:
 * - Good: < 2.5s
 * - Needs Improvement: 2.5s - 4.0s
 * - Poor: >= 4.0s
 */
export class LCPReport extends WebVitalReport {
  public readonly name = "LARGEST_CONTENTFUL_PAINT";
  public readonly goodThreshold = 2500;
  public readonly poorThreshold = 4000;

  private constructor(data: WebVitalReportDTO) {
    super(data);
    Object.freeze(this);
  }

  public static create(data: WebVitalReportDTO): LCPReport {
    return new LCPReport(data);
  }

  public static fromLargestContentfulPaint(id: string, entry: LargestContentfulPaint): LCPReport {
    const data: WebVitalReportDTO = {
      id,
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(entry.startTime),
      value: entry.startTime
    };
    return new LCPReport(data);
  }
}
