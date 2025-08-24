import { LCPReport } from "@/reports/LCPReport";
import { RumoraException } from "@/errors/RumoraException";
import { isPerformanceObservationSupported, WebVitalObserver } from "./WebVitalObserver";

export class LCP extends WebVitalObserver {
  private readonly performanceObserverType = "largest-contentful-paint";

  protected initialize(): void {
    if (isPerformanceObservationSupported(this.performanceObserverType)) {
      this.handlePerformanceObserver();
    }
    else {
      const error = new RumoraException('LCP is not supported in this browser.');
      this.addError(error);
    }
  }

  private handlePerformanceObserver(): void {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();

      if (entries.length <= 0) return;

      entries.forEach((entry) => {
        const report = new LCPReport(entry.startTime);
        this.addReport(report);
      });
    });

    observer.observe({ type: this.performanceObserverType, buffered: true });
    this.setObserver(observer);
  }
}
