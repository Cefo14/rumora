import { FCPReport } from '@/reports/web-vitals/FCPReport';
import { generateId } from '@/shared/generateId';
import { PerformanceMetricObserver } from '@/shared/PerformanceMetricObserver';

/**
 * Observer for capturing First Contentful Paint (FCP) metrics using PerformancePaintTiming.
 * FCP marks the time when the first text or image is painted on the screen,
 * providing insight into the perceived load speed of a webpage.
 */
export class FCP extends PerformanceMetricObserver<FCPReport> {
  constructor() {
    super('paint');
  }

  protected override onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries();
    for (const entry of entries) {
      const fcpEntry = entry as PerformancePaintTiming;
      if (fcpEntry.name !== 'first-contentful-paint') continue;
      const report = FCPReport.fromPerformancePaintTiming(
        generateId(),
        fcpEntry
      );
      this.notifySuccess(report);
      this.stop();
      break;
    }
  }
}
