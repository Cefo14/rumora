import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

import { PerformanceTimeBuilder } from '@/test-utils/builders/PerformanceTimeBuilder';
import { setupPerformanceAPI, cleanupPerformanceAPI, getExpectedAbsoluteTime } from '@/test-utils/performanceHelpers';

import { InvalidPerformanceTimeException } from '@/errors/PerformanceTimeExceptions';
import { UnsupportedPerformanceAPIException } from '@/errors/UnsupportedExceptions';

import { PerformanceTime } from './PerformanceTime';

describe('PerformanceTime', () => {
  beforeEach(() => {
    setupPerformanceAPI();
  });

  afterEach(() => {
    cleanupPerformanceAPI();
  });

  describe('fromRelativeTime', () => {
    describe('when performance API is available', () => {
      it('should create instance successfully when time is valid positive number', () => {
        // Given
        const validRelativeTime = 100.5;

        // When
        const performanceTime = PerformanceTime.fromRelativeTime(validRelativeTime);

        // Then
        expect(performanceTime.relativeTime).toBe(validRelativeTime);
        expect(performanceTime.absoluteTime).toBe(getExpectedAbsoluteTime(validRelativeTime));
      });

      it('should create instance successfully when time is zero', () => {
        // Given
        const zeroTime = 0;

        // When
        const performanceTime = PerformanceTime.fromRelativeTime(zeroTime);

        // Then
        expect(performanceTime.relativeTime).toBe(0);
        expect(performanceTime.absoluteTime).toBe(performance.timeOrigin);
      });

      it('should throw InvalidPerformanceTimeException when time is negative', () => {
        // Given
        const negativeTime = -1;

        // When & Then
        expect(() => PerformanceTime.fromRelativeTime(negativeTime))
          .toThrow(InvalidPerformanceTimeException);
      });

      it('should throw InvalidPerformanceTimeException when time is not finite', () => {
        // Given
        const infiniteTime = Infinity;

        // When & Then
        expect(() => PerformanceTime.fromRelativeTime(infiniteTime))
          .toThrow(InvalidPerformanceTimeException);
      });

      it('should throw InvalidPerformanceTimeException when time is NaN', () => {
        // Given
        const nanTime = NaN;

        // When & Then
        expect(() => PerformanceTime.fromRelativeTime(nanTime))
          .toThrow(InvalidPerformanceTimeException);
      });
    });

    describe('when performance API is not available', () => {
      beforeEach(() => {
        // Given: Performance API is not available
        vi.stubGlobal('performance', undefined);
      });

      afterEach(() => {
        vi.unstubAllGlobals();
      });

      it('should throw UnsupportedPerformanceAPIException when performance is undefined', () => {
        // Given
        vi.stubGlobal('performance', undefined);
        const validTime = 100;

        // When & Then
        expect(() => PerformanceTime.fromRelativeTime(validTime))
          .toThrow(UnsupportedPerformanceAPIException);

        // Cleanup
        vi.unstubAllGlobals();
      });
    });
  });

  describe('fromAbsoluteTime', () => {
    describe('when performance API is available', () => {
      it('should create instance successfully when absolute time is valid', () => {
        // Given
        const absoluteTime = performance.timeOrigin + 500;
        const expectedRelativeTime = 500;

        // When
        const performanceTime = PerformanceTime.fromAbsoluteTime(absoluteTime);

        // Then
        expect(performanceTime.absoluteTime).toBe(absoluteTime);
        expect(performanceTime.relativeTime).toBe(expectedRelativeTime);
      });

      it('should handle absolute time before timeOrigin by setting relative to zero', () => {
        // Given
        const absoluteTimeBeforeOrigin = performance.timeOrigin - 100;

        // When
        const performanceTime = PerformanceTime.fromAbsoluteTime(absoluteTimeBeforeOrigin);

        // Then
        expect(performanceTime.relativeTime).toBe(0);
        expect(performanceTime.absoluteTime).toBe(performance.timeOrigin);
      });

      it('should throw InvalidPerformanceTimeException when absolute time is invalid', () => {
        // Given
        const invalidAbsoluteTime = -1;

        // When & Then
        expect(() => PerformanceTime.fromAbsoluteTime(invalidAbsoluteTime))
          .toThrow(InvalidPerformanceTimeException);
      });
    });
  });

  describe('now', () => {
    it('should create instance with current performance.now() value', () => {
      // Given
      const customCurrentTime = 1500;
      vi.spyOn(performance, 'now').mockReturnValue(customCurrentTime);

      // When
      const performanceTime = PerformanceTime.now();

      // Then
      expect(performanceTime.relativeTime).toBe(customCurrentTime);
      expect(performance.now).toHaveBeenCalledTimes(1);
    });
  });

  describe('equals', () => {
    it('should return true when both times have same relative time', () => {
      // Given
      const time1 = PerformanceTimeBuilder.aDefault().buildFromRelative();
      const time2 = PerformanceTimeBuilder.aDefault().buildFromRelative();

      // When
      const result = time1.equals(time2);

      // Then
      expect(result).toBe(true);
    });

    it('should return false when times have different relative time', () => {
      // Given
      const time1 = PerformanceTimeBuilder.aDefault().withRelativeTime(100).buildFromRelative();
      const time2 = PerformanceTimeBuilder.aDefault().withRelativeTime(200).buildFromRelative();

      // When
      const result = time1.equals(time2);

      // Then
      expect(result).toBe(false);
    });
  });

  describe('comparison methods', () => {
    describe('isGreaterThan', () => {
      it('should return true when this time is greater than other', () => {
        // Given
        const laterTime = PerformanceTimeBuilder.aDefault().withRelativeTime(200).buildFromRelative();
        const earlierTime = PerformanceTimeBuilder.aDefault().withRelativeTime(100).buildFromRelative();

        // When
        const result = laterTime.isGreaterThan(earlierTime);

        // Then
        expect(result).toBe(true);
      });

      it('should return false when this time is less than other', () => {
        // Given
        const earlierTime = PerformanceTimeBuilder.aDefault().withRelativeTime(100).buildFromRelative();
        const laterTime = PerformanceTimeBuilder.aDefault().withRelativeTime(200).buildFromRelative();

        // When
        const result = earlierTime.isGreaterThan(laterTime);

        // Then
        expect(result).toBe(false);
      });

      it('should return false when times are equal', () => {
        // Given
        const time1 = PerformanceTimeBuilder.aDefault().withRelativeTime(100).buildFromRelative();
        const time2 = PerformanceTimeBuilder.aDefault().withRelativeTime(100).buildFromRelative();

        // When
        const result = time1.isGreaterThan(time2);

        // Then
        expect(result).toBe(false);
      });
    });

    describe('isGreaterThanOrEqual', () => {
      it('should return true when this time is greater than other', () => {
        // Given
        const laterTime = PerformanceTimeBuilder.aDefault().withRelativeTime(200).buildFromRelative();
        const earlierTime = PerformanceTimeBuilder.aDefault().withRelativeTime(100).buildFromRelative();

        // When
        const result = laterTime.isGreaterThanOrEqual(earlierTime);

        // Then
        expect(result).toBe(true);
      });

      it('should return true when times are equal', () => {
        // Given
        const time1 = PerformanceTimeBuilder.aDefault().withRelativeTime(100).buildFromRelative();
        const time2 = PerformanceTimeBuilder.aDefault().withRelativeTime(100).buildFromRelative();

        // When
        const result = time1.isGreaterThanOrEqual(time2);

        // Then
        expect(result).toBe(true);
      });
    });

    // Similar patterns for isLessThan and isLessThanOrEqual
  });

  describe('mathematical operations', () => {
    describe('add', () => {
      it('should add numeric value correctly', () => {
        // Given
        const baseTime = PerformanceTimeBuilder.aDefault().withRelativeTime(100).buildFromRelative();
        const valueToAdd = 50;

        // When
        const result = baseTime.add(valueToAdd);

        // Then
        expect(result.relativeTime).toBe(150);
        expect(result.absoluteTime).toBe(performance.timeOrigin + 150);
      });

      it('should add PerformanceTime value correctly', () => {
        // Given
        const baseTime = PerformanceTimeBuilder.aDefault().withRelativeTime(100).buildFromRelative();
        const timeToAdd = PerformanceTimeBuilder.aDefault().withRelativeTime(50).buildFromRelative();

        // When
        const result = baseTime.add(timeToAdd);

        // Then
        expect(result.relativeTime).toBe(150);
      });
    });

    describe('subtract', () => {
      it('should subtract numeric value correctly', () => {
        // Given
        const baseTime = PerformanceTimeBuilder.aDefault().withRelativeTime(100).buildFromRelative();
        const valueToSubtract = 30;

        // When
        const result = baseTime.subtract(valueToSubtract);

        // Then
        expect(result.relativeTime).toBe(70);
      });

      it('should subtract PerformanceTime value correctly', () => {
        // Given
        const baseTime = PerformanceTimeBuilder.aDefault().withRelativeTime(100).buildFromRelative();
        const timeToSubtract = PerformanceTimeBuilder.aDefault().withRelativeTime(30).buildFromRelative();

        // When
        const result = baseTime.subtract(timeToSubtract);

        // Then
        expect(result.relativeTime).toBe(70);
      });
    });
  });

  describe('serialization', () => {
    describe('toString', () => {
      it('should return absolute time as string', () => {
        // Given
        const relativeTime = 100;
        const expectedAbsoluteTime = performance.timeOrigin + relativeTime;
        const performanceTime = PerformanceTimeBuilder.aDefault()
          .withRelativeTime(relativeTime)
          .buildFromRelative();

        // When
        const result = performanceTime.toString();

        // Then
        expect(result).toBe(expectedAbsoluteTime.toString());
      });
    });

    describe('toJSON', () => {
      it('should return object with both absolute and relative times', () => {
        // Given
        const relativeTime = 100;
        const expectedAbsoluteTime = performance.timeOrigin + relativeTime;
        const performanceTime = PerformanceTimeBuilder.aDefault()
          .withRelativeTime(relativeTime)
          .buildFromRelative();

        // When
        const result = performanceTime.toJSON();

        // Then
        expect(result).toEqual({
          absolute: expectedAbsoluteTime,
          relative: relativeTime
        });
      });
    });
  });

  describe('immutability', () => {
    it('should be frozen and immutable after creation', () => {
      // Given
      const performanceTime = PerformanceTimeBuilder.aDefault().buildFromRelative();
      // When & Then
      expect(Object.isFrozen(performanceTime)).toBe(true);
      expect(() => {
        // @ts-expect-error Testing immutability
        performanceTime.relativeTime = 999;
      }).toThrow();
    });
  });
});