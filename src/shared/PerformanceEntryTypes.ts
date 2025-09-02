export interface PerformanceEventTimingEntry extends PerformanceEventTiming {
  interactionId?: number;
}

interface LayoutShiftAttributionEntry {
  currentRect: DOMRectReadOnly;
  previousRect: DOMRectReadOnly;
  node: HTMLElement;
}

export interface LayoutShiftEntry extends PerformanceEntry {
  hadRecentInput: boolean;
  lastInputTime: number;
  sources: LayoutShiftAttributionEntry[];
  value: number;
}

interface TaskAttributionTimingEntry extends PerformanceEntry {
  containerType: string;
  containerName: string;
  containerSrc: string;
  containerId: string;
}

export interface PerformanceLongTaskTimingEntry extends PerformanceEventTimingEntry {
  attribution: TaskAttributionTimingEntry[];
}
