import { INPReport } from "@/reports/INPReport";
import { INPUnsupportedException } from "@/errors/INPUnsupportedException";
import { isPerformanceObservationSupported, WebVitalObserver } from "./WebVitalObserver";

export class INP extends WebVitalObserver {
  protected readonly performanceObserverType = "event";

  protected initialize(): void {
    if (isPerformanceObservationSupported(this.performanceObserverType)) {
      this.handlePerformanceObserver();
    }
    else {
      const error = new INPUnsupportedException();
      this.addError(error);
    }
  }

  protected handlePerformanceObserver(): void {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry) => {
        const eventEntry = entry as PerformanceEventTiming & { interactionId?: number };
        if (!eventEntry.interactionId) return;
        const inp = eventEntry.processingEnd - eventEntry.startTime;
        const report = new INPReport(inp);
        this.addReport(report);
      });
    });
    observer.observe({ type: this.performanceObserverType, buffered: true });
    this.setObserver(observer);
  }
}
