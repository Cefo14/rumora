import { DOMTimingReport } from "@/reports/DOMTimingReport";
import { UnsupportedMetricException } from "@/errors/UnsupportedMetricException";
import { generateId } from "@/shared/generateId";
import { isPerformanceObservationSupported, PerformanceMetricObserver } from "./PerformanceMetricObserver";


export class DOMTiming extends PerformanceMetricObserver<DOMTimingReport> {
  protected readonly performanceObserverType = "navigation";

  protected initialize(): void {
    if (isPerformanceObservationSupported(this.performanceObserverType)) {
      this.handlePerformanceObserver();
    } else {
      const error = new UnsupportedMetricException("DOM Timing");
      this.addError(error);
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
    const domInteractiveTime = entry.domInteractive - entry.startTime;
    const domProcessingTime = entry.domComplete - entry.domInteractive;
    const domContentLoadedDuration = entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart;
    const loadEventDuration = entry.loadEventEnd - entry.loadEventStart;

    const report = new DOMTimingReport({
      id: generateId(),
      domInteractiveTime,
      domProcessingTime,
      domContentLoadedDuration,
      loadEventDuration,
      totalDOMTime: domInteractiveTime + domProcessingTime + domContentLoadedDuration + loadEventDuration
    });
    
    this.addReport(report);
  }
}