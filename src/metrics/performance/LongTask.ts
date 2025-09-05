import { LongTaskReport } from "@/reports/performance/LongTaskReport";
import { generateId } from "@/shared/generateId";
import { PerformanceMetricObserver } from "@/shared/PerformanceMetricObserver";
import { PerformanceLongTaskTimingEntry } from "@/shared/PerformanceEntryTypes";

/**
 * Observer for Long Tasks API performance entries.|
 * 
 * The Long Tasks API only reports tasks that exceed 50ms duration, as these
 * are considered the threshold where users begin to perceive delays in
 * interface responsiveness.
 * 
 * @example
 * ```typescript
 * const longTask = new LongTask();
 * 
 * longTask.subscribe((error, report) => {
 *   if (error) {
 *     console.error('Long Tasks not supported:', error.message);
 *     return;
 *   }
 *   console.log('Long task detected:', report);
 * });
 * ```
 */
export class LongTask extends PerformanceMetricObserver<LongTaskReport> {
  constructor() {
    super("longtask");
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
      )
      this.notifySuccess(report);
    }
  }
}
