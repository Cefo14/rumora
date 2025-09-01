import { DOMTimingReport } from "@/reports/performance/DOMTimingReport";
import { generateId } from "@/shared/generateId";
import { PerformanceTime } from "@/shared/PerformanceTime";

import { PerformanceMetricObserver } from "@/shared/PerformanceMetricObserver";


export class DOMTiming extends PerformanceMetricObserver<DOMTimingReport> {
  constructor() {
    super("navigation");
  }

  protected onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries();
    for (const entry of entries) {
      const navEntry = entry as PerformanceNavigationTiming;
      if (navEntry.loadEventEnd <= 0) continue
      const report = DOMTimingReport.fromPerformanceNavigationTiming(
        generateId(),
        PerformanceTime.now(),
        navEntry
      );
      this.notifySuccess(report);
      this.stop();
      break;
    }
  }
}
