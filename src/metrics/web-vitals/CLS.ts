import { CLSReport } from "@/reports/web-vitals/CLSReport";
import { UnsupportedMetricException } from "@/errors/UnsupportedMetricException";
import { generateId } from "@/shared/generateId";
import { PerformanceTime } from "@/shared/PerformanceTime";

import { isPerformanceObservationSupported, PerformanceMetricObserver } from "@/shared/PerformanceMetricObserver";

export class CLS extends PerformanceMetricObserver<CLSReport> {
  private readonly performanceObserverType = "layout-shift";
  private cls: number = 0;

  protected initialize(): void {
    if (isPerformanceObservationSupported(this.performanceObserverType)) {
      this.handlePerformanceObserver();
    }
    else {
      const error = new UnsupportedMetricException("CLS");
      this.emitError(error);
    }
  }

  private handlePerformanceObserver(): void {    
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      
      for (const entry of entries) {
        const layoutShift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
        
        if (!layoutShift.hadRecentInput) {
          this.cls += layoutShift.value;
          const report = new CLSReport({
            id: generateId(),
            value: this.cls,
            createdAt: PerformanceTime.now(),
            timestamp: PerformanceTime.addTimeOrigin(entry.startTime)
          });
          this.emitReport(report);
        }
      }
    });
    
    this.setObserver(observer);
    observer.observe({ type: 'layout-shift', buffered: true });
  }
}
