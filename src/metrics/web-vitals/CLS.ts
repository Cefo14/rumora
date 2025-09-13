import { CLSReport } from "@/reports/web-vitals/CLSReport";
import { generateId } from "@/shared/generateId";
import { PerformanceMetricObserver } from "@/shared/PerformanceMetricObserver";
import { LayoutShiftEntry } from "@/types/PerformanceEntryTypes";

/**
 * Observer for capturing Cumulative Layout Shift (CLS) metrics using LayoutShiftEntry.
 * CLS measures the sum of all unexpected layout shifts that occur during the lifespan of a page.
 * This metric is crucial for assessing visual stability and user experience.
 */
export class CLS extends PerformanceMetricObserver<CLSReport> {
  private cls = 0;

  constructor() {
    super("layout-shift");
  }

  protected onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as LayoutShiftEntry[];
    for (const entry of entries) {
      if (entry.hadRecentInput) continue;
      this.cls += entry.value;
      const report = CLSReport.fromLayoutShiftEntry(generateId(), entry);
      const data = report;
      this.notifySuccess(data);
    }
  }
}
