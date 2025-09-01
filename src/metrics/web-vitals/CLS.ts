import { CLSReport } from "@/reports/web-vitals/CLSReport";
import { generateId } from "@/shared/generateId";
import { PerformanceTime } from "@/shared/PerformanceTime";
import { PerformanceMetricObserver } from "@/shared/PerformanceMetricObserver";

interface LayoutShiftAttributionEntry {
  currentRect: DOMRectReadOnly;
  previousRect: DOMRectReadOnly;
  node: HTMLElement;
}

interface LayoutShiftEntry extends PerformanceEntry {
  duration: number;
  entryType: "layout-shift";
  hadRecentInput: boolean;
  lastInputTime: number;
  name: string;
  sources: LayoutShiftAttributionEntry[];
  startTime: number;
  value: number;
}

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
