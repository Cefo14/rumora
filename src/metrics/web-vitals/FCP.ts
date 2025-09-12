import { FCPReport } from "@/reports/web-vitals/FCPReport";
import { generateId } from "@/shared/generateId";
import { PerformanceMetricObserver } from "@/shared/PerformanceMetricObserver";

export class FCP extends PerformanceMetricObserver<FCPReport> {
  constructor() {
    super("paint");
  }

  protected onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries();
    for (const entry of entries) {
      const fcpEntry = entry as PerformancePaintTiming;
      if (fcpEntry.name !== 'first-contentful-paint') continue;
      const report = FCPReport.fromPerformancePaintTiming(
        generateId(),
        fcpEntry
      );
      this.notifySuccess(report);
      this.stop();
      break;
    }
  }
}
