import { describe, it, expect, vi } from 'vitest';

import { DOMTimingReportMothers } from '@/test-utils/mothers/DOMTimingReportMothers';
import { PERFORMANCE_TIMESTAMPS } from '@/test-utils/performanceHelpers';

import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { DOMTimingReport } from './DOMTimingReport';

describe('DOMTimingReport', () => {
  describe('create factory method', () => {
    it('should create DOMTimingReport with provided data', () => {
      // Given
      const data = DOMTimingReportMothers.fastPageLoad();

      // When
      const report = DOMTimingReport.create(data);

      // Then
      expect(report.id).toBe(data.id);
      expect(report.createdAt).toBe(data.createdAt);
      expect(report.occurredAt).toBe(data.occurredAt);
      expect(report.interactiveTime).toBe(800);
      expect(report.processingTime).toBe(200);
      expect(report.contentLoadedDuration).toBe(50);
      expect(report.loadEventDuration).toBe(30);
    });

    it('should freeze the created report instance', () => {
      // Given
      const data = DOMTimingReportMothers.fastPageLoad();

      // When
      const report = DOMTimingReport.create(data);

      // Then
      expect(Object.isFrozen(report)).toBe(true);
    });
  });

  describe('fromPerformanceEntry factory method', () => {
    it('should create DOMTimingReport from PerformanceNavigationTiming data', () => {
      // Given
      const id = 'test-dom-timing';
      const entry = DOMTimingReportMothers.createPerformanceNavigationTiming('fast');
      vi.spyOn(PerformanceTime, 'now').mockReturnValue(
        PerformanceTime.fromAbsoluteTime(PERFORMANCE_TIMESTAMPS.TIME_ORIGIN)
      );

      // When
      const report = DOMTimingReport.fromPerformanceEntry(id, entry);

      // Then
      expect(report.id).toBe(id);
      expect(report.interactiveTime).toBe(800);  // domInteractive - startTime
      expect(report.processingTime).toBe(200);   // domComplete - domInteractive
      expect(report.contentLoadedDuration).toBe(50); // domContentLoadedEventEnd - Start
      expect(report.loadEventDuration).toBe(30);     // loadEventEnd - loadEventStart
    });

    it('should handle negative values by using Math.max(0, calculation)', () => {
      // Given
      const id = 'test-edge-case';
      const entry = DOMTimingReportMothers.createPerformanceNavigationTiming('minimal');

      // When
      const report = DOMTimingReport.fromPerformanceEntry(id, entry);

      // Then
      expect(report.interactiveTime).toBe(0);
      expect(report.processingTime).toBe(0);
      expect(report.contentLoadedDuration).toBe(0);
      expect(report.loadEventDuration).toBe(1);
    });
  });

  describe('calculated getters', () => {
    it('should calculate eventListenerTime as sum of contentLoaded and load durations', () => {
      // Given
      const data = DOMTimingReportMothers.fastPageLoad();
      const report = DOMTimingReport.create(data);

      // When
      const eventListenerTime = report.eventListenerTime;

      // Then
      expect(eventListenerTime).toBe(80); // 50 + 30
    });

    it('should calculate totalProcessingTime as processing plus load event duration', () => {
      // Given
      const data = DOMTimingReportMothers.slowPageLoad();
      const report = DOMTimingReport.create(data);

      // When
      const totalProcessingTime = report.totalProcessingTime;

      // Then
      expect(totalProcessingTime).toBe(1650); // 1500 + 150
    });

    it('should calculate totalPageLoadTime as complete page load from navigation start', () => {
      // Given
      const data = DOMTimingReportMothers.fastPageLoad();
      const report = DOMTimingReport.create(data);

      // When
      const totalPageLoadTime = report.totalPageLoadTime;

      // Then
      expect(totalPageLoadTime).toBe(1030); // 800 + (200 + 30)
    });
  });

  describe('toString', () => {
    it('should return formatted string with key timing metrics', () => {
      // Given
      const data = DOMTimingReportMothers.fastPageLoad();
      const report = DOMTimingReport.create(data);

      // When
      const stringRepresentation = report.toString();

      // Then
      expect(stringRepresentation).toBe(
        'DOM Timing: 1030ms (Interactive: 800ms, Events: 80ms)'
      );
    });
  });

  describe('toJSON', () => {
    it('should return complete object representation with all metrics', () => {
      // Given
      const data = DOMTimingReportMothers.slowPageLoad();
      const report = DOMTimingReport.create(data);

      // When
      const jsonRepresentation = report.toJSON();

      // Then
      expect(jsonRepresentation).toEqual({
        id: 'slow-dom-timing-002',
        createdAt: data.createdAt.absoluteTime,
        occurredAt: data.occurredAt.absoluteTime,
        interactiveTime: data.interactiveTime,
        processingTime: data.processingTime,
        contentLoadedDuration: data.contentLoadedDuration,
        loadEventDuration: data.loadEventDuration,
        eventListenerTime: data.contentLoadedDuration + data.loadEventDuration, // 200 + 150
        totalProcessingTime: data.processingTime + data.loadEventDuration, // 1500 + 150
        totalPageLoadTime: data.interactiveTime + data.processingTime + data.loadEventDuration // 3000 + 1500 + 150
      });
    });
  });

  describe('edge cases', () => {
    it('should handle zero timing values correctly', () => {
      // Given
      const data = DOMTimingReportMothers.minimalTiming();
      const report = DOMTimingReport.create(data);

      // When & Then
      expect(report.eventListenerTime).toBe(1);     // 0 + 1
      expect(report.totalProcessingTime).toBe(1);   // 0 + 1
      expect(report.totalPageLoadTime).toBe(1);     // 0 + 1
      expect(report.toString()).toBe('DOM Timing: 1ms (Interactive: 0ms, Events: 1ms)');
    });

    it('should maintain immutability when accessing calculated properties', () => {
      // Given
      const data = DOMTimingReportMothers.fastPageLoad();
      const report = DOMTimingReport.create(data);

      // When
      const eventTime1 = report.eventListenerTime;
      const eventTime2 = report.eventListenerTime;

      // Then
      expect(eventTime1).toBe(eventTime2);
      expect(Object.isFrozen(report)).toBe(true);
    });
  });
});