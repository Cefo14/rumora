import { WebVitalReport, WebVitalReportDTO } from "@/reports/web-vitals/WebVitalReport";
import { PerformanceTime } from "@/shared/PerformanceTime";

/**
 * First Contentful Paint (FCP) report for measuring loading performance.
 * 
 * FCP measures the time from when the page starts loading to when any part of the page's
 * content is rendered on the screen. This includes text, images, SVG elements, or canvas
 * elements with non-white background colors.
 * 
 * Thresholds:
 * - Good: < 1.8s
 * - Needs Improvement: 1.8s - 3.0s  
 * - Poor: >= 3.0s
 */
export class FCPReport extends WebVitalReport {
  public readonly name = "FIRST_CONTENTFUL_PAINT";
  public readonly goodThreshold = 1800;
  public readonly poorThreshold = 3000;

  private constructor(data: WebVitalReportDTO) {
    super(data);
    Object.freeze(this);
  }

  public static create(data: WebVitalReportDTO): FCPReport {
    return new FCPReport(data);
  }

  public static fromPerformancePaintTiming(id: string, entry: PerformanceEntry): FCPReport {
    const data: WebVitalReportDTO = {
      id,
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(entry.startTime),
      value: entry.startTime,
    };
    return new FCPReport(data);
  }
}
