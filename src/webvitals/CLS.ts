import { CLSReport } from "@/reports/CLSReport";
import { WebVital } from "./WebVital";

export class CLS extends WebVital<CLSReport> {
  protected isPerformanceObservationSupported(): boolean {
    return (
      'PerformanceObserver' in window
      && PerformanceObserver.supportedEntryTypes.includes("layout-shift")
    );
  }

  protected handlePerformanceObservation(): void {
    // let cls = 0;
     const observer = new PerformanceObserver(() => {
      // const entries = entryList.getEntries();
      // for (const entry of entries) {
        // if (!entry.hadRecentInput) {
        //   cls += entry.value;
        // }
      // }
      this.report = new CLSReport(0);
      this.notifyChange(this.report);
    });

    observer.observe({ type: 'layout-shift', buffered: true });
  }
}

