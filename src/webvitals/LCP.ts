import { LCPReport } from "@/reports/LCPReport";
import { LCPUnsupportedException } from "@/errors/LCPUnsupportedException";
import { isPerformanceObservationSupported, PerformanceMetricObserver } from "./PerformanceMetricObserver";

export class LCP extends PerformanceMetricObserver {
  private readonly performanceObserverType = "largest-contentful-paint";

  protected initialize(): void {
    if (isPerformanceObservationSupported(this.performanceObserverType)) {
      this.handlePerformanceObserver();
    }
    else {
      const error = new LCPUnsupportedException();
      this.addError(error);
    }
  }

  private handlePerformanceObserver(): void {
    const handle = (entryList: PerformanceObserverEntryList) => {
      const entries = entryList.getEntries();
      if (entries.length <= 0) return;
      entries.forEach((entry) => {
        const report = new LCPReport(entry.startTime);
        this.addReport(report);
      });
    }

    const observer = new PerformanceObserver(handle);
    observer.observe({ type: this.performanceObserverType, buffered: true });
    this.setObserver(observer);
  }
}
