import { describe, it, expect, vi } from 'vitest';

import { FIDReportMothers } from '@/test/mothers/FIDReportMothers';
import { PerformanceEventTimingMother } from '@/test/mothers/PerformanceEventTimingMother';

import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { RATINGS, WEB_VITALS } from '@/types/WebVitals';
import { FIDReport } from './FIDReport';

describe('FIDReport', () => {
  describe('create factory method', () => {
    describe('when data is valid', () => {
      it('should create FIDReport successfully with all FID-specific properties', () => {
        // Given
        const id = 'test-fid-123';
        const value = 120;
        const occurredAt = PerformanceTime.fromRelativeTime(100);
        const createdAt = PerformanceTime.fromRelativeTime(200);
        const data = { id, value, occurredAt, createdAt };

        // When
        const report = FIDReport.create(data);

        // Then
        expect(report.id).toBe(id);
        expect(report.value).toBe(value);
        expect(report.name).toBe(WEB_VITALS.FIRST_INPUT_DELAY);
        expect(report.goodThreshold).toBe(100);
        expect(report.poorThreshold).toBe(300);
      });

      it('should be immutable after creation', () => {
        // Given
        const report = FIDReportMothers.good();

        // When & Then
        expect(Object.isFrozen(report)).toBe(true);
        expect(() => {
          // @ts-expect-error Testing immutability
          report.value = 999;
        }).toThrow();
      });
    });
  });

  describe('fromPerformanceEventTiming factory method', () => {
    describe('when PerformanceEventTiming entry is valid', () => {
      it('should create report calculating FID as processingStart minus startTime', () => {
        // Given
        const id = 'fid-from-entry-123';
        const startTime = 150;
        const processingStart = 180;
        const expectedFID = processingStart - startTime; // 30ms
        const eventEntry = PerformanceEventTimingMother.withCustomValues({ 
          startTime, 
          processingStart 
        });
        vi.spyOn(PerformanceTime, 'now').mockReturnValue(
          PerformanceTime.fromRelativeTime(performance.timeOrigin)
        );

        // When
        const report = FIDReport.fromPerformanceEventTiming(id, eventEntry);

        // Then
        expect(report.id).toBe(id);
        expect(report.value).toBe(expectedFID);
        expect(report.occurredAt.relativeTime).toBe(startTime);
        expect(report.createdAt.relativeTime).toBe(performance.timeOrigin);
      });
    });
  });

  describe('rating system', () => {
    it('should classify performance according to FID thresholds', () => {
      // Given
      const goodReport = FIDReportMothers.withValue(80);
      const goodThresholdReport = FIDReportMothers.withValue(100); // At threshold
      const needsImprovementReport = FIDReportMothers.withValue(200);
      const poorThresholdReport = FIDReportMothers.withValue(300); // At threshold
      const poorReport = FIDReportMothers.withValue(450);

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
      const report = FIDReportMothers.needsImprovement();

      // When
      const result = report.toString();

      // Then
      expect(result).toBe(`[${WEB_VITALS.FIRST_INPUT_DELAY}]: 200ms (${RATINGS.NEEDS_IMPROVEMENT})`);
    });
  });

  describe('toJSON', () => {
    it('should return complete JSON representation with all FID properties', () => {
      // Given
      const report = FIDReportMothers.needsImprovement();

      // When
      const result = report.toJSON();

      // Then
      expect(result).toEqual({
        id: 'fid-needs-improvement',
        name: WEB_VITALS.FIRST_INPUT_DELAY,
        value: 200,
        createdAt: report.createdAt.absoluteTime,
        occurredAt: report.occurredAt.absoluteTime,
        rating: RATINGS.NEEDS_IMPROVEMENT,
        goodThreshold: 100,
        poorThreshold: 300
      });
      expect(typeof result.createdAt).toBe('number');
      expect(result.createdAt).toBeGreaterThan(performance.timeOrigin);
    });
  });

  describe('edge cases', () => {
    it('should handle boundary values correctly', () => {
      // Given & When
      const zeroReport = FIDReportMothers.withValue(0);
      const largeReport = FIDReportMothers.withValue(5000);
      const decimalReport = FIDReportMothers.withValue(100.5);

      // Then
      expect(zeroReport.rating).toBe(RATINGS.GOOD);
      expect(largeReport.rating).toBe(RATINGS.POOR);
      expect(decimalReport.rating).toBe(RATINGS.NEEDS_IMPROVEMENT);
    });
  });

  describe('FID-specific scenarios from Performance API', () => {
    it('should create report from various first input timing scenarios correctly', () => {
      // Given
      const fastStartTime = 50;
      const fastProcessingStart = 65; // 15ms FID
      const slowStartTime = 400;
      const slowProcessingStart = 520; // 120ms FID
      
      const fastFirstInput = PerformanceEventTimingMother.withCustomValues({ 
        startTime: fastStartTime, 
        processingStart: fastProcessingStart 
      });
      const slowFirstInput = PerformanceEventTimingMother.withCustomValues({ 
        startTime: slowStartTime, 
        processingStart: slowProcessingStart 
      });

      // When
      const fastReport = FIDReport.fromPerformanceEventTiming('fast', fastFirstInput);
      const slowReport = FIDReport.fromPerformanceEventTiming('slow', slowFirstInput);

      // Then
      expect(fastReport.rating).toBe(RATINGS.GOOD);
      expect(slowReport.rating).toBe(RATINGS.NEEDS_IMPROVEMENT);
      expect(fastReport.value).toBe(15); // processingStart - startTime
      expect(slowReport.value).toBe(120); // processingStart - startTime
    });
  });
});