import { FCPReport } from "@/reports/FCPReport";
import { RumoraException } from "@/errors/RumoraException";
import { isPerformanceObservationSupported, WebVitalObserver } from "./WebVitalObserver";

export class FCP extends WebVitalObserver {
  protected readonly performanceObserverType = "paint";

  protected initialize(): void {
    if (isPerformanceObservationSupported(this.performanceObserverType)) {
      this.handlePerformanceObserver();
    }
    else {
      const error = new RumoraException('FCP is not supported in this browser.');
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
