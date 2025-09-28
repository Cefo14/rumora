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
  private static instance: INP | null = null;

  private constructor() {
    super(
      'event',
      {
        durationThreshold: 16,
      }
    );
  }

  /**
   * Get the singleton instance of the INP observer.
   * If the instance does not exist, it creates a new one.
   * 
   * **Note:** Use observeINP() factory function instead.
   *
   * @returns Singleton instance of the INP observer.
   */
  public static getInstance(): INP {
    if (!INP.instance) {
      INP.instance = new INP();
    }
    return INP.instance;
  }

  /**
   * Reset the singleton instance of the INP observer.
   * This is useful for testing or re-initialization purposes.
   */
  public static resetInstance(): void {
    INP.getInstance()?.dispose();
    INP.instance = null;
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

/**
 * Get the singleton instance of the INP observer.
 * @returns Singleton instance of the INP observer.
 */
export const observeINP = () => INP.getInstance();

/**
 * Reset the singleton instance of the INP observer.
 * This is useful for testing or re-initialization purposes.
 */
export const resetINP = () => INP.resetInstance();
