import { DOMTimingReport } from "@/reports/performance/DOMTimingReport";
import { UnsupportedMetricException } from "@/errors/UnsupportedMetricException";
import { generateId } from "@/shared/generateId";
import { PerformanceTime } from "@/shared/PerformanceTime";

import { isPerformanceObservationSupported, PerformanceMetricObserver } from "@/shared/PerformanceMetricObserver";


export class DOMTiming extends PerformanceMetricObserver<DOMTimingReport> {
  protected readonly performanceObserverType = "navigation";

  protected initialize(): void {
    if (isPerformanceObservationSupported(this.performanceObserverType)) {
      this.handlePerformanceObserver();
    } else {
      const error = new UnsupportedMetricException("DOM Timing");
      this.emitError(error);
    }
  }

  protected handlePerformanceObserver(): void {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      
      for (const entry of entries) {
        const navEntry = entry as PerformanceNavigationTiming;
        
        if (navEntry.loadEventEnd > 0) {
          this.notifyReport(navEntry);
          observer.disconnect();
          break;
        }
      }
    });

    this.setObserver(observer);
    observer.observe({ type: this.performanceObserverType, buffered: true });
  }

  private notifyReport(entry: PerformanceNavigationTiming): void {
    const interactiveTime = entry.domInteractive - entry.startTime;
    const processingTime = entry.domComplete - entry.domInteractive;
    const contentLoadedDuration = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
    const loadEventDuration = entry.loadEventEnd - entry.loadEventStart;

    const report = new DOMTimingReport({
      id: generateId(),
      createdAt: PerformanceTime.now(),
      interactiveTime,
      processingTime,
      contentLoadedDuration,
      loadEventDuration,
    });

    this.emitReport(report);
  }
}