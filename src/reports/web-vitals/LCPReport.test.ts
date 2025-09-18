import { describe, it, expect, vi } from 'vitest';

import { LCPReportMothers } from '@/test-utils/mothers/LCPReportMothers';
import { LargestContentfulPaintMother } from '@/test-utils/mothers/LargestContentfulPaintMother';
import { PERFORMANCE_TIMESTAMPS } from '@/test-utils/performanceHelpers';

import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { RATINGS, WEB_VITALS } from '@/types/WebVitals';
import { LCPReport } from './LCPReport';

describe('LCPReport', () => {
  describe('create factory method', () => {
    describe('when data is valid', () => {
      it('should create LCPReport successfully with all LCP-specific properties', () => {
        // Given
        const id = 'test-lcp-123';
        const value = 2000;
        const occurredAt = PerformanceTime.fromRelativeTime(100);
        const createdAt = PerformanceTime.fromRelativeTime(200);
        const data = { id, value, occurredAt, createdAt };

        // When
        const report = LCPReport.create(data);

        // Then
        expect(report.id).toBe(id);
        expect(report.value).toBe(value);
        expect(report.name).toBe(WEB_VITALS.LARGEST_CONTENTFUL_PAINT);
        expect(report.goodThreshold).toBe(2500);
        expect(report.poorThreshold).toBe(4000);
      });

      it('should be immutable after creation', () => {
        // Given
        const report = LCPReportMothers.good();

        // When & Then
        expect(Object.isFrozen(report)).toBe(true);
        expect(() => {
          // @ts-expect-error Testing immutability
          report.value = 999;
        }).toThrow();
      });
    });
  });

  describe('fromLargestContentfulPaint factory method', () => {
    describe('when LCP entry is valid', () => {
      it('should create report using entry startTime as value and occurredAt', () => {
        // Given
        const id = 'lcp-from-entry-123';
        const startTime = 1800;
        const lcpEntry = LargestContentfulPaintMother.withCustomValues({ startTime });
        vi.spyOn(PerformanceTime, 'now').mockReturnValue(
          PerformanceTime.fromRelativeTime(PERFORMANCE_TIMESTAMPS.CURRENT_TIME)
        );

        // When
        const report = LCPReport.fromLargestContentfulPaint(id, lcpEntry);

        // Then
        expect(report.id).toBe(id);
        expect(report.value).toBe(startTime);
        expect(report.occurredAt.relativeTime).toBe(startTime);
        expect(report.createdAt.relativeTime).toBe(PERFORMANCE_TIMESTAMPS.CURRENT_TIME);
      });
    });
  });

  describe('rating system', () => {
    it('should classify performance according to LCP thresholds', () => {
      // Given
      const goodReport = LCPReportMothers.withValue(1800);
      const goodThresholdReport = LCPReportMothers.withValue(2500); // At threshold
      const needsImprovementReport = LCPReportMothers.withValue(3200);
      const poorThresholdReport = LCPReportMothers.withValue(4000); // At threshold
      const poorReport = LCPReportMothers.withValue(5500);

      // When & Then
      expect(goodReport.rating).toBe(RATINGS.GOOD);
      expect(goodThresholdReport.rating).toBe(RATINGS.NEEDS_IMPROVEMENT);
      expect(needsImprovementReport.rating).toBe(RATINGS.NEEDS_IMPROVEMENT);
      expect(poorThresholdReport.rating).toBe(RATINGS.POOR);
      expect(poorReport.rating).toBe(RATINGS.POOR);
    });
  });

  describe('toString', () => {
    it('should return formatted string with metric name value and rating', () => {
      // Given
      const report = LCPReportMothers.needsImprovement();

      // When
      const result = report.toString();

      // Then
      expect(result).toBe(`[${WEB_VITALS.LARGEST_CONTENTFUL_PAINT}]: 3200ms (${RATINGS.NEEDS_IMPROVEMENT})`);
    });
  });

  describe('toJSON', () => {
    it('should return complete JSON representation with all LCP properties', () => {
      // Given
      const report = LCPReportMothers.needsImprovement();

      // When
      const result = report.toJSON();

      // Then
      expect(result).toEqual({
        id: 'lcp-needs-improvement',
        name: WEB_VITALS.LARGEST_CONTENTFUL_PAINT,
        value: 3200,
        createdAt: report.createdAt.absoluteTime,
        occurredAt: report.occurredAt.absoluteTime,
        rating: RATINGS.NEEDS_IMPROVEMENT,
        goodThreshold: 2500,
        poorThreshold: 4000
      });
      expect(typeof result.createdAt).toBe('number');
      expect(result.createdAt).toBeGreaterThan(PERFORMANCE_TIMESTAMPS.TIME_ORIGIN);
    });
  });

  describe('edge cases', () => {
    it('should handle boundary values correctly', () => {
      // Given & When
      const zeroReport = LCPReportMothers.withValue(0);
      const largeReport = LCPReportMothers.withValue(50000);
      const decimalReport = LCPReportMothers.withValue(2500.5);

      // Then
      expect(zeroReport.rating).toBe(RATINGS.GOOD);
      expect(largeReport.rating).toBe(RATINGS.POOR);
      expect(decimalReport.rating).toBe(RATINGS.NEEDS_IMPROVEMENT);
    });
  });

  describe('LCP-specific scenarios from Performance API', () => {
    it('should create report from various LCP entry types correctly', () => {
      // Given
      const fastLCP = LargestContentfulPaintMother.withCustomValues({ startTime: 1500 });
      const slowLCP = LargestContentfulPaintMother.withCustomValues({ startTime: 5000 });

      // When
      const fastReport = LCPReport.fromLargestContentfulPaint('fast', fastLCP);
      const slowReport = LCPReport.fromLargestContentfulPaint('slow', slowLCP);

      // Then
      expect(fastReport.rating).toBe(RATINGS.GOOD);
      expect(slowReport.rating).toBe(RATINGS.POOR);
      expect(fastReport.value).toBe(1500);
      expect(slowReport.value).toBe(5000);
    });
  });
});