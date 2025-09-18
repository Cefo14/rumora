/* eslint-disable @typescript-eslint/no-extraneous-class */
import { PerformanceEntryBuilder } from '../builders/PerformanceEntryBuilder';

export class LargestContentfulPaintMother {
  /**
   * Default LCP entry
   */
  static aDefault(): LargestContentfulPaint {
    const baseEntry = PerformanceEntryBuilder
      .create()
      .withName('largest-contentful-paint')
      .withType('largest-contentful-paint')
      .withStartTime(2000)
      .withDuration(0)
      .build();

    return {
      ...baseEntry,
      size: 1500,
      renderTime: 2000,
      loadTime: 2050,
      element: null,
      url: 'https://example.com/image.jpg',
      id: 'lcp-element'
    } as LargestContentfulPaint;
  }

  /**
   * Custom LCP entry with overrides
   */
  static withCustomValues(overrides: Partial<LargestContentfulPaint>): LargestContentfulPaint {
    const defaultLCP = LargestContentfulPaintMother.aDefault();
    return {
      ...defaultLCP,
      ...overrides
    };
  }
}