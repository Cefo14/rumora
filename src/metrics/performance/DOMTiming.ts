import { DOMTimingReport } from '@/reports/performance/DOMTimingReport';
import { generateId } from '@/shared/generateId';
import { PerformanceMetricObserver } from '@/shared/PerformanceMetricObserver';

/**
 * Observer for capturing DOM timing metrics using PerformanceNavigationTiming.
 * Focuses on key DOM events such as DOMContentLoaded and load event timings,
 * which are critical for understanding page interactivity and usability.
 * 
 * **Single Event**: This observer automatically stops after emitting the first DOM timing report.
 * Use dispose() only for cleanup if needed before the event occurs.
 */
export class DOMTiming extends PerformanceMetricObserver<DOMTimingReport> {
  private static instance: DOMTiming | null = null;

  private constructor() {
    super('navigation');
  }

  /**
   * Get the singleton instance of the DOM Timing observer.
   * If the instance does not exist, it creates a new one.
   * 
   * **Note:** Use observeDOMTiming() factory function instead.
   *
   * @returns Singleton instance of the DOM Timing observer.
   */
  public static getInstance(): DOMTiming {
    if (!DOMTiming.instance) {
      DOMTiming.instance = new DOMTiming();
    }
    return DOMTiming.instance;
  }

  /**
   * Reset the singleton instance of the DOM Timing observer.
   * This is useful for testing or re-initialization purposes.
   */
  public static resetInstance(): void {
    DOMTiming.getInstance()?.dispose();
    DOMTiming.instance = null;
  }

  protected override onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as PerformanceNavigationTiming[];
    for (const entry of entries) {
      if (entry.loadEventEnd <= 0) continue;
      const report = DOMTimingReport.fromPerformanceEntry(
        generateId(),
        entry
      );
      this.notifySuccess(report);
      // DOM Timing is a single-event metric - stop observing after first emission
      this.stop();
      break;
    }
  }
}

/**
 * Factory function to get the singleton instance of the DOM Timing observer.
 */
export const observeDOMTiming = () => DOMTiming.getInstance();

/**
 * Reset the singleton instance of the DOM Timing observer.
 * This is useful for testing or re-initialization purposes.
 */
export const resetDOMTiming = () => DOMTiming.resetInstance();
