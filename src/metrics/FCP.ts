import { FCPReport } from "@/reports/FCPReport";
import { UnsupportedMetricException } from "@/errors/UnsupportedMetricException";
import { generateId } from "@/shared/generateId";
import { PerformanceTime } from "@/shared/PerformanceTime";

import { isPerformanceObservationSupported, PerformanceMetricObserver } from "./PerformanceMetricObserver";

export class FCP extends PerformanceMetricObserver<FCPReport> {
  private readonly performanceObserverType = "paint";

  protected initialize(): void {
    if (isPerformanceObservationSupported(this.performanceObserverType)) {
      this.handlePerformanceObserver();
    }
    else {
      const error = new UnsupportedMetricException("FCP");
      this.emitError(error);
    }
  }

  private handlePerformanceObserver(): void {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      
      for (const entry of entries) {
        if (entry.name === 'first-contentful-paint') {
          const report = new FCPReport({
            id: generateId(),
            createdAt: PerformanceTime.now(),
            timestamp: PerformanceTime.addTimeOrigin(entry.startTime),
            value: entry.startTime
          });
          this.emitReport(report);
          observer.disconnect();
          break;
        }
      }
    });
    
    this.setObserver(observer);
    observer.observe({ type: 'paint', buffered: true });
  }
}
