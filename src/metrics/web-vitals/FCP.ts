import { FCPReport } from "@/reports/web-vitals/FCPReport";
import { generateId } from "@/shared/generateId";
import { PerformanceTime } from "@/shared/PerformanceTime";
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
      const report = new FCPReport({
        id: generateId(),
        createdAt: PerformanceTime.now(),
        occurredAt: PerformanceTime.toAbsoluteTime(fcpEntry.startTime),
        value: fcpEntry.startTime
      });
      this.notifySuccess(report);
      this.stop();
      break;
    }
  }
}
