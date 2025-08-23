import { FIDReport } from "@/reports/FIDReport";
import { WebVital } from "./WebVital";

export class FID extends WebVital<FIDReport> {
  protected isPerformanceObservationSupported(): boolean {
    return (
      'PerformanceObserver' in window
      && PerformanceObserver.supportedEntryTypes.includes("first-input")
    );
  }

  protected handlePerformanceObservation(): void {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      for (const entry of entries) {
        if (entry.entryType !== 'first-input') continue;
        const fidValue = entry.startTime;
        const fidReport = new FIDReport(fidValue);
        this.report = fidReport;
        this.notifyChange(fidReport);
      }
    });

    observer.observe({ type: 'first-input', buffered: true });
  }
}

