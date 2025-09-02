import { DOMTimingReport } from "@/reports/performance/DOMTimingReport";
import { generateId } from "@/shared/generateId";
import { PerformanceTime } from "@/shared/PerformanceTime";
import { PerformanceMetricObserver } from "@/shared/PerformanceMetricObserver";

export class DOMTiming extends PerformanceMetricObserver<DOMTimingReport> {
  constructor() {
    super("navigation");
  }

  protected onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as PerformanceNavigationTiming[];
    for (const entry of entries) {
      if (entry.loadEventEnd <= 0) continue
      const report = DOMTimingReport.fromPerformanceEntry(
        generateId(),
        PerformanceTime.now(),
        entry
      );
      this.notifySuccess(report);
      this.stop();
      break;
    }
  }
}
