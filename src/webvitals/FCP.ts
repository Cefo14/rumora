import { FCPReport } from "@/reports/FCPReport";
import { UnsupportedMetricException } from "@/errors/UnsupportedMetricException";
import { isPerformanceObservationSupported, PerformanceMetricObserver } from "./PerformanceMetricObserver";

export class FCP extends PerformanceMetricObserver<FCPReport> {
  private readonly performanceObserverType = "paint";

  protected initialize(): void {
    if (isPerformanceObservationSupported(this.performanceObserverType)) {
      this.handlePerformanceObserver();
    }
    else {
      const error = new UnsupportedMetricException("FCP");
      this.addError(error);
    }
  }

  protected handlePerformanceObserver(): void {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList
        .getEntries()
        .filter((entry) => (
          entry.name === 'first-contentful-paint'
        ));

      if (entries.length === 0) return;

      entries.forEach((entry) => {
        const value = entry.startTime;
        const report = new FCPReport(value);
        this.addReport(report);
      });
  
      observer.disconnect(); // Safely disconnect the observer
    });

    observer.observe({ type: this.performanceObserverType, buffered: true });
    this.setObserver(observer);
  }
}
