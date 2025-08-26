import { CLSReport } from "@/reports/CLSReport";
import { UnsupportedMetricException } from "@/errors/UnsupportedMetricException";
import { generateId } from "@/shared/generateId";
import { isPerformanceObservationSupported, PerformanceMetricObserver } from "./PerformanceMetricObserver";

export class CLS extends PerformanceMetricObserver<CLSReport> {
  private readonly performanceObserverType = "layout-shift";
  private cls: number = 0;

  protected initialize(): void {
    if (isPerformanceObservationSupported(this.performanceObserverType)) {
      this.handlePerformanceObserver();
    }
    else {
      const error = new UnsupportedMetricException("CLS");
      this.addError(error);
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
            startTime: entry.startTime,
            value: this.cls
          });
          this.addReport(report);
        }
      }
    });
    
    this.setObserver(observer);
    observer.observe({ type: 'layout-shift', buffered: true });
  }
}
