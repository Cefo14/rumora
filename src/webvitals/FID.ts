import { FIDReport } from "@/reports/FIDReport";
import { UnsupportedMetricException } from "@/errors/UnsupportedMetricException";
import { isPerformanceObservationSupported, PerformanceMetricObserver } from "./PerformanceMetricObserver";

export class FID extends PerformanceMetricObserver<FIDReport> {
  private readonly performanceObserverType = "first-input";

  protected initialize(): void {
    if (isPerformanceObservationSupported(this.performanceObserverType)) {
      this.handlePerformanceObserver();
    }
    else {
      const error = new UnsupportedMetricException("FID");
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
