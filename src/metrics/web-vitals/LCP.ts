import { LCPReport } from "@/reports/web-vitals/LCPReport";
import { generateId } from "@/shared/generateId";
import { PerformanceTime } from "@/shared/PerformanceTime";
import {PerformanceMetricObserver } from "@/shared/PerformanceMetricObserver";

export class LCP extends PerformanceMetricObserver<LCPReport> {
  constructor() {
    super("largest-contentful-paint");
  }

  protected onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries();

    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      const report = new LCPReport({
        id: generateId(),
        createdAt: PerformanceTime.now(),
        occurredAt: PerformanceTime.addTimeOrigin(lastEntry.startTime),
        value: lastEntry.startTime
      });
      this.notifySuccess(report);
    }
  }
}
