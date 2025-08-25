import { CLSReport } from "@/reports/CLSReport";
import { CLSUnsupportedException } from "@/errors/CLSUnsupportedException";
import { isPerformanceObservationSupported, WebVitalObserver } from "./WebVitalObserver";

export class CLS extends WebVitalObserver {
  protected readonly performanceObserverType = "layout-shift";

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
    let cls = 0;
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean, value: number };
        if (layoutShift.hadRecentInput) return;
        cls += layoutShift.value;
      });
      const report = new CLSReport(cls);
      this.addReport(report);
    });
    observer.observe({ type: 'layout-shift', buffered: true });
    this.setObserver(observer);
  }
}

