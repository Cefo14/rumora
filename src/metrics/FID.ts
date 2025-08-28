import { FIDReport } from "@/reports/FIDReport";
import { UnsupportedMetricException } from "@/errors/UnsupportedMetricException";
import { generateId } from "@/shared/generateId";
import { PerformanceTime } from "@/shared/PerformanceTime";

import { isPerformanceObservationSupported, PerformanceMetricObserver } from "./PerformanceMetricObserver";

export class FID extends PerformanceMetricObserver<FIDReport> {
  private readonly performanceObserverType = "first-input";

  protected initialize(): void {
    if (isPerformanceObservationSupported(this.performanceObserverType)) {
      this.handlePerformanceObserver();
    }
    else {
      const error = new UnsupportedMetricException("FID");
      this.emitError(error);
    }
  }

  private handlePerformanceObserver(): void {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries() as PerformanceEventTiming[];
      
      for (const entry of entries) {
        const report = new FIDReport({
          id: generateId(),
          createdAt: PerformanceTime.now(),
          timestamp: PerformanceTime.addTimeOrigin(entry.startTime),
          value: entry.startTime
        });
        this.emitReport(report);
        observer.disconnect();
        break;
      }
    });
    
    this.setObserver(observer);
    observer.observe({ type: 'first-input', buffered: true });
  }
}
