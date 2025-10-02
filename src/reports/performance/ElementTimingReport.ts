import type { Report } from '@/reports/Report';
import type { PerformanceElementTiming } from '@/types/PerformanceEntryTypes';
import { PerformanceTime } from '@/value-objects/PerformanceTime';

interface ElementTimingData {
  id: string;
  createdAt: PerformanceTime;
  occurredAt: PerformanceTime;
  elementId?: string;
  identifier: string;
  loadTime: number;
  renderTime: number;
  naturalWidth?: number;
  naturalHeight?: number;
  url?: string;
}

/**
 * Report for Element Timing API performance entries.
 * 
 * Tracks when specific elements become visible to users, helping measure
 * perceived performance of important content like hero images, text blocks,
 * or other key page elements.
 */
export class ElementTimingReport implements Report {
  public readonly id: string;
  public readonly createdAt: PerformanceTime;
  public readonly occurredAt: PerformanceTime;
  public readonly elementId?: string;
  public readonly identifier: string;
  public readonly loadTime: number;
  public readonly renderTime: number;
  public readonly naturalWidth?: number;
  public readonly naturalHeight?: number;
  public readonly url?: string;

  private constructor(data: ElementTimingData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.occurredAt = data.occurredAt;
    this.elementId = data.elementId;
    this.identifier = data.identifier;
    this.loadTime = data.loadTime;
    this.renderTime = data.renderTime;
    this.naturalWidth = data.naturalWidth;
    this.naturalHeight = data.naturalHeight;
    this.url = data.url;

    Object.freeze(this);
  }

  /**
   * Creates an ElementTimingReport from provided data.
   */
  public static create(data: ElementTimingData): ElementTimingReport {
    return new ElementTimingReport(data);
  }

  /**
   * Creates an ElementTimingReport from a PerformanceElementTiming entry.
   */
  public static fromPerformanceElementTiming(
    id: string,
    entry: PerformanceElementTiming
  ): ElementTimingReport {
    return new ElementTimingReport({
      id,
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(entry.startTime),
      elementId: entry.id || undefined,
      identifier: entry.identifier,
      loadTime: entry.loadTime,
      renderTime: entry.renderTime,
      naturalWidth: entry.naturalWidth || undefined,
      naturalHeight: entry.naturalHeight || undefined,
      url: entry.url || undefined,
    });
  }

  /**
   * Gets the effective rendering time (render time or load time if render time is 0).
   */
  public get effectiveRenderTime(): number {
    return this.renderTime > 0 ? this.renderTime : this.loadTime;
  }

  /**
   * Checks if this element is an image based on available properties.
   */
  public get isImage(): boolean {
    return this.naturalWidth !== undefined && this.naturalHeight !== undefined;
  }

  /**
   * Gets the element size in pixels (for images).
   */
  public get elementSize(): { width?: number; height?: number } {
    return {
      width: this.naturalWidth,
      height: this.naturalHeight
    };
  }

  /**
   * Checks if element has a custom identifier (elementtiming attribute).
   */
  public get hasCustomIdentifier(): boolean {
    return this.identifier !== '';
  }

  /**
   * String representation of the element timing.
   */
  public toString(): string {
    const type = this.isImage ? 'Image' : 'Element';
    const time = Math.round(this.effectiveRenderTime);
    return `${type} "${this.identifier}": ${time}ms to render`;
  }

  /**
   * JSON representation for serialization.
   */
  public toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt.absoluteTime,
      occurredAt: this.occurredAt.absoluteTime,
      elementId: this.elementId,
      identifier: this.identifier,
      loadTime: this.loadTime,
      renderTime: this.renderTime,
      effectiveRenderTime: this.effectiveRenderTime,
      naturalWidth: this.naturalWidth,
      naturalHeight: this.naturalHeight,
      url: this.url,
      isImage: this.isImage,
      hasCustomIdentifier: this.hasCustomIdentifier,
    };
  }
}
