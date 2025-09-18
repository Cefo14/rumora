import { describe, it, expect, vi } from 'vitest';

import { INPReportMothers } from '@/test-utils/mothers/INPReportMothers';
import { PerformanceEventTimingMother } from '@/test-utils/mothers/PerformanceEventTimingMother';
import { PERFORMANCE_TIMESTAMPS } from '@/test-utils/performanceHelpers';

import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { RATINGS, WEB_VITALS } from '@/types/WebVitals';
import { INPReport } from './INPReport';

describe('INPReport', () => {
  describe('create factory method', () => {
    describe('when data is valid', () => {
      it('should create INPReport successfully when all properties are provided', () => {
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
        expect(report.occurredAt).toBe(occurredAt);
        expect(report.createdAt).toBe(createdAt);
      });

      it('should have correct INP-specific properties when created', () => {
        // Given
        const report = INPReportMothers.good();

        // When & Then
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
          report.value = 999;
        }).toThrow();
        expect(() => {
          // @ts-expect-error Testing immutability
          report.eventName = 'modified';
        }).toThrow();
      });
    });
  });

  describe('fromPerformanceEventTimingEntry factory method', () => {
    describe('when PerformanceEventTiming entry is valid', () => {
      it('should create report from PerformanceEventTiming entry', () => {
        // Given
        const id = 'inp-from-entry-123';
        const eventEntry = PerformanceEventTimingMother.aDefault();
        const expectedValue = eventEntry.processingEnd - eventEntry.startTime;
        vi.spyOn(PerformanceTime, 'now').mockReturnValue(
          PerformanceTime.fromRelativeTime(PERFORMANCE_TIMESTAMPS.CURRENT_TIME)
        );

        // When
        const report = INPReport.fromPerformanceEventTimingEntry(id, eventEntry);

        // Then
        expect(report.id).toBe(id);
        expect(report.value).toBe(expectedValue);
        expect(report.eventName).toBe(eventEntry.name);
        expect(report.occurredAt.relativeTime).toBe(eventEntry.startTime);
        expect(report.createdAt.relativeTime).toBe(PERFORMANCE_TIMESTAMPS.CURRENT_TIME);
      });

      it('should calculate INP value correctly from processingEnd minus startTime', () => {
        // Given
        const id = 'test-inp';
        const startTime = 1000;
        const processingEnd = 1300;
        const expectedINP = 300; // processingEnd - startTime
        const eventEntry = PerformanceEventTimingMother.withCustomValues({ 
          startTime, 
          processingEnd,
          name: 'click'
        });

        // When
        const report = INPReport.fromPerformanceEventTimingEntry(id, eventEntry);

        // Then
        expect(report.value).toBe(expectedINP);
        expect(report.eventName).toBe('click');
        expect(report.occurredAt.relativeTime).toBe(startTime);
      });

      it('should handle fast interaction correctly', () => {
        // Given
        const id = 'fast-inp';
        const fastEntry = PerformanceEventTimingMother.withFastInteraction();

        // When
        const report = INPReport.fromPerformanceEventTimingEntry(id, fastEntry);

        // Then
        expect(report.value).toBe(80); // Fast interaction duration
        expect(report.rating).toBe(RATINGS.GOOD);
        expect(report.eventName).toBe('click');
      });

      it('should handle slow interaction correctly', () => {
        // Given
        const id = 'slow-inp';
        const slowEntry = PerformanceEventTimingMother.withSlowInteraction();

        // When
        const report = INPReport.fromPerformanceEventTimingEntry(id, slowEntry);

        // Then
        expect(report.value).toBe(600); // Slow interaction duration
        expect(report.rating).toBe(RATINGS.POOR);
      });

      it('should handle keyboard interactions correctly', () => {
        // Given
        const id = 'keyboard-inp';
        const keyboardEntry = PerformanceEventTimingMother.withKeyboardInteraction();

        // When
        const report = INPReport.fromPerformanceEventTimingEntry(id, keyboardEntry);

        // Then
        expect(report.value).toBe(250);
        expect(report.eventName).toBe('keydown');
        expect(report.rating).toBe(RATINGS.NEEDS_IMPROVEMENT);
      });

      it('should handle touch interactions correctly', () => {
        // Given
        const id = 'touch-inp';
        const touchEntry = PerformanceEventTimingMother.withTouchInteraction();

        // When
        const report = INPReport.fromPerformanceEventTimingEntry(id, touchEntry);

        // Then
        expect(report.value).toBe(180);
        expect(report.eventName).toBe('pointerdown');
        expect(report.rating).toBe(RATINGS.GOOD);
      });
    });
  });

  describe('rating system', () => {
    describe('when performance is good', () => {
      it('should return GOOD rating when value is below good threshold', () => {
        // Given
        const report = INPReportMothers.good(); // 150ms

        // When
        const rating = report.rating;

        // Then
        expect(rating).toBe(RATINGS.GOOD);
        expect(report.isGood).toBe(true);
        expect(report.isNeedsImprovement).toBe(false);
        expect(report.isPoor).toBe(false);
      });

      it('should return GOOD rating when value is just below good threshold', () => {
        // Given
        const report = INPReportMothers.withValue(199); // Just below threshold

        // When
        const rating = report.rating;

        // Then
        expect(rating).toBe(RATINGS.GOOD);
        expect(report.value).toBe(199);
        expect(report.isGood).toBe(true);
      });
    });

    describe('when performance needs improvement', () => {
      it('should return NEEDS_IMPROVEMENT rating when value is at good threshold', () => {
        // Given
        const report = INPReportMothers.withValue(200); // Exactly at threshold

        // When
        const rating = report.rating;

        // Then
        expect(rating).toBe(RATINGS.NEEDS_IMPROVEMENT);
        expect(report.isGood).toBe(false);
        expect(report.isNeedsImprovement).toBe(true);
        expect(report.isPoor).toBe(false);
      });

      it('should return NEEDS_IMPROVEMENT rating when value is between thresholds', () => {
        // Given
        const report = INPReportMothers.needsImprovement(); // 350ms

        // When
        const rating = report.rating;

        // Then
        expect(rating).toBe(RATINGS.NEEDS_IMPROVEMENT);
        expect(report.value).toBe(350);
        expect(report.isNeedsImprovement).toBe(true);
      });

      it('should return NEEDS_IMPROVEMENT rating when value is just below poor threshold', () => {
        // Given
        const report = INPReportMothers.withValue(499); // Just below poor threshold

        // When
        const rating = report.rating;

        // Then
        expect(rating).toBe(RATINGS.NEEDS_IMPROVEMENT);
        expect(report.isNeedsImprovement).toBe(true);
      });
    });

    describe('when performance is poor', () => {
      it('should return POOR rating when value is at poor threshold', () => {
        // Given
        const report = INPReportMothers.withValue(500); // Exactly at threshold

        // When
        const rating = report.rating;

        // Then
        expect(rating).toBe(RATINGS.POOR);
        expect(report.isGood).toBe(false);
        expect(report.isNeedsImprovement).toBe(false);
        expect(report.isPoor).toBe(true);
      });

      it('should return POOR rating when value is above poor threshold', () => {
        // Given
        const report = INPReportMothers.poor(); // 750ms

        // When
        const rating = report.rating;

        // Then
        expect(rating).toBe(RATINGS.POOR);
        expect(report.value).toBe(750);
        expect(report.isPoor).toBe(true);
      });
    });
  });

  describe('toString', () => {
    it('should return formatted string with name value and rating for good performance', () => {
      // Given
      const report = INPReportMothers.good();

      // When
      const result = report.toString();

      // Then
      expect(result).toBe(`[${WEB_VITALS.INTERACTION_TO_NEXT_PAINT}]: 150ms (${RATINGS.GOOD})`);
    });

    it('should return formatted string with name value and rating for needs improvement performance', () => {
      // Given
      const report = INPReportMothers.needsImprovement();

      // When
      const result = report.toString();

      // Then
      expect(result).toBe(`[${WEB_VITALS.INTERACTION_TO_NEXT_PAINT}]: 350ms (${RATINGS.NEEDS_IMPROVEMENT})`);
    });

    it('should return formatted string with name value and rating for poor performance', () => {
      // Given
      const report = INPReportMothers.poor();

      // When
      const result = report.toString();

      // Then
      expect(result).toBe(`[${WEB_VITALS.INTERACTION_TO_NEXT_PAINT}]: 750ms (${RATINGS.POOR})`);
    });
  });

  describe('toJSON', () => {
    it('should return complete JSON representation with all properties including eventName', () => {
      // Given
      const report = INPReportMothers.needsImprovement();

      // When
      const result = report.toJSON();

      // Then
      expect(result).toEqual({
        id: 'inp-needs-improvement',
        name: WEB_VITALS.INTERACTION_TO_NEXT_PAINT,
        value: 350,
        createdAt: report.createdAt.absoluteTime,
        occurredAt: report.occurredAt.absoluteTime,
        rating: RATINGS.NEEDS_IMPROVEMENT,
        goodThreshold: 200,
        poorThreshold: 500,
        eventName: 'keydown'
      });
    });

    it('should include absolute timestamps in JSON serialization', () => {
      // Given
      const report = INPReportMothers.good();

      // When
      const result = report.toJSON();

      // Then
      expect(typeof result.createdAt).toBe('number');
      expect(typeof result.occurredAt).toBe('number');
      expect(result.createdAt).toBeGreaterThan(PERFORMANCE_TIMESTAMPS.TIME_ORIGIN);
      expect(result.occurredAt).toBeGreaterThan(PERFORMANCE_TIMESTAMPS.TIME_ORIGIN);
    });

    it('should include eventName property in JSON representation', () => {
      // Given
      const customEventName = 'custom-event';
      const report = INPReportMothers.withValue(300, customEventName);

      // When
      const result = report.toJSON();

      // Then
      expect(result.eventName).toBe(customEventName);
      expect(result).toHaveProperty('eventName');
    });
  });

  describe('edge cases', () => {
    it('should handle zero value correctly', () => {
      // Given
      const report = INPReportMothers.withValue(0);

      // When & Then
      expect(report.value).toBe(0);
      expect(report.rating).toBe(RATINGS.GOOD);
      expect(report.isGood).toBe(true);
    });

    it('should handle very large values correctly', () => {
      // Given
      const largeValue = 10000; // 10 seconds
      const report = INPReportMothers.withValue(largeValue);

      // When & Then
      expect(report.value).toBe(largeValue);
      expect(report.rating).toBe(RATINGS.POOR);
      expect(report.isPoor).toBe(true);
    });

    it('should handle decimal values correctly', () => {
      // Given
      const decimalValue = 200.5;
      const report = INPReportMothers.withValue(decimalValue);

      // When & Then
      expect(report.value).toBe(decimalValue);
      expect(report.rating).toBe(RATINGS.NEEDS_IMPROVEMENT); // >= 200
    });

    it('should handle different event types correctly', () => {
      // Given
      const events = ['click', 'keydown', 'pointerdown', 'touchstart'];
      
      events.forEach(eventName => {
        // When
        const report = INPReportMothers.withValue(150, eventName);

        // Then
        expect(report.eventName).toBe(eventName);
        expect(report.rating).toBe(RATINGS.GOOD);
      });
    });
  });

  describe('real-world scenarios', () => {
    it('should correctly classify fast button click interactions', () => {
      // Given
      const report = INPReportMothers.good();

      // When & Then
      expect(report.value).toBe(150);
      expect(report.eventName).toBe('click');
      expect(report.rating).toBe(RATINGS.GOOD);
      expect(report.name).toBe(WEB_VITALS.INTERACTION_TO_NEXT_PAINT);
    });

    it('should correctly classify slow form input interactions', () => {
      // Given
      const report = INPReportMothers.needsImprovement();

      // When & Then
      expect(report.value).toBe(350);
      expect(report.eventName).toBe('keydown');
      expect(report.rating).toBe(RATINGS.NEEDS_IMPROVEMENT);
    });

    it('should handle heavy JavaScript processing correctly', () => {
      // Given
      const report = INPReportMothers.poor();

      // When & Then
      expect(report.value).toBe(750);
      expect(report.rating).toBe(RATINGS.POOR);
      expect(report.isPoor).toBe(true);
    });

    it('should handle mobile touch interactions correctly', () => {
      // Given
      const report = INPReportMothers.withValue(180, 'pointerdown');

      // When & Then
      expect(report.value).toBe(180);
      expect(report.eventName).toBe('pointerdown');
      expect(report.rating).toBe(RATINGS.GOOD);
    });
  });

  describe('INP-specific scenarios from Performance API', () => {
    it('should create report from custom event timing entry correctly', () => {
      // Given
      const id = 'custom-inp';
      const customEntry = PerformanceEventTimingMother.withCustomValues({
        name: 'custom-event',
        startTime: 2000,
        processingEnd: 2400 // 400ms INP
      });

      // When
      const report = INPReport.fromPerformanceEventTimingEntry(id, customEntry);

      // Then
      expect(report.value).toBe(400);
      expect(report.eventName).toBe('custom-event');
      expect(report.rating).toBe(RATINGS.NEEDS_IMPROVEMENT);
    });

    it('should handle complex interaction scenarios correctly', () => {
      // Given
      const fastClick = PerformanceEventTimingMother.withFastInteraction();
      const slowKeyboard = PerformanceEventTimingMother.withSlowInteraction();

      // When
      const fastReport = INPReport.fromPerformanceEventTimingEntry('fast', fastClick);
      const slowReport = INPReport.fromPerformanceEventTimingEntry('slow', slowKeyboard);

      // Then
      expect(fastReport.rating).toBe(RATINGS.GOOD);
      expect(slowReport.rating).toBe(RATINGS.POOR);
      expect(fastReport.eventName).toBe('click');
      expect(slowReport.eventName).toBe('click');
    });
  });

  describe('inheritance from WebVitalReport', () => {
    it('should inherit all WebVitalReport properties correctly', () => {
      // Given
      const report = INPReportMothers.good();

      // When & Then
      expect(report).toHaveProperty('id');
      expect(report).toHaveProperty('value');
      expect(report).toHaveProperty('createdAt');
      expect(report).toHaveProperty('occurredAt');
      expect(report).toHaveProperty('name');
      expect(report).toHaveProperty('goodThreshold');
      expect(report).toHaveProperty('poorThreshold');
      expect(report).toHaveProperty('rating');
      expect(report).toHaveProperty('eventName'); // INP-specific
    });

    it('should implement all WebVitalReport methods correctly', () => {
      // Given
      const report = INPReportMothers.good();

      // When & Then
      expect(typeof report.toString).toBe('function');
      expect(typeof report.toJSON).toBe('function');
      expect(typeof report.isGood).toBe('boolean');
      expect(typeof report.isNeedsImprovement).toBe('boolean');
      expect(typeof report.isPoor).toBe('boolean');
    });

    it('should override toJSON method to include eventName', () => {
      // Given
      const report = INPReportMothers.withValue(250, 'custom-event');

      // When
      const json = report.toJSON();

      // Then
      expect(json).toHaveProperty('eventName', 'custom-event');
      expect(json.name).toBe(WEB_VITALS.INTERACTION_TO_NEXT_PAINT);
    });
  });
});