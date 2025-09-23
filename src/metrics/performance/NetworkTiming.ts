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
 constructor() {
   super('navigation');
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
