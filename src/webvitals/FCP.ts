import { FCPReport } from "@/reports/FCPReport";
import { WebVital } from "./WebVital";

export class FCP extends WebVital<FCPReport> {
  protected isPerformanceObservationSupported(): boolean {
    return (
      'PerformanceObserver' in window
      && PerformanceObserver.supportedEntryTypes.includes("largest-contentful-paint")
    );
  }

  protected handlePerformanceObservation(): void {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      for (const entry of entries) {
        if (entry.name !== 'first-contentful-paint') continue;
        const value = entry.startTime;
        const fcp = new FCPReport(value);
        this.report = fcp;
        this.notifyChange(fcp);
      }
    });

    observer.observe({ type: 'paint', buffered: true });
  }
}
