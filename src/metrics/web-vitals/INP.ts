import { INPReport } from "@/reports/web-vitals/INPReport";
import { generateId } from "@/shared/generateId";
import { PerformanceTime } from "@/shared/PerformanceTime";
import { PerformanceMetricObserver } from "@/shared/PerformanceMetricObserver";

interface PerformanceEventTimingEntry extends PerformanceEventTiming {
  interactionId?: number;
}

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
    const entries = entryList.getEntries() as PerformanceEventTimingEntry[];
    for (const entry of entries) {
      const eventEntry = entry;
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
