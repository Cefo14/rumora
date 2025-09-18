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
      it('should have correct LCP-specific properties when created', () => {
        // Given
        const report = LCPReportMothers.good();

        // When & Then
        expect(report.name).toBe(WEB_VITALS.LARGEST_CONTENTFUL_PAINT);
        expect(report.goodThreshold).toBe(2500);
        expect(report.poorThreshold).toBe(4000);
      });
    });
  });

  describe('fromLargestContentfulPaint factory method', () => {
    describe('when LCP entry is valid', () => {
      it('should create report from LargestContentfulPaint entry', () => {
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
    describe('when performance is good', () => {
      it('should return GOOD rating when value is below good threshold', () => {
        // Given
        const report = LCPReportMothers.good(); // 1800ms

        // When
        const rating = report.rating;

        // Then
        expect(rating).toBe(RATINGS.GOOD);
        expect(report.isGood).toBe(true);
        expect(report.isNeedsImprovement).toBe(false);
        expect(report.isPoor).toBe(false);
      });
    });

    describe('when performance needs improvement', () => {
      it('should return NEEDS_IMPROVEMENT rating when value is between thresholds', () => {
        // Given
        const report = LCPReportMothers.needsImprovement(); // 3200ms

        // When
        const rating = report.rating;

        // Then
        expect(rating).toBe(RATINGS.NEEDS_IMPROVEMENT);
        expect(report.value).toBe(3200);
        expect(report.isNeedsImprovement).toBe(true);
      });
    });

    describe('when performance is poor', () => {
      it('should return POOR rating when value is above poor threshold', () => {
        // Given
        const report = LCPReportMothers.poor(); // 5500ms

        // When
        const rating = report.rating;

        // Then
        expect(rating).toBe(RATINGS.POOR);
        expect(report.value).toBe(5500);
        expect(report.isPoor).toBe(true);
      });
    });
  });

  describe('toString', () => {
    it('should return formatted string with name value and rating for good performance', () => {
      // Given
      const report = LCPReportMothers.good();

      // When
      const result = report.toString();

      // Then
      expect(result).toBe(`[${WEB_VITALS.LARGEST_CONTENTFUL_PAINT}]: 1800ms (${RATINGS.GOOD})`);
    });

    it('should return formatted string with name value and rating for needs improvement performance', () => {
      // Given
      const report = LCPReportMothers.needsImprovement();

      // When
      const result = report.toString();

      // Then
      expect(result).toBe(`[${WEB_VITALS.LARGEST_CONTENTFUL_PAINT}]: 3200ms (${RATINGS.NEEDS_IMPROVEMENT})`);
    });

    it('should return formatted string with name value and rating for poor performance', () => {
      // Given
      const report = LCPReportMothers.poor();

      // When
      const result = report.toString();

      // Then
      expect(result).toBe(`[${WEB_VITALS.LARGEST_CONTENTFUL_PAINT}]: 5500ms (${RATINGS.POOR})`);
    });
  });

  describe('toJSON', () => {
    it('should return complete JSON representation with all properties', () => {
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
    });

    it('should include absolute timestamps in JSON serialization', () => {
      // Given
      const report = LCPReportMothers.good();

      // When
      const result = report.toJSON();

      // Then
      expect(typeof result.createdAt).toBe('number');
      expect(typeof result.occurredAt).toBe('number');
      expect(result.createdAt).toBeGreaterThan(PERFORMANCE_TIMESTAMPS.TIME_ORIGIN);
      expect(result.occurredAt).toBeGreaterThan(PERFORMANCE_TIMESTAMPS.TIME_ORIGIN);
    });
  });

  // ... resto de tests usando las constantes donde aplique
});