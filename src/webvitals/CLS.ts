import { CLSReport } from "@/reports/CLSReport";
import { CLSUnsupportedException } from "@/errors/CLSUnsupportedException";
import { isPerformanceObservationSupported, PerformanceMetricObserver } from "./PerformanceMetricObserver";

export class CLS extends PerformanceMetricObserver<CLSReport> {
  private readonly performanceObserverType = "layout-shift";
  private cls: number = 0;

  protected initialize(): void {
    if (isPerformanceObservationSupported(this.performanceObserverType)) {
      this.handlePerformanceObserver();
    }
    else {
      const error = new CLSUnsupportedException();
      this.addError(error);
    }
  }

  protected handlePerformanceObserver(): void {
    const handler = (entryList: PerformanceObserverEntryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean, value: number };
        if (layoutShift.hadRecentInput) return;
        this.cls += layoutShift.value;
      });
      const report = new CLSReport(this.cls);
      this.addReport(report);
    }

    const observer = new PerformanceObserver(handler);
    observer.observe({ type: this.performanceObserverType, buffered: true });
    this.setObserver(observer);
  }
}
