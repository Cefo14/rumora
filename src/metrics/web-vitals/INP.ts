import { INPReport } from '@/reports/web-vitals/INPReport';
import { generateId } from '@/shared/generateId';
import { PerformanceMetricObserver } from '@/shared/PerformanceMetricObserver';
import type { PerformanceEventTimingEntry } from '@/types/PerformanceEntryTypes';

/**
 * Observer for capturing Interaction to Next Paint (INP) metrics using PerformanceEventTiming.
 * INP measures the responsiveness of a webpage by tracking the latency of user interactions,
 * providing insights into how quickly the page responds to user inputs.
 */
export class INP extends PerformanceMetricObserver<INPReport> {
  constructor() {
    super(
      'event',
      {
        durationThreshold: 16,
      }
    );
  }

  protected override onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as PerformanceEventTimingEntry[];
    for (const entry of entries) {
      const eventEntry = entry;
      if (!eventEntry.interactionId) continue;
      const report = INPReport.fromPerformanceEventTimingEntry(
        generateId(),
        entry
      );
      this.notifySuccess(report);
    }
  }
}
