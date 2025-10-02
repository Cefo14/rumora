/* eslint-disable @typescript-eslint/no-extraneous-class */
import type { PerformanceElementTiming } from '@/types/PerformanceEntryTypes';
import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { PerformanceElementTimingMother } from './PerformanceElementTimingMother';

/**
 * Object Mother for ElementTimingReport test scenarios
 */
export class ElementTimingReportMothers {
  /**
   * Hero image scenario - large image with custom identifier
   */
  static heroImage() {
    return {
      id: 'hero-element-timing-001',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin),
      occurredAt: PerformanceTime.fromRelativeTime(0),
      elementId: 'hero-banner',
      identifier: 'hero-image',
      loadTime: 1200,
      renderTime: 1250,
      naturalWidth: 1920,
      naturalHeight: 1080,
      url: 'https://example.com/hero.jpg'
    };
  }

  /**
   * Text block scenario - content without image properties
   */
  static textBlock() {
    return {
      id: 'text-element-timing-002',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin + 100),
      occurredAt: PerformanceTime.fromRelativeTime(100),
      elementId: 'heading-1',
      identifier: 'main-heading',
      loadTime: 800,
      renderTime: 850,
      naturalWidth: undefined,
      naturalHeight: undefined,
      url: undefined
    };
  }

  /**
   * Fast image scenario - renderTime = 0, falls back to loadTime
   */
  static fastImage() {
    return {
      id: 'fast-element-timing-003',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin),
      occurredAt: PerformanceTime.fromRelativeTime(50),
      elementId: 'thumb-001',
      identifier: 'product-thumb',
      loadTime: 300,
      renderTime: 0, // Will use loadTime as effective render time
      naturalWidth: 150,
      naturalHeight: 150,
      url: 'https://example.com/thumb.webp'
    };
  }

  /**
   * Element without custom identifier
   */
  static noIdentifier() {
    return {
      id: 'no-id-element-timing-004',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin + 200),
      occurredAt: PerformanceTime.fromRelativeTime(200),
      elementId: 'auto-element',
      identifier: '', // No custom identifier
      loadTime: 500,
      renderTime: 520,
      naturalWidth: undefined,
      naturalHeight: undefined,
      url: undefined
    };
  }

  /**
   * Minimal element - only required properties
   */
  static minimal() {
    return {
      id: 'minimal-element-timing-005',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin),
      occurredAt: PerformanceTime.fromRelativeTime(0),
      elementId: undefined,
      identifier: 'minimal',
      loadTime: 100,
      renderTime: 100,
      naturalWidth: undefined,
      naturalHeight: undefined,
      url: undefined
    };
  }

  /**
   * Creates a PerformanceElementTiming for testing fromPerformanceElementTiming
   */
  static createPerformanceElementTiming(scenario: 'hero' | 'text' | 'fast' | 'noId' = 'hero'): PerformanceElementTiming {
    switch (scenario) {
      case 'hero':
        return PerformanceElementTimingMother.heroImage();
      case 'text':
        return PerformanceElementTimingMother.textBlock();
      case 'fast':
        return PerformanceElementTimingMother.fastImage();
      case 'noId':
        return PerformanceElementTimingMother.noIdentifier();
      default:
        return PerformanceElementTimingMother.heroImage();
    }
  }
}