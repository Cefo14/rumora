import type { WebVitalReportDTO } from '@/reports/web-vitals/WebVitalReport';
import { WebVitalReport } from '@/reports/web-vitals/WebVitalReport';
import { PerformanceTime } from '@/value-objects/PerformanceTime';

export interface LCPReportData extends WebVitalReportDTO {
  element: Element | null;
}

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
  public readonly name = 'LARGEST_CONTENTFUL_PAINT';
  public readonly goodThreshold = 2500;
  public readonly poorThreshold = 4000;

  public readonly element: Element | null;

  private constructor(data: LCPReportData) {
    super(data);
    this.element = data.element;
    Object.freeze(this);
  }

  public static create(data: LCPReportData): LCPReport {
    return new LCPReport(data);
  }

  public static fromLargestContentfulPaint(id: string, entry: LargestContentfulPaint): LCPReport {
    const data: LCPReportData = {
      id,
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(entry.startTime),
      value: entry.startTime,
      element: entry.element,
    };
    return new LCPReport(data);
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      /**
       * The largest contentful element that was painted, if available
       * This is the actual DOM element that triggered the LCP measurement
       * @type {Element | null}
       */
      element: this.element,
    };
  }
}
