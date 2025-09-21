import { describe, it, expect, vi } from 'vitest';

import { INPReportMothers } from '@/test-utils/mothers/INPReportMothers';
import { PerformanceEventTimingMother } from '@/test-utils/mothers/PerformanceEventTimingMother';

import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { RATINGS, WEB_VITALS } from '@/types/WebVitals';
import { INPReport } from './INPReport';

describe('INPReport', () => {
  describe('create factory method', () => {
    describe('when data is valid', () => {
      it('should create INPReport successfully with all INP-specific properties', () => {
        // Given
        const id = 'test-inp-123';
        const value = 250;
        const eventName = 'click';
        const occurredAt = PerformanceTime.fromRelativeTime(100);
        const createdAt = PerformanceTime.fromRelativeTime(200);
        const data = { id, value, eventName, occurredAt, createdAt };

        // When
        const report = INPReport.create(data);

        // Then
        expect(report.id).toBe(id);
        expect(report.value).toBe(value);
        expect(report.eventName).toBe(eventName);
        expect(report.name).toBe(WEB_VITALS.INTERACTION_TO_NEXT_PAINT);
        expect(report.goodThreshold).toBe(200);
        expect(report.poorThreshold).toBe(500);
      });

      it('should be immutable after creation', () => {
        // Given
        const report = INPReportMothers.good();

        // When & Then
        expect(Object.isFrozen(report)).toBe(true);
        expect(() => {
          // @ts-expect-error Testing immutability
          report.eventName = 'modified';
        }).toThrow();
      });
    });
  });

  describe('fromPerformanceEventTimingEntry factory method', () => {
    describe('when PerformanceEventTiming entry is valid', () => {
      it('should calculate INP value from processingEnd minus startTime', () => {
        // Given
        const id = 'test-inp';
        const startTime = 1000;
        const processingEnd = 1350;
        const expectedINP = 350;
        const eventEntry = PerformanceEventTimingMother.withCustomValues({ 
          startTime, 
          processingEnd,
          name: 'click'
        });
        vi.spyOn(PerformanceTime, 'now').mockReturnValue(
          PerformanceTime.fromRelativeTime(performance.timeOrigin)
        );

        // When
        const report = INPReport.fromPerformanceEventTimingEntry(id, eventEntry);

        // Then
        expect(report.value).toBe(expectedINP);
        expect(report.eventName).toBe('click');
        expect(report.occurredAt.relativeTime).toBe(startTime);
        expect(report.createdAt.relativeTime).toBe(performance.timeOrigin);
      });
    });
  });

  describe('rating system', () => {
    it('should classify performance according to INP thresholds', () => {
      // Given
      const goodReport = INPReportMothers.withValue(150);
      const goodThresholdReport = INPReportMothers.withValue(200); // At threshold
      const needsImprovementReport = INPReportMothers.withValue(350);
      const poorThresholdReport = INPReportMothers.withValue(500); // At threshold
      const poorReport = INPReportMothers.withValue(750);

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
      const report = INPReportMothers.needsImprovement();

      // When
      const result = report.toString();

      // Then
      expect(result).toBe(`[${WEB_VITALS.INTERACTION_TO_NEXT_PAINT}]: 350ms (${RATINGS.NEEDS_IMPROVEMENT})`);
    });
  });

  describe('toJSON', () => {
    it('should include eventName in JSON serialization', () => {
      // Given
      const eventName = 'keydown';
      const report = INPReportMothers.withValue(300, eventName);

      // When
      const result = report.toJSON();

      // Then
      expect(result.eventName).toBe(eventName);
      expect(result.name).toBe(WEB_VITALS.INTERACTION_TO_NEXT_PAINT);
      expect(result.value).toBe(300);
      expect(result.goodThreshold).toBe(200);
      expect(result.poorThreshold).toBe(500);
    });
  });

  describe('edge cases', () => {
    it('should handle boundary values correctly', () => {
      // Given & When
      const zeroReport = INPReportMothers.withValue(0);
      const largeReport = INPReportMothers.withValue(10000);
      const decimalReport = INPReportMothers.withValue(200.5);

      // Then
      expect(zeroReport.rating).toBe(RATINGS.GOOD);
      expect(largeReport.rating).toBe(RATINGS.POOR);
      expect(decimalReport.rating).toBe(RATINGS.NEEDS_IMPROVEMENT);
    });

    it('should handle different event types correctly', () => {
      // Given
      const clickReport = INPReportMothers.withValue(150, 'click');
      const keyboardReport = INPReportMothers.withValue(150, 'keydown');
      const touchReport = INPReportMothers.withValue(150, 'pointerdown');

      // When & Then
      expect(clickReport.eventName).toBe('click');
      expect(keyboardReport.eventName).toBe('keydown');
      expect(touchReport.eventName).toBe('pointerdown');
      // All should have same rating for same value
      expect(clickReport.rating).toBe(RATINGS.GOOD);
      expect(keyboardReport.rating).toBe(RATINGS.GOOD);
      expect(touchReport.rating).toBe(RATINGS.GOOD);
    });
  });
});