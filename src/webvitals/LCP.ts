import { LCPReport } from "@/reports/LCPReport";
import { WebVital } from "./WebVital";

export class LCP extends WebVital<LCPReport> {
  protected isPerformanceObservationSupported(): boolean {
    return (
      'PerformanceObserver' in window
      && PerformanceObserver.supportedEntryTypes.includes("largest-contentful-paint")
    );
  }

  protected handlePerformanceObservation(): void {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length <= 0) return;
      const lastEntry = entries.at(-1) as PerformanceEntry; // Safely get the last entry
      const value = lastEntry.startTime;
      const lcp = new LCPReport(value);
      this.report = lcp;
      this.notifyChange(lcp);
    });

    observer.observe({ type: 'largest-contentful-paint', buffered: true });
  }
}
