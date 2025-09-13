import { ElementTimingReport } from '@/reports/performance/ElementTimingReport';
import { generateId } from '@/shared/generateId';
import { PerformanceMetricObserver } from '@/shared/PerformanceMetricObserver';
import type { PerformanceElementTiming } from '@/types/PerformanceEntryTypes';

/**
 * Observer for Element Timing performance entries.
 * 
 * Monitors when specific elements become visible to users. Elements must be
 * marked with the 'elementtiming' attribute to be tracked. This helps measure
 * perceived performance of important content like hero images, key text, etc.
 * 
 * Usage: Add elementtiming="identifier" to elements you want to track.
 * Example: <img src="hero.jpg" elementtiming="hero-image" />
 */
export class ElementTiming extends PerformanceMetricObserver<ElementTimingReport> {
  constructor() {
    super('element', {
      type: 'element',
      buffered: true
    });
  }

  /**
   * Processes element timing entries and creates reports.
   */
  protected onPerformanceObserver(entryList: PerformanceObserverEntryList): void {
    const entries = entryList.getEntries() as PerformanceElementTiming[];

    for (const entry of entries) {
      if (this.isValidElement(entry)) {
        const report = ElementTimingReport.fromPerformanceElementTiming(generateId(), entry);
        this.notifySuccess(report);
      }
    }
  }

  /**
   * Validates if an element entry should be reported.
   */
  private isValidElement(entry: PerformanceElementTiming): boolean {
    // Must have an identifier (from elementtiming attribute)
    if (!entry.identifier || entry.identifier.trim() === '') {
      return false;
    }

    // Must have valid timing data
    if (entry.loadTime <= 0 && entry.renderTime <= 0) {
      return false;
    }

    return true;
  }
}