/* eslint-disable @typescript-eslint/no-extraneous-class */
import type { PerformanceElementTiming } from '@/types/PerformanceEntryTypes';

/**
 * Object Mother for PerformanceElementTiming test scenarios
 */
export class PerformanceElementTimingMother {
  /**
   * Hero image scenario - large image with custom identifier
   */
  static heroImage(): PerformanceElementTiming {
    return {
      // Required PerformanceEntry properties
      name: 'hero-image',
      entryType: 'element',
      startTime: 0,
      duration: 0,
      
      // Element timing specific
      identifier: 'hero-image',
      loadTime: 1200,
      renderTime: 1250,
      
      // Image properties
      naturalWidth: 1920,
      naturalHeight: 1080,
      id: 'hero-banner',
      url: 'https://example.com/hero.jpg',
      
      toJSON: () => ({})
    } as PerformanceElementTiming;
  }

  /**
   * Text block scenario - text content without image properties
   */
  static textBlock(): PerformanceElementTiming {
    return {
      // Required PerformanceEntry properties
      name: 'main-content',
      entryType: 'element',
      startTime: 100,
      duration: 0,
      
      // Element timing specific
      identifier: 'main-heading',
      loadTime: 800,
      renderTime: 850,
      
      // No image properties
      naturalWidth: 0,
      naturalHeight: 0,
      id: 'heading-1',
      url: '',
      
      toJSON: () => ({})
    } as PerformanceElementTiming;
  }

  /**
   * Fast image scenario - quick loading with renderTime = 0
   */
  static fastImage(): PerformanceElementTiming {
    return {
      // Required PerformanceEntry properties
      name: 'thumbnail',
      entryType: 'element',
      startTime: 50,
      duration: 0,
      
      // Element timing specific
      identifier: 'product-thumb',
      loadTime: 300,
      renderTime: 0, // Falls back to loadTime
      
      // Small image properties
      naturalWidth: 150,
      naturalHeight: 150,
      id: 'thumb-001',
      url: 'https://example.com/thumb.webp',
      
      toJSON: () => ({})
    } as PerformanceElementTiming;
  }

  /**
   * Element without custom identifier
   */
  static noIdentifier(): PerformanceElementTiming {
    return {
      // Required PerformanceEntry properties
      name: 'auto-detected',
      entryType: 'element',
      startTime: 200,
      duration: 0,
      
      // Element timing specific
      identifier: '', // No custom identifier
      loadTime: 500,
      renderTime: 520,
      
      // No dimensions (not an image)
      naturalWidth: 0,
      naturalHeight: 0,
      id: 'auto-element',
      url: '',
      
      toJSON: () => ({})
    } as PerformanceElementTiming;
  }
}
