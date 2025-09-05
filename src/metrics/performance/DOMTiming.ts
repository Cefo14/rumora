import { DOMTimingReport } from "@/reports/performance/DOMTimingReport";
import { generateId } from "@/shared/generateId";
import { PerformanceMetricObserver } from "@/shared/PerformanceMetricObserver";
import { PerformanceTimestamp } from "@/shared/PerformanceTimestamp";

export class DOMTiming extends PerformanceMetricObserver<DOMTimingReport> {
  constructor() {
    super("navigation");
  }

  protected onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as PerformanceNavigationTiming[];
    for (const entry of entries) {
      if (entry.loadEventEnd <= 0) continue;
      const report = DOMTimingReport.fromPerformanceEntry(
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
