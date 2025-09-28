import { NetworkTimingReport } from '@/reports/performance/NetworkTimingReport';
import { generateId } from '@/shared/generateId';
import { PerformanceMetricObserver } from '@/shared/PerformanceMetricObserver';

/**
 * Observer for capturing network timing metrics using PerformanceNavigationTiming.
 * Focuses on key network events such as DNS lookup, TCP handshake,
 * request/response times, and overall page load duration.
 * 
 * **Single Event**: This observer automatically stops after emitting the first Network timing report.
 * Use dispose() only for cleanup if needed before the event occurs.
 */
export class NetworkTiming extends PerformanceMetricObserver<NetworkTimingReport> {
  private static instance: NetworkTiming | null = null;

  private constructor() {
    super('navigation');
  }

  /**
   * Get the singleton instance of the Network Timing observer.
   * If the instance does not exist, it creates a new one.
   * 
   * **Note:** Use observeNetworkTiming() factory function instead.
   *
   * @returns Singleton instance of the Network Timing observer.
   */
  public static getInstance(): NetworkTiming {
    if (!NetworkTiming.instance) {
      NetworkTiming.instance = new NetworkTiming();
    }
    return NetworkTiming.instance;
  }

  /**
   * Reset the singleton instance of the Network Timing observer.
   * This is useful for testing or re-initialization purposes.
   */
  public static resetInstance(): void {
    NetworkTiming.getInstance()?.dispose();
    NetworkTiming.instance = null;
  }

  protected override onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as PerformanceNavigationTiming[];
    for (const entry of entries) {
      if (entry.responseEnd <= 0) continue;
      const report = NetworkTimingReport.fromPerformanceEntry(
        generateId(),
        entry
      );
      this.notifySuccess(report);
      // Network Timing is a single-event metric - stop observing after first emission
      this.stop();
      break;
    }
  }
}

/**
 * Factory function to get the singleton instance of the Network Timing observer.
 */
export const observeNetworkTiming = () => NetworkTiming.getInstance();

/**
 * Reset the singleton instance of the Network Timing observer.
 * This is useful for testing or re-initialization purposes.
 */
export const resetNetworkTiming = () => NetworkTiming.resetInstance();
