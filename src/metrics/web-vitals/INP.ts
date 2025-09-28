import { INPCollection } from '@/reports/web-vitals/INPCollection';
import { INPReport } from '@/reports/web-vitals/INPReport';
import { generateId } from '@/shared/generateId';
import { PerformanceMetricObserver } from '@/shared/PerformanceMetricObserver';
import type { PerformanceEventTimingEntry } from '@/types/PerformanceEntryTypes';

/**
 * Observer for capturing Interaction to Next Paint (INP) metrics using PerformanceEventTiming.
 * INP measures the responsiveness of a webpage by tracking the latency of user interactions,
 * providing insights into how quickly the page responds to user inputs.
 * 
 * INP is calculated as the 98th percentile of all interaction latencies over the entire lifespan of a page.
 * This means that it considers the latency of nearly all interactions, ensuring that occasional slow interactions do not skew the metric.
 * The goal is to keep the INP value low, indicating that the page is responsive and provides a good user experience.
 */
export class INP extends PerformanceMetricObserver<INPCollection> {
  private static instance: INP | null = null;
  private reports: INPReport[] = [];
  private lastPercentile98: number | null = null;

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

  public override dispose(): void {
    super.dispose();
    this.reports = [];
    this.lastPercentile98 = null;
  }

  protected override onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as PerformanceEventTimingEntry[];
    const reportsSizeBefore = this.reports.length;
    
    for (const entry of entries) {
      if (!entry.interactionId) continue;
      const report = INPReport.fromPerformanceEventTimingEntry(
        generateId(),
        entry
      );
      this.reports.push(report);
    }

    // If no new reports were added, or if the 98th percentile hasn't changed, do not notify
    if (this.reports.length === reportsSizeBefore) return;

    // If the 98th percentile hasn't changed, do not notify
    const currentPercentile98 = this.calculatePercentile98Value();
    if (currentPercentile98 === this.lastPercentile98) return;

    const inpCollection = INPCollection.create(generateId(), this.reports);
    this.lastPercentile98 = currentPercentile98;
    this.notifySuccess(inpCollection);
  }

  private calculatePercentile98Value(): number | null {
    if (this.reports.length === 0) return null;
    
    const sorted = [...this.reports].sort((a, b) => a.value - b.value);
    const index = Math.floor(sorted.length * 0.98);
    const percentile98Report = sorted[index] || sorted[sorted.length - 1];
    return percentile98Report.value;
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
