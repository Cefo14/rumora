import { LCPCollection } from '@/reports/web-vitals/LCPCollection';
import { LCPReport } from '@/reports/web-vitals/LCPReport';
import { generateId } from '@/shared/generateId';
import {PerformanceMetricObserver } from '@/shared/PerformanceMetricObserver';

/**
 * Observer for capturing Largest Contentful Paint (LCP) metrics using LargestContentfulPaint.
 * LCP measures the time it takes for the largest content element in the viewport to become visible,
 * providing insight into the perceived load speed of a webpage.
 */
export class LCP extends PerformanceMetricObserver<LCPCollection> {
  private static instance: LCP | null = null;
  private reports: LCPReport[] = [];

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

  public override dispose(): void {
    super.dispose();
    this.reports = [];
  }

  protected override onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as LargestContentfulPaint[];
    for (const entry of entries) {
      const report = LCPReport.fromLargestContentfulPaint(
        generateId(),
        entry
      );
      this.reports.push(report);
    }

    const lcpCollection = LCPCollection.create(
      generateId(),
      this.reports
    );
    this.notifySuccess(lcpCollection);
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
