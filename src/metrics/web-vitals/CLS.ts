import { CLSReport } from '@/reports/web-vitals/CLSReport';
import { generateId } from '@/shared/generateId';
import { PerformanceMetricObserver } from '@/shared/PerformanceMetricObserver';
import type { LayoutShiftEntry } from '@/types/PerformanceEntryTypes';

/**
 * Observer for capturing Cumulative Layout Shift (CLS) metrics using LayoutShiftEntry.
 * CLS measures the sum of all unexpected layout shifts that occur during the lifespan of a page.
 * This metric is crucial for assessing visual stability and user experience.
 */
export class CLS extends PerformanceMetricObserver<CLSReport> {
  private static instance: CLS | null = null;
  private cls = 0;

  private constructor() {
    super('layout-shift');
  }

  /**
   * Get the singleton instance of the CLS observer.
   * If the instance does not exist, it creates a new one.
   * 
   * **Note:** Use observeCLS() factory function instead.
   *
   * @returns Singleton instance of the CLS observer.
   */
  public static getInstance(): CLS {
    if (!CLS.instance) {
      CLS.instance = new CLS();
    }
    return CLS.instance;
  }

  /**
   * Reset the singleton instance of the CLS observer.
   * This is useful for testing or re-initialization purposes.
   */
  public static resetInstance(): void {
    CLS.getInstance()?.dispose();
    CLS.instance = null;
  }

  protected override onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as LayoutShiftEntry[];
    for (const entry of entries) {
      if (entry.hadRecentInput) continue;
      this.cls += entry.value;
      const report = CLSReport.fromLayoutShiftEntry(generateId(), entry);
      const data = report;
      this.notifySuccess(data);
    }
  }
}

/**
 * Factory function to get the singleton instance of the CLS observer.
 */
export const observeCLS = () => CLS.getInstance();

/**
 * Reset the singleton instance of the CLS observer.
 * This is useful for testing or re-initialization purposes.
 */
export const resetCLS = () => CLS.resetInstance();
