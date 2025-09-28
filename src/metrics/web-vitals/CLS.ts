import { CLSCollection } from '@/reports/web-vitals/CLSCollection';
import { CLSReport } from '@/reports/web-vitals/CLSReport';
import { generateId } from '@/shared/generateId';
import { PerformanceMetricObserver } from '@/shared/PerformanceMetricObserver';
import type { LayoutShiftEntry } from '@/types/PerformanceEntryTypes';

/**
 * Observer for capturing Cumulative Layout Shift (CLS) metrics using LayoutShiftEntry.
 * CLS measures the sum of all unexpected layout shifts that occur during the lifespan of a page.
 * This metric is crucial for assessing visual stability and user experience.
 * 
 * CLS is calculated as the sum of all individual layout shift scores throughout the page lifecycle.
 * The observer maintains a collection of individual layout shifts and emits updates only when
 * the cumulative score changes significantly to avoid excessive notifications.
 * 
 * Thresholds:
 * - Good: < 0.1
 * - Needs Improvement: 0.1 - 0.25
 * - Poor: >= 0.25
 */
export class CLS extends PerformanceMetricObserver<CLSCollection> {
  private static instance: CLS | null = null;
  private reports: CLSReport[] = [];

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

  public override dispose(): void {
    super.dispose();
    this.reports = [];
  }

  protected override onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as LayoutShiftEntry[];
    const reportsSizeBefore = this.reports.length;
    
    for (const entry of entries) {
      // Skip layout shifts caused by user input (within 500ms)
      if (entry.hadRecentInput) continue;
      
      const report = CLSReport.fromLayoutShiftEntry(generateId(), entry);
      this.reports.push(report);
    }

    // If no new reports were added, do not notify
    if (this.reports.length === reportsSizeBefore) return;

    const clsCollection = CLSCollection.create(generateId(), this.reports);
    this.notifySuccess(clsCollection);
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