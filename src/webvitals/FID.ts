import { FIDReport } from "@/reports/FIDReport";
import { FIDUnsupportedException } from "@/errors/FIDUnsupportedException";
import { isPerformanceObservationSupported, WebVitalObserver } from "./WebVitalObserver";

export class FID extends WebVitalObserver {
  private readonly performanceObserverType = "first-input";

  protected initialize(): void {
    if (isPerformanceObservationSupported(this.performanceObserverType)) {
      this.handlePerformanceObserver();
    }
    else {
      const error = new FIDUnsupportedException();
      this.addError(error);
    }
  }

  protected handlePerformanceObserver(): void {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();

      if (entries.length === 0) return;

      entries.forEach((entry) => {
        const fidValue = entry.startTime;
        const report = new FIDReport(fidValue);
        this.addReport(report);
      });
      observer.disconnect(); // Safely disconnect the observer
    });

    observer.observe({ type: this.performanceObserverType, buffered: true });
    this.setObserver(observer);
  }
}
