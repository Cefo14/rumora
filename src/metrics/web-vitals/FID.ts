import { FIDReport } from "@/reports/web-vitals/FIDReport";
import { generateId } from "@/shared/generateId";
import { PerformanceMetricObserver } from "@/shared/PerformanceMetricObserver";

export class FID extends PerformanceMetricObserver<FIDReport> {
  constructor() {
    super("first-input");
  }

  protected onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as PerformanceEventTiming[];
    for (const entry of entries) {
      const report = FIDReport.fromPerformanceEventTiming(
        generateId(),
        entry
      );
      this.notifySuccess(report);
      this.stop();
      break;
    }
  }
}
