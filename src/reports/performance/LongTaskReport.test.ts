import { describe, it, expect, vi } from 'vitest';

import { LongTaskReportMothers } from '@/test-utils/mothers/LongTaskReportMothers';
import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { LongTaskReport } from './LongTaskReport';

describe('LongTaskReport', () => {
  describe('create factory method', () => {
    it('should create LongTaskReport with provided data', () => {
      // Given
      const data = LongTaskReportMothers.mediumSeverity();

      // When
      const report = LongTaskReport.create(data);

      // Then
      expect(report.id).toBe(data.id);
      expect(report.createdAt).toBe(data.createdAt);
      expect(report.occurredAt).toBe(data.occurredAt);
      expect(report.duration).toBe(150);
      expect(report.name).toBe('self');
      expect(report.attribution).toEqual(data.attribution);
    });

    it('should freeze the created report instance', () => {
      // Given
      const data = LongTaskReportMothers.lowSeverity();

      // When
      const report = LongTaskReport.create(data);

      // Then
      expect(Object.isFrozen(report)).toBe(true);
    });
  });

  describe('fromPerformanceLongTaskTimingEntry factory method', () => {
    it('should create LongTaskReport from PerformanceLongTaskTimingEntry data', () => {
      // Given
      const id = 'test-long-task';
      const entry = LongTaskReportMothers.createPerformanceLongTaskTimingEntry('high');
      vi.spyOn(PerformanceTime, 'now').mockReturnValue(
        PerformanceTime.fromAbsoluteTime(performance.timeOrigin)
      );

      // When
      const report = LongTaskReport.fromPerformanceLongTaskTimingEntry(id, entry);

      // Then
      expect(report.id).toBe(id);
      expect(report.duration).toBe(350);
      expect(report.name).toBe('self');
      expect(report.attribution).toHaveLength(2);
      expect(report.attribution?.[0].containerType).toBe('iframe');
      expect(report.attribution?.[1].containerType).toBe('script');
    });

    it('should handle entries without attribution correctly', () => {
      // Given
      const id = 'test-no-attribution';
      const entry = LongTaskReportMothers.createPerformanceLongTaskTimingEntry('noAttr');

      // When
      const report = LongTaskReport.fromPerformanceLongTaskTimingEntry(id, entry);

      // Then
      expect(report.attribution).toEqual([]);
    });
  });

  describe('severity classification', () => {
    it('should classify duration 50-99ms as low severity', () => {
      // Given
      const data = LongTaskReportMothers.lowSeverity();
      const report = LongTaskReport.create(data);

      // When
      const severity = report.severity;

      // Then
      expect(severity).toBe('low'); // 75ms
    });

    it('should classify duration 100-199ms as medium severity', () => {
      // Given
      const data = LongTaskReportMothers.mediumSeverity();
      const report = LongTaskReport.create(data);

      // When
      const severity = report.severity;

      // Then
      expect(severity).toBe('medium'); // 150ms
    });

    it('should classify duration 200ms+ as high severity', () => {
      // Given
      const data = LongTaskReportMothers.highSeverity();
      const report = LongTaskReport.create(data);

      // When
      const severity = report.severity;

      // Then
      expect(severity).toBe('high'); // 350ms
    });

    it('should handle boundary cases correctly', () => {
      // Given
      const boundary100 = LongTaskReport.create(LongTaskReportMothers.boundary100ms());
      const boundary200 = LongTaskReport.create(LongTaskReportMothers.boundary200ms());

      // When & Then
      expect(boundary100.severity).toBe('medium'); // Exactly 100ms
      expect(boundary200.severity).toBe('high');   // Exactly 200ms
    });
  });

  describe('computed getters', () => {
    it('should calculate correct endTime', () => {
      // Given
      const data = LongTaskReportMothers.mediumSeverity();
      const report = LongTaskReport.create(data);

      // When
      const endTime = report.endTime;

      // Then
      expect(endTime.relativeTime).toBe(2150); // startTime 2000 + duration 150
    });

    it('should detect when attribution is available', () => {
      // Given
      const withAttribution = LongTaskReport.create(LongTaskReportMothers.highSeverity());
      const withoutAttribution = LongTaskReport.create(LongTaskReportMothers.noAttribution());

      // When & Then
      expect(withAttribution.hasAttribution).toBe(true);  // Has attribution array
      expect(withoutAttribution.hasAttribution).toBe(false); // attribution is undefined
    });

    it('should handle empty attribution array correctly', () => {
      // Given
      const data = LongTaskReportMothers.boundary200ms();
      const report = LongTaskReport.create(data);

      // When
      const hasAttribution = report.hasAttribution;

      // Then
      expect(hasAttribution).toBe(false); // Empty array
    });
  });

  describe('toString', () => {
    it('should return formatted string with severity and timing info', () => {
      // Given
      const scenarios = [
        { data: LongTaskReportMothers.lowSeverity(), expected: 'Long Task [LOW]: 75ms at 1000ms' },
        { data: LongTaskReportMothers.mediumSeverity(), expected: 'Long Task [MEDIUM]: 150ms at 2000ms' },
        { data: LongTaskReportMothers.highSeverity(), expected: 'Long Task [HIGH]: 350ms at 3000ms' }
      ];

      scenarios.forEach(({ data, expected }) => {
        // When
        const report = LongTaskReport.create(data);
        const result = report.toString();

        // Then
        expect(result).toBe(expected);
      });
    });
  });

  describe('toJSON', () => {
    it('should return complete object representation with all properties', () => {
      // Given
      const data = LongTaskReportMothers.highSeverity();
      const report = LongTaskReport.create(data);

      // When
      const jsonRepresentation = report.toJSON();

      // Then
      expect(jsonRepresentation).toEqual({
        // Basic metadata
        id: 'high-long-task-003',
        createdAt: data.createdAt.absoluteTime,
        occurredAt: data.occurredAt.absoluteTime,

        // Task properties
        duration: data.duration,
        name: data.name,
        attribution: data.attribution,

        // Computed properties
        endTime: data.occurredAt.add(data.duration).absoluteTime,
        severity: 'high',
        hasAttribution: true
      });
    });

    it('should handle task without attribution correctly', () => {
      // Given
      const data = LongTaskReportMothers.noAttribution();
      const report = LongTaskReport.create(data);

      // When
      const jsonRepresentation = report.toJSON();

      // Then
      expect(jsonRepresentation.attribution).toBeUndefined();
      expect(jsonRepresentation.hasAttribution).toBe(false);
      expect(jsonRepresentation.severity).toBe('medium'); // 120ms
    });
  });

  describe('edge cases', () => {
    it('should handle minimal long task correctly', () => {
      // Given
      const data = LongTaskReportMothers.minimal();
      const report = LongTaskReport.create(data);

      // When & Then
      expect(report.duration).toBe(50);
      expect(report.severity).toBe('low');
      expect(report.hasAttribution).toBe(false);
      expect(report.toString()).toBe('Long Task [LOW]: 50ms at 0ms');
    });

    it('should maintain immutability when accessing computed properties', () => {
      // Given
      const data = LongTaskReportMothers.mediumSeverity();
      const report = LongTaskReport.create(data);

      // When
      const severity1 = report.severity;
      const severity2 = report.severity;
      const endTime1 = report.endTime;
      const endTime2 = report.endTime;

      // Then
      expect(severity1).toBe(severity2);
      expect(endTime1).toStrictEqual(endTime2);
      expect(Object.isFrozen(report)).toBe(true);
    });

    it('should handle boundary cases consistently', () => {
      // Given
      const boundary100 = LongTaskReport.create(LongTaskReportMothers.boundary100ms());
      const boundary200 = LongTaskReport.create(LongTaskReportMothers.boundary200ms());

      // When & Then
      expect(boundary100.toString()).toBe('Long Task [MEDIUM]: 100ms at 5000ms');
      expect(boundary200.toString()).toBe('Long Task [HIGH]: 200ms at 6000ms');
    });
  });
});
