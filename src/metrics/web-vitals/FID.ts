import { FIDReport } from '@/reports/web-vitals/FIDReport';
import { generateId } from '@/shared/generateId';
import { PerformanceMetricObserver } from '@/shared/PerformanceMetricObserver';

/**
 * Observer for capturing First Input Delay (FID) metrics using PerformanceEventTiming.
 * FID measures the time from when a user first interacts with a page
 * (e.g., clicks a link, taps a button) to the time when the browser is able to respond
 * to that interaction, providing insight into the responsiveness of a webpage.
 */
export class FID extends PerformanceMetricObserver<FIDReport> {
  constructor() {
    super('first-input');
  }

  protected onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as PerformanceEventTiming[];
    for (const entry of entries) {
      const report = FIDReport.fromPerformanceEventTiming(
        generateId(),
        entry
      );
      this.notifySuccess(report);
      this.stop();
      break;
    }
  }
}
