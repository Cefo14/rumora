import { NetworkTimingReport } from "@/reports/performance/NetworkTimingReport";
import { generateId } from "@/shared/generateId";

import { PerformanceMetricObserver } from "@/shared/PerformanceMetricObserver";
import { PerformanceTimestamp } from "@/shared/PerformanceTimestamp";

export class NetworkTiming extends PerformanceMetricObserver<NetworkTimingReport> {
 constructor() {
   super("navigation");
 }

  protected onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as PerformanceNavigationTiming[];
    for (const entry of entries) {
      if (entry.responseEnd <= 0) continue;
      const report = NetworkTimingReport.fromPerformanceEntry(
        generateId(),
        PerformanceTimestamp.now(),
        entry
      );
      this.notifySuccess(report);
      this.stop();
      break;
    }
  }
}
