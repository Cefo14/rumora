import { NetworkTimingReport } from "@/reports/performance/NetworkTimingReport";
import { generateId } from "@/shared/generateId";
import { PerformanceMetricObserver } from "@/shared/PerformanceMetricObserver";

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
        entry
      );
      this.notifySuccess(report);
      this.stop();
      break;
    }
  }
}
