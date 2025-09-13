export interface PerformanceEventTimingEntry extends PerformanceEventTiming {
  interactionId?: number;
}

interface LayoutShiftAttributionEntry {
  readonly currentRect: DOMRectReadOnly;
  readonly previousRect: DOMRectReadOnly;
  readonly node: HTMLElement;
}

export interface LayoutShiftEntry extends PerformanceEntry {
  readonly hadRecentInput: boolean;
  readonly lastInputTime: number;
  readonly sources: LayoutShiftAttributionEntry[];
  readonly value: number;
}

interface TaskAttributionTimingEntry extends PerformanceEntry {
  readonly containerType: string;
  readonly containerName: string;
  readonly containerSrc: string;
  readonly containerId: string;
}

export interface PerformanceLongTaskTimingEntry extends PerformanceEventTimingEntry {
  readonly attribution: TaskAttributionTimingEntry[];
}

export interface PerformanceElementTiming extends PerformanceEntry {
  readonly id: string;
  readonly identifier: string;
  readonly loadTime: number;
  readonly renderTime: number;
  readonly naturalWidth?: number;
  readonly naturalHeight?: number;
  readonly url?: string;
}