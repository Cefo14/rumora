import { LCPCollection } from '@/reports/web-vitals/LCPCollection';
import { LCPReport } from '@/reports/web-vitals/LCPReport';
import { generateId } from '@/shared/generateId';
import { PerformanceMetricObserver } from '@/shared/PerformanceMetricObserver';

/**
 * Observer for capturing Largest Contentful Paint (LCP) metrics using LargestContentfulPaint.
 * LCP measures the time it takes for the largest content element in the viewport to become visible,
 * providing insight into the perceived load speed of a webpage.
 * 
 * LCP is considered finalized after the first user interaction (click, keydown, scroll) and will
 * stop emitting new values once finalized. This follows the Web Vitals specification where LCP
 * should represent the loading performance as perceived by the user before they interact with the page.
 * 
 * Stopping LCP updates after user interaction helps to avoid skewing the metric with
 */
export class LCP extends PerformanceMetricObserver<LCPCollection> {
  private static instance: LCP | null = null;
  private reports: LCPReport[] = [];
  private finalizationListenersAdded = false;
  public isFinalized = false;

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
    this.isFinalized = false;
    this.finalizationListenersAdded = false;
  }

  protected override onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    if (this.isFinalized) return;

    // Setup finalization listeners on first observation
    if (!this.finalizationListenersAdded) {
      this.setupFinalizationListeners();
      this.finalizationListenersAdded = true;
    }

    const entries = entryList.getEntries() as LargestContentfulPaint[];
    const reportsSizeBefore = this.reports.length;
    
    for (const entry of entries) {
      const report = LCPReport.fromLargestContentfulPaint(generateId(), entry);
      this.reports.push(report);
    }

    // If no new reports were added, do not notify
    if (this.reports.length === reportsSizeBefore) return;

    const lcpCollection = LCPCollection.create(generateId(), this.reports);
    this.notifySuccess(lcpCollection);
  }

  /**
   * Sets up event listeners to detect the first user interaction that finalizes LCP.
   * Once any of these interactions occur, LCP will stop updating and emit a final collection.
   */
  private setupFinalizationListeners(): void {
    const finalizationEvents = ['click', 'keydown', 'scroll'] as const;

    const finalizeHandler = () => {
      this.isFinalized = true;
      this.stop();
    };
    
    finalizationEvents.forEach(eventType => {
      document.addEventListener(eventType, finalizeHandler, { 
        once: true, 
        passive: true 
      });
    });
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
