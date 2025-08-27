import { INPReport } from "@/reports/INPReport";
import { UnsupportedMetricException } from "@/errors/UnsupportedMetricException";
import { generateId } from "@/shared/generateId";
import { PerformanceTime } from "@/shared/PerformanceTime";

import { isPerformanceObservationSupported, PerformanceMetricObserver } from "./PerformanceMetricObserver";

export class INP extends PerformanceMetricObserver<INPReport> {
  private readonly performanceObserverType = "event";

  protected initialize(): void {
    if (isPerformanceObservationSupported(this.performanceObserverType)) {
      this.handlePerformanceObserver();
    }
    else {
      const error = new UnsupportedMetricException("INP");
      this.emitError(error);
    }
  }

  private handlePerformanceObserver(): void {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries() as PerformanceEventTiming[];
        for (const entry of entries) {
          const eventEntry = entry as PerformanceEventTiming & { interactionId?: number };
          if (!eventEntry.interactionId) continue;
          const inpValue = entry.processingEnd - entry.startTime;
          const report = new INPReport({
            id: generateId(),
            createdAt: PerformanceTime.now(),
            timestamp: PerformanceTime.addTimeOrigin(entry.startTime),
            value: inpValue,
            eventName: entry.name
          });
          this.emitReport(report);
        }
      });

    this.setObserver(observer);
    observer.observe({
        type: this.performanceObserverType,
        durationThreshold: 16,
        buffered: true
      } as unknown as PerformanceObserverInit & { eventType: 'event' } // TODO: Implement eventType when PerformanceObserver supports it
    );
  }
}
