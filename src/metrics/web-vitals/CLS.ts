import { CLSReport } from "@/reports/web-vitals/CLSReport";
import { generateId } from "@/shared/generateId";
import { PerformanceTime } from "@/shared/PerformanceTime";
import { PerformanceMetricObserver } from "@/shared/PerformanceMetricObserver";

export class CLS extends PerformanceMetricObserver<CLSReport> {
  private cls = 0;

  constructor() {
    super("layout-shift");
  }

  protected onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries();
    for (const entry of entries) {
      const layoutShift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
      if (layoutShift.hadRecentInput) continue;
      this.cls += layoutShift.value;
      const report = new CLSReport({
        id: generateId(),
        value: this.cls,
        createdAt: PerformanceTime.now(),
          occurredAt: PerformanceTime.addTimeOrigin(entry.startTime)
        });
      this.notifySuccess(report);
    }
  }
}

