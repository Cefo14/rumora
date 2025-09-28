import { FCPReport } from '@/reports/web-vitals/FCPReport';
import { generateId } from '@/shared/generateId';
import { PerformanceMetricObserver } from '@/shared/PerformanceMetricObserver';

/**
 * Observer for capturing First Contentful Paint (FCP) metrics using PerformancePaintTiming.
 * FCP marks the time when the first text or image is painted on the screen,
 * providing insight into the perceived load speed of a webpage.
 * 
 * **Single Event**: This observer automatically stops after emitting the first FCP report.
 * Use dispose() only for cleanup if needed before the event occurs.
 */
export class FCP extends PerformanceMetricObserver<FCPReport> {
  private static instance: FCP | null = null;

  private constructor() {
    super('paint');
  }

  /**
   * Get the singleton instance of the FCP observer.
   * If the instance does not exist, it creates a new one.
   * 
   * **Note:** Use observeFCP() factory function instead.
   * 
   * @returns Singleton instance of the FCP observer.
   */
  public static getInstance(): FCP {
    if (!FCP.instance) {
      FCP.instance = new FCP();
    }
    return FCP.instance;
  }

  /**
   * Reset the singleton instance of the FCP observer.
   * This is useful for testing or re-initialization purposes.
   */
  public static resetInstance(): void {
    FCP.getInstance()?.dispose();
    FCP.instance = null;
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
      // FCP is a single-event metric - stop observing after first emission
      this.stop();
      break;
    }
  }
}

/**
 * Factory function to get the singleton instance of the FCP observer.
 * @returns Singleton instance of the FCP observer.
 */
export const observeFCP = () => FCP.getInstance();

/** 
 * Reset the singleton instance of the FCP observer.
 * This is useful for testing or re-initialization purposes.
 */
export const resetFCP = () => FCP.resetInstance();
