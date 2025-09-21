import { describe, it, expect, vi } from 'vitest';

import { FCPReportMothers } from '@/test-utils/mothers/FCPReportMothers';
import { PerformancePaintTimingMother } from '@/test-utils/mothers/PerformancePaintTimingMother';

import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { RATINGS, WEB_VITALS } from '@/types/WebVitals';
import { FCPReport } from './FCPReport';

describe('FCPReport', () => {
  describe('create factory method', () => {
    describe('when data is valid', () => {
      it('should create FCPReport successfully with all FCP-specific properties', () => {
        // Given
        const id = 'test-fcp-123';
        const value = 2000;
        const occurredAt = PerformanceTime.fromRelativeTime(100);
        const createdAt = PerformanceTime.fromRelativeTime(200);
        const data = { id, value, occurredAt, createdAt };

        // When
        const report = FCPReport.create(data);

        // Then
        expect(report.id).toBe(id);
        expect(report.value).toBe(value);
        expect(report.name).toBe(WEB_VITALS.FIRST_CONTENTFUL_PAINT);
        expect(report.goodThreshold).toBe(1800);
        expect(report.poorThreshold).toBe(3000);
      });

      it('should be immutable after creation', () => {
        // Given
        const report = FCPReportMothers.good();

        // When & Then
        expect(Object.isFrozen(report)).toBe(true);
        expect(() => {
          // @ts-expect-error Testing immutability
          report.value = 999;
        }).toThrow();
      });
    });
  });

  describe('fromPerformancePaintTiming factory method', () => {
    describe('when PerformancePaintTiming entry is valid', () => {
      it('should create report using entry startTime as value and occurredAt', () => {
        // Given
        const id = 'fcp-from-entry-123';
        const startTime = 1600;
        const paintEntry = PerformancePaintTimingMother.withCustomValues({ startTime });
        vi.spyOn(PerformanceTime, 'now').mockReturnValue(
          PerformanceTime.fromRelativeTime(performance.timeOrigin)
        );

        // When
        const report = FCPReport.fromPerformancePaintTiming(id, paintEntry);

        // Then
        expect(report.id).toBe(id);
        expect(report.value).toBe(startTime);
        expect(report.occurredAt.relativeTime).toBe(startTime);
        expect(report.createdAt.relativeTime).toBe(performance.timeOrigin);
      });
    });
  });

  describe('rating system', () => {
    it('should classify performance according to FCP thresholds', () => {
      // Given
      const goodReport = FCPReportMothers.withValue(1400);
      const goodThresholdReport = FCPReportMothers.withValue(1800); // At threshold
      const needsImprovementReport = FCPReportMothers.withValue(2400);
      const poorThresholdReport = FCPReportMothers.withValue(3000); // At threshold
      const poorReport = FCPReportMothers.withValue(4200);

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
      const report = FCPReportMothers.needsImprovement();

      // When
      const result = report.toString();

      // Then
      expect(result).toBe(`[${WEB_VITALS.FIRST_CONTENTFUL_PAINT}]: 2400ms (${RATINGS.NEEDS_IMPROVEMENT})`);
    });
  });

  describe('toJSON', () => {
    it('should return complete JSON representation with all FCP properties', () => {
      // Given
      const report = FCPReportMothers.needsImprovement();

      // When
      const result = report.toJSON();

      // Then
      expect(result).toEqual({
        id: 'fcp-needs-improvement',
        name: WEB_VITALS.FIRST_CONTENTFUL_PAINT,
        value: 2400,
        createdAt: report.createdAt.absoluteTime,
        occurredAt: report.occurredAt.absoluteTime,
        rating: RATINGS.NEEDS_IMPROVEMENT,
        goodThreshold: 1800,
        poorThreshold: 3000
      });
      expect(typeof result.createdAt).toBe('number');
      expect(result.createdAt).toBeGreaterThan(performance.timeOrigin);
    });
  });

  describe('edge cases', () => {
    it('should handle boundary values correctly', () => {
      // Given & When
      const zeroReport = FCPReportMothers.withValue(0);
      const largeReport = FCPReportMothers.withValue(10000);
      const decimalReport = FCPReportMothers.withValue(1800.5);

      // Then
      expect(zeroReport.rating).toBe(RATINGS.GOOD);
      expect(largeReport.rating).toBe(RATINGS.POOR);
      expect(decimalReport.rating).toBe(RATINGS.NEEDS_IMPROVEMENT);
    });
  });

  describe('FCP-specific scenarios from Performance API', () => {
    it('should create report from various paint timing scenarios correctly', () => {
      // Given
      const fastFCP = PerformancePaintTimingMother.withFastFCP();
      const slowFCP = PerformancePaintTimingMother.withSlowFCP();

      // When
      const fastReport = FCPReport.fromPerformancePaintTiming('fast', fastFCP);
      const slowReport = FCPReport.fromPerformancePaintTiming('slow', slowFCP);

      // Then
      expect(fastReport.rating).toBe(RATINGS.GOOD);
      expect(slowReport.rating).toBe(RATINGS.POOR);
      expect(fastReport.value).toBe(1200);
      expect(slowReport.value).toBe(3500);
    });
  });
});