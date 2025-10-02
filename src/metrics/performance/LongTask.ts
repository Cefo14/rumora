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
  private static instance: LongTask | null = null;

  private constructor() {
    super('longtask');
  }

  /**
   * Get the singleton instance of the Long Task observer.
   * If the instance does not exist, it creates a new one.
   * 
   * **Note:** Use observeLongTask() factory function instead.
   *
   * @returns Singleton instance of the Long Task observer.
   */
  public static getInstance(): LongTask {
    if (!LongTask.instance) {
      LongTask.instance = new LongTask();
    }
    return LongTask.instance;
  }

  /**
   * Reset the singleton instance of the Long Task observer.
   * This is useful for testing or re-initialization purposes.
   */
  public static resetInstance(): void {
    LongTask.getInstance()?.dispose();
    LongTask.instance = null;
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
  protected override onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
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

/**
 * Factory function to get the singleton instance of the Long Task observer.
 */
export const observeLongTask = () => LongTask.getInstance();

/**
 * Reset the singleton instance of the Long Task observer.
 * This is useful for testing or re-initialization purposes.
 */
export const resetLongTask = () => LongTask.resetInstance();
