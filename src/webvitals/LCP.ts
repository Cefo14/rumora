import { LCPReport } from "@/reports/LCPReport";
import { UnsupportedMetricException } from "@/errors/UnsupportedMetricException";
import { generateId } from "@/shared/generateId";
import { isPerformanceObservationSupported, PerformanceMetricObserver } from "./PerformanceMetricObserver";

export class LCP extends PerformanceMetricObserver<LCPReport> {
  private readonly performanceObserverType = "largest-contentful-paint";

  protected initialize(): void {
    if (isPerformanceObservationSupported(this.performanceObserverType)) {
      this.handlePerformanceObserver();
    }
    else {
      const error = new UnsupportedMetricException("LCP");
      this.addError(error);
    }
  }

  private handlePerformanceObserver(): void {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      
      if (entries.length > 0) {
        const lastEntry = entries[entries.length - 1];
        const report = new LCPReport({
          id: generateId(),
          startTime: lastEntry.startTime,
          value: lastEntry.startTime
        });
        this.addReport(report);
      }
    });
    
    this.setObserver(observer);
    observer.observe({ type: this.performanceObserverType, buffered: true });
  }
}
