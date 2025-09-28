import { LCPReport } from '@/reports/web-vitals/LCPReport';
import { generateId } from '@/shared/generateId';
import {PerformanceMetricObserver } from '@/shared/PerformanceMetricObserver';

/**
 * Observer for capturing Largest Contentful Paint (LCP) metrics using LargestContentfulPaint.
 * LCP measures the time it takes for the largest content element in the viewport to become visible,
 * providing insight into the perceived load speed of a webpage.
 */
export class LCP extends PerformanceMetricObserver<LCPReport> {
  private static instance: LCP | null = null;

  private constructor() {
    super('largest-contentful-paint');
  }

  /**
   * Get the singleton instance of the LCP observer.
   * If the instance does not exist, it creates a new one.
   * 
   * **Note:** Use observeLCP() factory function instead.
   *
   * @returns Singleton instance of the LCP observer.
   */
  public static getInstance(): LCP {
    if (!LCP.instance) {
      LCP.instance = new LCP();
    }
    return LCP.instance;
  }

  /**
   * Reset the singleton instance of the LCP observer.
   * This is useful for testing or re-initialization purposes.
   */
  public static resetInstance(): void {
    LCP.getInstance()?.dispose();
    LCP.instance = null;
  }

  protected override onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as LargestContentfulPaint[];

    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      const report = LCPReport.fromLargestContentfulPaint(generateId(), lastEntry);
      this.notifySuccess(report);
    }
  }
}

/**
 * Get the singleton instance of the LCP observer.
 * @returns Singleton instance of the LCP observer.
 */
export const observeLCP = () => LCP.getInstance();

/**
 * Reset the singleton instance of the LCP observer.
 * This is useful for testing or re-initialization purposes.
 */
export const resetLCP = () => LCP.resetInstance();
