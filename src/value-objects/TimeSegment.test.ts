import { describe, it, expect } from 'vitest';

import { TimeSegmentBuilder } from '@/test-utils/builders/TimeSegmentBuilder';
import { TimeSegmentMothers } from '@/test-utils/mothers/TimeSegmentMothers';

import { InvalidTimeSegmentException, InvalidEndTimeException } from '@/errors/TimeSegmentExceptions';

import { TimeSegment } from './TimeSegment';
import { PerformanceTime } from './PerformanceTime';

describe('TimeSegment', () => {
  describe('create', () => {
    describe('when data is valid', () => {
      it('should create TimeSegment successfully when start and end are valid', () => {
        // Given
        const start = PerformanceTime.fromRelativeTime(100);
        const end = PerformanceTime.fromRelativeTime(200);
        const data = { start, end };

        // When
        const segment = TimeSegment.create(data);

        // Then
        expect(segment.start).toBe(start);
        expect(segment.end).toBe(end);
        expect(segment.duration).toBe(100);
      });
    });
  });

  describe('fromTiming', () => {
    describe('when timing values are valid', () => {
      it('should create TimeSegment successfully when start is before end', () => {
        // Given
        const startTime = 100;
        const endTime = 200;
        const expectedDuration = 100;

        // When
        const segment = TimeSegment.fromTiming(startTime, endTime);

        // Then
        expect(segment.start.relativeTime).toBe(startTime);
        expect(segment.end.relativeTime).toBe(endTime);
        expect(segment.duration).toBe(expectedDuration);
      });

      it('should create TimeSegment successfully when start equals end', () => {
        // Given
        const time = 100;

        // When
        const segment = TimeSegment.fromTiming(time, time);

        // Then
        expect(segment.start.relativeTime).toBe(time);
        expect(segment.end.relativeTime).toBe(time);
        expect(segment.duration).toBe(0);
        expect(segment.isEmpty).toBe(true);
      });

      it('should create TimeSegment successfully when start is zero', () => {
        // Given
        const startTime = 0;
        const endTime = 50;

        // When
        const segment = TimeSegment.fromTiming(startTime, endTime);

        // Then
        expect(segment.start.relativeTime).toBe(0);
        expect(segment.duration).toBe(50);
      });
    });

    describe('when timing values are invalid', () => {
      it('should throw InvalidTimeSegmentException when start time is negative', () => {
        // Given
        const negativeStartTime = -1;
        const validEndTime = 100;

        // When & Then
        expect(() => TimeSegment.fromTiming(negativeStartTime, validEndTime))
          .toThrow(InvalidTimeSegmentException);
      });

      it('should throw InvalidTimeSegmentException when end time is negative', () => {
        // Given
        const validStartTime = 0;
        const negativeEndTime = -1;

        // When & Then
        expect(() => TimeSegment.fromTiming(validStartTime, negativeEndTime))
          .toThrow(InvalidTimeSegmentException);
      });

      it('should throw InvalidTimeSegmentException when start time is not finite', () => {
        // Given
        const infiniteStartTime = Infinity;
        const validEndTime = 100;

        // When & Then
        expect(() => TimeSegment.fromTiming(infiniteStartTime, validEndTime))
          .toThrow(InvalidTimeSegmentException);
      });

      it('should throw InvalidTimeSegmentException when end time is NaN', () => {
        // Given
        const validStartTime = 0;
        const nanEndTime = NaN;

        // When & Then
        expect(() => TimeSegment.fromTiming(validStartTime, nanEndTime))
          .toThrow(InvalidTimeSegmentException);
      });

      it('should throw InvalidEndTimeException when end time is before start time', () => {
        // Given
        const startTime = 200;
        const endTime = 100;

        // When & Then
        expect(() => TimeSegment.fromTiming(startTime, endTime))
          .toThrow(InvalidEndTimeException);
      });
    });
  });

  describe('fromTimestamps', () => {
    describe('when PerformanceTime objects are valid', () => {
      it('should create TimeSegment successfully when start is before end', () => {
        // Given
        const start = PerformanceTime.fromRelativeTime(100);
        const end = PerformanceTime.fromRelativeTime(200);

        // When
        const segment = TimeSegment.fromTimestamps(start, end);

        // Then
        expect(segment.start).toBe(start);
        expect(segment.end).toBe(end);
        expect(segment.duration).toBe(100);
      });

      it('should create TimeSegment successfully when timestamps are equal', () => {
        // Given
        const start = PerformanceTime.fromRelativeTime(100);
        const end = PerformanceTime.fromRelativeTime(100);

        // When
        const segment = TimeSegment.fromTimestamps(start, end);

        // Then
        expect(segment.isEmpty).toBe(true);
        expect(segment.duration).toBe(0);
      });
    });

    describe('when PerformanceTime objects are invalid', () => {
      it('should throw InvalidEndTimeException when end is before start', () => {
        // Given
        const start = PerformanceTime.fromRelativeTime(200);
        const end = PerformanceTime.fromRelativeTime(100);

        // When & Then
        expect(() => TimeSegment.fromTimestamps(start, end))
          .toThrow(InvalidEndTimeException);
      });
    });
  });

  describe('duration getter', () => {
    it('should calculate duration correctly for positive values', () => {
      // Given
      const segment = TimeSegmentBuilder
        .aDefault()
        .withStartTime(100)
        .withEndTime(350)
        .buildFromTiming();

      // When
      const duration = segment.duration;

      // Then
      expect(duration).toBe(250);
    });

    it('should return zero duration when start equals end', () => {
      // Given
      const segment = TimeSegmentBuilder
        .withZeroDuration()
        .buildFromTiming();

      // When
      const duration = segment.duration;

      // Then
      expect(duration).toBe(0);
    });
  });

  describe('isEmpty getter', () => {
    it('should return true when duration is zero', () => {
      // Given
      const segment = TimeSegmentMothers.zeroTimingSegment();

      // When
      const isEmpty = segment.isEmpty;

      // Then
      expect(isEmpty).toBe(true);
    });

    it('should return false when duration is greater than zero', () => {
      // Given
      const segment = TimeSegmentMothers.fastResourceLoad();

      // When
      const isEmpty = segment.isEmpty;

      // Then
      expect(isEmpty).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return human-readable format with duration and timing info', () => {
      // Given
      const segment = TimeSegmentBuilder
        .aDefault()
        .withStartTime(100)
        .withEndTime(250)
        .buildFromTiming();

      // When
      const result = segment.toString();

      // Then
      expect(result).toBe('TimeSegment: 150ms (100ms → 250ms)');
    });

    it('should handle zero duration correctly', () => {
      // Given
      const segment = TimeSegmentMothers.zeroTimingSegment();

      // When
      const result = segment.toString();

      // Then
      expect(result).toBe('TimeSegment: 0ms (100ms → 100ms)');
    });
  });

  describe('toJSON', () => {
    it('should return JSON object with duration and absolute timestamps', () => {
      // Given
      const startTime = 100;
      const endTime = 200;
      const expectedDuration = 100;
      const expectedAbsoluteStart = performance.timeOrigin + startTime;
      const expectedAbsoluteEnd = performance.timeOrigin + endTime;
      const segment = TimeSegmentBuilder
        .aDefault()
        .withStartTime(startTime)
        .withEndTime(endTime)
        .buildFromTiming();

      // When
      const result = segment.toJSON();

      // Then
      expect(result).toEqual({
        duration: expectedDuration,
        start: expectedAbsoluteStart,
        end: expectedAbsoluteEnd
      });
    });
  });

  describe('immutability', () => {
    it('should be frozen and immutable after creation', () => {
      // Given
      const segment = TimeSegmentMothers.fastResourceLoad();

      // When & Then
      expect(Object.isFrozen(segment)).toBe(true);
      expect(() => {
        // @ts-expect-error Testing immutability
        segment.duration = 999;
      }).toThrow();
    });

    it('should have immutable start and end properties', () => {
      // Given
      const segment = TimeSegmentMothers.fastResourceLoad();

      // When & Then
      expect(() => {
        // @ts-expect-error Testing immutability
        segment.start = PerformanceTime.fromRelativeTime(999);
      }).toThrow();
      
      expect(() => {
        // @ts-expect-error Testing immutability
        segment.end = PerformanceTime.fromRelativeTime(999);
      }).toThrow();
    });
  });

  describe('business logic scenarios', () => {
    describe('performance thresholds', () => {
      it('should identify fast resource loads correctly', () => {
        // Given
        const fastSegment = TimeSegmentMothers.fastResourceLoad();

        // When
        const duration = fastSegment.duration;

        // Then
        expect(duration).toBeLessThan(100); // Fast threshold
        expect(fastSegment.isEmpty).toBe(false);
      });

      it('should identify slow resource loads correctly', () => {
        // Given
        const slowSegment = TimeSegmentMothers.slowResourceLoad();

        // When
        const duration = slowSegment.duration;

        // Then
        expect(duration).toBeGreaterThan(1000); // Slow threshold
      });

      it('should identify long task timing correctly', () => {
        // Given
        const longTaskSegment = TimeSegmentMothers.longTaskSegment();

        // When
        const duration = longTaskSegment.duration;

        // Then
        expect(duration).toBeGreaterThan(50); // Long task threshold
      });
    });

    describe('typical scenarios', () => {
      it('should handle typical navigation timing', () => {
        // Given
        const navigationSegment = TimeSegmentMothers.typicalNavigationSegment();

        // When
        const duration = navigationSegment.duration;

        // Then
        expect(duration).toBeGreaterThan(0);
        expect(duration).toBeLessThan(5000); // Reasonable upper bound
        expect(navigationSegment.start.relativeTime).toBe(0); // Navigation starts at 0
      });
    });
  });
});