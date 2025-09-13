import { LongTaskReport } from '@/reports/performance/LongTaskReport';
import { generateId } from '@/shared/generateId';
import { PerformanceMetricObserver } from '@/shared/PerformanceMetricObserver';
import type { PerformanceLongTaskTimingEntry } from '@/types/PerformanceEntryTypes';

/**
 * Observer for capturing long task performance metrics using PerformanceLongTaskTiming.
 * Long tasks are tasks that block the main thread for 50ms or more,
 * potentially causing poor user experience by delaying user interactions.
 */
export class LongTask extends PerformanceMetricObserver<LongTaskReport> {
  constructor() {
    super('longtask');
  }

  /**
   * Processes performance observer entries for long tasks.
   * 
   * Each entry represents a task that took 50ms or longer to complete.
   * Creates a LongTaskReport for each entry and notifies subscribers.
   * 
   * @param entryList - List of performance entries from the observer
   * @protected
   */
  protected onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as PerformanceLongTaskTimingEntry[];
    for (const entry of entries) {
      if (entry.entryType !== 'longtask') continue;
      const report = LongTaskReport.fromPerformanceLongTaskTimingEntry(
        generateId(),
        entry
      );
      this.notifySuccess(report);
    }
  }
}
