import { LCPReport } from "@/reports/web-vitals/LCPReport";
import { generateId } from "@/shared/generateId";
import {PerformanceMetricObserver } from "@/shared/PerformanceMetricObserver";

export class LCP extends PerformanceMetricObserver<LCPReport> {
  constructor() {
    super("largest-contentful-paint");
  }

  protected onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as LargestContentfulPaint[];

    if (entries.length > 0) {
      const lastEntry = entries[entries.length - 1];
      const report = LCPReport.fromLargestContentfulPaint(generateId(), lastEntry);
      this.notifySuccess(report);
    }
  }
}
