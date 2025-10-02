import { FIDReport } from '@/reports/web-vitals/FIDReport';
import { generateId } from '@/shared/generateId';
import { PerformanceMetricObserver } from '@/shared/PerformanceMetricObserver';

/**
 * Observer for capturing First Input Delay (FID) metrics using PerformanceEventTiming.
 * FID measures the time from when a user first interacts with a page
 * (e.g., clicks a link, taps a button) to the time when the browser is able to respond
 * to that interaction, providing insight into the responsiveness of a webpage.
 * 
 * **Single Event**: This observer automatically stops after emitting the first FID report.
 * Use dispose() only for cleanup if needed before the event occurs.
 */
export class FID extends PerformanceMetricObserver<FIDReport> {
  private static instance: FID | null = null;

  private constructor() {
    super('first-input');
  }

  /**
   * Get the singleton instance of the FID observer.
   * If the instance does not exist, it creates a new one.
   * 
   * **Note:** Use observeFID() factory function instead.
   *
   * @returns Singleton instance of the FID observer.
   */
  public static getInstance(): FID {
    if (!FID.instance) {
      FID.instance = new FID();
    }
    return FID.instance;
  }

  /**
   * Reset the singleton instance of the FID observer.
   * This is useful for testing or re-initialization purposes.
   */
  public static resetInstance(): void {
    FID.getInstance()?.dispose();
    FID.instance = null;
  }

  protected override onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as PerformanceEventTiming[];
    for (const entry of entries) {
      const report = FIDReport.fromPerformanceEventTiming(
        generateId(),
        entry
      );
      this.notifySuccess(report);
      // FID is a single-event metric - stop observing after first emission
      this.stop();
      break;
    }
  }
}

/**
 * Get the singleton instance of the FID observer.
 * @returns Singleton instance of the FID observer.
 */
export const observeFID = () => FID.getInstance();

/**
 * Reset the singleton instance of the FID observer.
 * This is useful for testing or re-initialization purposes.
 */
export const resetFID = () => FID.resetInstance();
