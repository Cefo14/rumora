import { LCPReport } from '@/reports/web-vitals/LCPReport';
import { generateId } from '@/shared/generateId';
import {PerformanceMetricObserver } from '@/shared/PerformanceMetricObserver';

/**
 * Observer for capturing Largest Contentful Paint (LCP) metrics using LargestContentfulPaint.
 * LCP measures the time it takes for the largest content element in the viewport to become visible,
 * providing insight into the perceived load speed of a webpage.
 */
export class LCP extends PerformanceMetricObserver<LCPReport> {
  constructor() {
    super('largest-contentful-paint');
  }

  protected onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as LargestContentfulPaint[];

    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      const report = LCPReport.fromLargestContentfulPaint(generateId(), lastEntry);
      this.notifySuccess(report);
    }
  }
}
