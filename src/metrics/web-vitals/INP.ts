import { INPReport } from "@/reports/web-vitals/INPReport";
import { generateId } from "@/shared/generateId";
import { PerformanceMetricObserver } from "@/shared/PerformanceMetricObserver";
import { PerformanceEventTimingEntry } from "@/shared/PerformanceEntryTypes";
import { Serialized } from "@/shared/Serialized";

export class INP extends PerformanceMetricObserver<Serialized<INPReport>> {
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
      const report = INPReport.fromPerformanceEventTimingEntry(
        generateId(),
        entry
      );
      this.notifySuccess(report.toJSON());
    }
  }
}
