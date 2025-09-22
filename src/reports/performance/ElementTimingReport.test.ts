import { describe, it, expect, vi } from 'vitest';

import { ElementTimingReportMothers } from '@/test/mothers/ElementTimingReportMothers';
import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { ElementTimingReport } from './ElementTimingReport';

describe('ElementTimingReport', () => {
  describe('create factory method', () => {
    it('should create ElementTimingReport with provided data', () => {
      // Given
      const data = ElementTimingReportMothers.heroImage();

      // When
      const report = ElementTimingReport.create(data);

      // Then
      expect(report.id).toBe(data.id);
      expect(report.createdAt).toBe(data.createdAt);
      expect(report.occurredAt).toBe(data.occurredAt);
      expect(report.elementId).toBe('hero-banner');
      expect(report.identifier).toBe('hero-image');
      expect(report.loadTime).toBe(1200);
      expect(report.renderTime).toBe(1250);
      expect(report.naturalWidth).toBe(1920);
      expect(report.naturalHeight).toBe(1080);
      expect(report.url).toBe('https://example.com/hero.jpg');
    });

    it('should freeze the created report instance', () => {
      // Given
      const data = ElementTimingReportMothers.textBlock();

      // When
      const report = ElementTimingReport.create(data);

      // Then
      expect(Object.isFrozen(report)).toBe(true);
    });
  });

  describe('fromPerformanceElementTiming factory method', () => {
    it('should create ElementTimingReport from PerformanceElementTiming data', () => {
      // Given
      const id = 'test-element-timing';
      const entry = ElementTimingReportMothers.createPerformanceElementTiming('hero');
      vi.spyOn(PerformanceTime, 'now').mockReturnValue(
        PerformanceTime.fromAbsoluteTime(performance.timeOrigin)
      );

      // When
      const report = ElementTimingReport.fromPerformanceElementTiming(id, entry);

      // Then
      expect(report.id).toBe(id);
      expect(report.elementId).toBe('hero-banner');
      expect(report.identifier).toBe('hero-image');
      expect(report.loadTime).toBe(1200);
      expect(report.renderTime).toBe(1250);
      expect(report.naturalWidth).toBe(1920);
      expect(report.naturalHeight).toBe(1080);
      expect(report.url).toBe('https://example.com/hero.jpg');
    });

    it('should handle entries with empty values correctly', () => {
      // Given
      const id = 'test-no-id';
      const entry = ElementTimingReportMothers.createPerformanceElementTiming('noId');

      // When
      const report = ElementTimingReport.fromPerformanceElementTiming(id, entry);

      // Then
      expect(report.elementId).toBe('auto-element');
      expect(report.identifier).toBe('');
      expect(report.naturalWidth).toBeUndefined();
      expect(report.naturalHeight).toBeUndefined();
      expect(report.url).toBeUndefined();
    });
  });

  describe('computed getters', () => {
    it('should return renderTime as effectiveRenderTime when renderTime > 0', () => {
      // Given
      const data = ElementTimingReportMothers.heroImage();
      const report = ElementTimingReport.create(data);

      // When
      const effectiveTime = report.effectiveRenderTime;

      // Then
      expect(effectiveTime).toBe(1250); // renderTime
    });

    it('should return loadTime as effectiveRenderTime when renderTime is 0', () => {
      // Given
      const data = ElementTimingReportMothers.fastImage();
      const report = ElementTimingReport.create(data);

      // When
      const effectiveTime = report.effectiveRenderTime;

      // Then
      expect(effectiveTime).toBe(300); // loadTime since renderTime = 0
    });

    it('should identify images correctly based on naturalWidth and naturalHeight', () => {
      // Given
      const imageReport = ElementTimingReport.create(ElementTimingReportMothers.heroImage());
      const textReport = ElementTimingReport.create(ElementTimingReportMothers.textBlock());

      // When & Then
      expect(imageReport.isImage).toBe(true);  // Has naturalWidth & naturalHeight
      expect(textReport.isImage).toBe(false); // Missing naturalWidth & naturalHeight
    });

    it('should return element size for images', () => {
      // Given
      const data = ElementTimingReportMothers.fastImage();
      const report = ElementTimingReport.create(data);

      // When
      const size = report.elementSize;

      // Then
      expect(size).toEqual({
        width: 150,
        height: 150
      });
    });

    it('should return undefined dimensions for non-images', () => {
      // Given
      const data = ElementTimingReportMothers.textBlock();
      const report = ElementTimingReport.create(data);

      // When
      const size = report.elementSize;

      // Then
      expect(size).toEqual({
        width: undefined,
        height: undefined
      });
    });

    it('should detect custom identifier correctly', () => {
      // Given
      const withIdentifier = ElementTimingReport.create(ElementTimingReportMothers.heroImage());
      const withoutIdentifier = ElementTimingReport.create(ElementTimingReportMothers.noIdentifier());

      // When & Then
      expect(withIdentifier.hasCustomIdentifier).toBe(true);  // identifier = 'hero-image'
      expect(withoutIdentifier.hasCustomIdentifier).toBe(false); // identifier = ''
    });
  });

  describe('toString', () => {
    it('should return formatted string for images', () => {
      // Given
      const data = ElementTimingReportMothers.heroImage();
      const report = ElementTimingReport.create(data);

      // When
      const stringRepresentation = report.toString();

      // Then
      expect(stringRepresentation).toBe('Image "hero-image": 1250ms to render');
    });

    it('should return formatted string for non-image elements', () => {
      // Given
      const data = ElementTimingReportMothers.textBlock();
      const report = ElementTimingReport.create(data);

      // When
      const stringRepresentation = report.toString();

      // Then
      expect(stringRepresentation).toBe('Element "main-heading": 850ms to render');
    });

    it('should use effective render time when renderTime is 0', () => {
      // Given
      const data = ElementTimingReportMothers.fastImage();
      const report = ElementTimingReport.create(data);

      // When
      const stringRepresentation = report.toString();

      // Then
      expect(stringRepresentation).toBe('Image "product-thumb": 300ms to render');
    });
  });

  describe('toJSON', () => {
    it('should return complete object representation with all properties', () => {
      // Given
      const data = ElementTimingReportMothers.heroImage();
      const report = ElementTimingReport.create(data);

      // When
      const jsonRepresentation = report.toJSON();

      // Then
      expect(jsonRepresentation).toEqual({
        // Basic metadata
        id: 'hero-element-timing-001',
        createdAt: data.createdAt.absoluteTime,
        occurredAt: data.occurredAt.absoluteTime,

        // Element properties
        elementId: data.elementId,
        identifier: data.identifier,
        loadTime: data.loadTime,
        renderTime: data.renderTime,
        naturalWidth: data.naturalWidth,
        naturalHeight: data.naturalHeight,
        url: data.url,

        // Computed properties
        effectiveRenderTime: 1250,
        isImage: true,
        hasCustomIdentifier: true
      });
    });

    it('should handle undefined properties correctly', () => {
      // Given
      const data = ElementTimingReportMothers.minimal();
      const report = ElementTimingReport.create(data);

      // When
      const jsonRepresentation = report.toJSON();

      // Then
      expect(jsonRepresentation.elementId).toBeUndefined();
      expect(jsonRepresentation.naturalWidth).toBeUndefined();
      expect(jsonRepresentation.naturalHeight).toBeUndefined();
      expect(jsonRepresentation.url).toBeUndefined();
      expect(jsonRepresentation.isImage).toBe(false);
      expect(jsonRepresentation.hasCustomIdentifier).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle minimal element timing correctly', () => {
      // Given
      const data = ElementTimingReportMothers.minimal();
      const report = ElementTimingReport.create(data);

      // When & Then
      expect(report.effectiveRenderTime).toBe(100);
      expect(report.isImage).toBe(false);
      expect(report.hasCustomIdentifier).toBe(true);
      expect(report.toString()).toBe('Element "minimal": 100ms to render');
    });

    it('should maintain immutability when accessing computed properties', () => {
      // Given
      const data = ElementTimingReportMothers.heroImage();
      const report = ElementTimingReport.create(data);

      // When
      const time1 = report.effectiveRenderTime;
      const time2 = report.effectiveRenderTime;
      const isImage1 = report.isImage;
      const isImage2 = report.isImage;

      // Then
      expect(time1).toBe(time2);
      expect(isImage1).toBe(isImage2);
      expect(Object.isFrozen(report)).toBe(true);
    });
  });
});