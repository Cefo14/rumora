import { INPReport } from "@/reports/web-vitals/INPReport";
import { generateId } from "@/shared/generateId";
import { PerformanceTime } from "@/shared/PerformanceTime";
import { PerformanceMetricObserver } from "@/shared/PerformanceMetricObserver";

export class INP extends PerformanceMetricObserver<INPReport> {
  constructor() {
    super(
      "event",
      {
        durationThreshold: 16,
      }
    );
  }

  protected onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as PerformanceEventTiming[];
    for (const entry of entries) {
      const eventEntry = entry as PerformanceEventTiming & { interactionId?: number };
      if (!eventEntry.interactionId) continue;
      const inpValue = entry.processingEnd - entry.startTime;
      const report = new INPReport({
        id: generateId(),
        createdAt: PerformanceTime.now(),
        occurredAt: PerformanceTime.addTimeOrigin(entry.startTime),
        value: inpValue,
        eventName: entry.name
      });
      this.notifySuccess(report);
    }
  }
}
