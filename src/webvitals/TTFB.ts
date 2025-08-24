import { TTFBReport } from "@/reports/TTFBReport";
import { RumoraException } from "@/errors/RumoraException";
import { isPerformanceObservationSupported, WebVitalObserver } from "./WebVitalObserver";

export class TTFB extends WebVitalObserver {
  private readonly performanceObserverType = "navigation";

  protected initialize(): void {
    if (isPerformanceObservationSupported(this.performanceObserverType)) {
      this.handlePerformanceObserver();
    }
    else {
      const error = new RumoraException('TTFB is not supported in this browser.');
      this.addError(error);
    }
  }

  private handlePerformanceObserver(): void {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length <= 0) return;
      entries.forEach((entry) => {
        const lastEntry = entry as PerformanceNavigationTiming;
        const value = lastEntry.responseStart - lastEntry.requestStart;
        const report = new TTFBReport(value);
        this.addReport(report);
      });
      observer.disconnect(); // Safely disconnect the observer
    });

    observer.observe({ type: this.performanceObserverType, buffered: true });
    this.setObserver(observer);
  }
}
