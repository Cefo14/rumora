import { CLSReport } from "@/reports/web-vitals/CLSReport";
import { generateId } from "@/shared/generateId";
import { PerformanceMetricObserver } from "@/shared/PerformanceMetricObserver";
import { LayoutShiftEntry } from "@/shared/PerformanceEntryTypes";
import { Serialized } from "@/shared/Serialized";

export class CLS extends PerformanceMetricObserver<Serialized<CLSReport>> {
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
      const data = report.toJSON();
      this.notifySuccess(data);
    }
  }
}
