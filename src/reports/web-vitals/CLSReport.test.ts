import { describe, it, expect, vi } from 'vitest';

import { CLSReportMothers } from '@/test/mothers/CLSReportMothers';
import { LayoutShiftEntryMother } from '@/test/mothers/LayoutShiftEntryMother';

import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { RATINGS, WEB_VITALS } from '@/types/WebVitals';
import { CLSReport } from './CLSReport';

describe('CLSReport', () => {
  describe('create factory method', () => {
    describe('when data is valid', () => {
      it('should create CLSReport successfully with all CLS-specific properties', () => {
        // Given
        const id = 'test-cls-123';
        const value = 0.15;
        const occurredAt = PerformanceTime.fromRelativeTime(100);
        const createdAt = PerformanceTime.fromRelativeTime(200);
        const data = { id, value, occurredAt, createdAt };

        // When
        const report = CLSReport.create(data);

        // Then
        expect(report.id).toBe(id);
        expect(report.value).toBe(value);
        expect(report.name).toBe(WEB_VITALS.CUMULATIVE_LAYOUT_SHIFT);
        expect(report.goodThreshold).toBe(0.1);
        expect(report.poorThreshold).toBe(0.25);
      });

      it('should be immutable after creation', () => {
        // Given
        const report = CLSReportMothers.good();

        // When & Then
        expect(Object.isFrozen(report)).toBe(true);
        expect(() => {
          // @ts-expect-error Testing immutability
          report.value = 999;
        }).toThrow();
      });
    });
  });

  describe('fromLayoutShiftEntry factory method', () => {
    describe('when LayoutShiftEntry is valid', () => {
      it('should create report using entry value as report value and startTime as occurredAt', () => {
        // Given
        const id = 'cls-from-entry-123';
        const entryValue = 0.12;
        const startTime = 1500;
        const layoutEntry = LayoutShiftEntryMother.withCustomValues({ 
          value: entryValue, 
          startTime 
        });
        vi.spyOn(PerformanceTime, 'now').mockReturnValue(
          PerformanceTime.fromRelativeTime(performance.timeOrigin)
        );

        // When
        const report = CLSReport.fromLayoutShiftEntry(id, layoutEntry);

        // Then
        expect(report.id).toBe(id);
        expect(report.value).toBe(entryValue);
        expect(report.occurredAt.relativeTime).toBe(startTime);
        expect(report.createdAt.relativeTime).toBe(performance.timeOrigin);
      });
    });
  });

  describe('rating system', () => {
    it('should classify performance according to CLS thresholds', () => {
      // Given
      const goodReport = CLSReportMothers.withValue(0.05);
      const goodThresholdReport = CLSReportMothers.withValue(0.1); // At threshold
      const needsImprovementReport = CLSReportMothers.withValue(0.18);
      const poorThresholdReport = CLSReportMothers.withValue(0.25); // At threshold
      const poorReport = CLSReportMothers.withValue(0.35);

      // When & Then
      expect(goodReport.rating).toBe(RATINGS.GOOD);
      expect(goodThresholdReport.rating).toBe(RATINGS.NEEDS_IMPROVEMENT);
      expect(needsImprovementReport.rating).toBe(RATINGS.NEEDS_IMPROVEMENT);
      expect(poorThresholdReport.rating).toBe(RATINGS.POOR);
      expect(poorReport.rating).toBe(RATINGS.POOR);
    });
  });

  describe('toString', () => {
    it('should return formatted string with metric name value and rating without brackets or ms unit', () => {
      // Given
      const report = CLSReportMothers.needsImprovement();

      // When
      const result = report.toString();

      // Then
      expect(result).toBe(`${WEB_VITALS.CUMULATIVE_LAYOUT_SHIFT}: 0.18 (${RATINGS.NEEDS_IMPROVEMENT})`);
      expect(result).not.toContain('[');
      expect(result).not.toContain('ms');
    });

    it('should format different CLS values correctly', () => {
      // Given
      const goodReport = CLSReportMothers.good();
      const poorReport = CLSReportMothers.poor();

      // When
      const goodResult = goodReport.toString();
      const poorResult = poorReport.toString();

      // Then
      expect(goodResult).toBe(`${WEB_VITALS.CUMULATIVE_LAYOUT_SHIFT}: 0.05 (${RATINGS.GOOD})`);
      expect(poorResult).toBe(`${WEB_VITALS.CUMULATIVE_LAYOUT_SHIFT}: 0.35 (${RATINGS.POOR})`);
    });
  });

  describe('toJSON', () => {
    it('should return complete JSON representation with all CLS properties', () => {
      // Given
      const report = CLSReportMothers.needsImprovement();

      // When
      const result = report.toJSON();

      // Then
      expect(result).toEqual({
        id: 'cls-needs-improvement',
        name: WEB_VITALS.CUMULATIVE_LAYOUT_SHIFT,
        value: 0.18,
        createdAt: report.createdAt.absoluteTime,
        occurredAt: report.occurredAt.absoluteTime,
        rating: RATINGS.NEEDS_IMPROVEMENT,
        goodThreshold: 0.1,
        poorThreshold: 0.25
      });
      expect(typeof result.createdAt).toBe('number');
      expect(result.createdAt).toBeGreaterThan(performance.timeOrigin);
    });
  });

  describe('edge cases', () => {
    it('should handle boundary values correctly', () => {
      // Given & When
      const zeroReport = CLSReportMothers.withValue(0);
      const largeReport = CLSReportMothers.withValue(1.5);
      const preciseDecimalReport = CLSReportMothers.withValue(0.099999);

      // Then
      expect(zeroReport.rating).toBe(RATINGS.GOOD);
      expect(largeReport.rating).toBe(RATINGS.POOR);
      expect(preciseDecimalReport.rating).toBe(RATINGS.GOOD); // Just under threshold
    });

    it('should handle very small decimal values correctly', () => {
      // Given
      const verySmallReport = CLSReportMothers.withValue(0.001);
      const exactThresholdReport = CLSReportMothers.withValue(0.1);
      const slightlyOverThresholdReport = CLSReportMothers.withValue(0.10001);

      // When & Then
      expect(verySmallReport.rating).toBe(RATINGS.GOOD);
      expect(exactThresholdReport.rating).toBe(RATINGS.NEEDS_IMPROVEMENT);
      expect(slightlyOverThresholdReport.rating).toBe(RATINGS.NEEDS_IMPROVEMENT);
    });
  });

  describe('CLS-specific scenarios from Performance API', () => {
    it('should create report from various layout shift scenarios correctly', () => {
      // Given
      const lowImpactShift = LayoutShiftEntryMother.withLowImpact();
      const highImpactShift = LayoutShiftEntryMother.withHighImpact();
      const mediumImpactShift = LayoutShiftEntryMother.withMediumImpact();

      // When
      const lowReport = CLSReport.fromLayoutShiftEntry('low', lowImpactShift);
      const highReport = CLSReport.fromLayoutShiftEntry('high', highImpactShift);
      const mediumReport = CLSReport.fromLayoutShiftEntry('medium', mediumImpactShift);

      // Then
      expect(lowReport.rating).toBe(RATINGS.GOOD);
      expect(lowReport.value).toBe(0.02);
      
      expect(highReport.rating).toBe(RATINGS.POOR);
      expect(highReport.value).toBe(0.35);
      
      expect(mediumReport.rating).toBe(RATINGS.NEEDS_IMPROVEMENT);
      expect(mediumReport.value).toBe(0.18);
    });

    it('should handle layout shifts with user input correctly', () => {
      // Given
      const userInputShift = LayoutShiftEntryMother.withUserInput();

      // When
      const report = CLSReport.fromLayoutShiftEntry('user-input', userInputShift);

      // Then
      expect(report.value).toBe(0.15); // Value is still recorded
      expect(report.rating).toBe(RATINGS.NEEDS_IMPROVEMENT);
      // Note: The logic for filtering user-input shifts would be in the collector, not the report
    });
  });
});