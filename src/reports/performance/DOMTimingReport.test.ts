import { describe, it, expect, vi } from 'vitest';

import { DOMTimingReportMothers } from '@/test/mothers/DOMTimingReportMothers';

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
      expect(report.timeToInteractive).toBe(800);
      expect(report.timeToContentLoaded).toBe(900);
      expect(report.timeToDOMComplete).toBe(1000);
      expect(report.timeToFullLoad).toBe(1030);
      expect(report.domContentLoadedDuration).toBe(50);
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
        PerformanceTime.fromAbsoluteTime(performance.timeOrigin)
      );

      // When
      const report = DOMTimingReport.fromPerformanceEntry(id, entry);

      // Then
      expect(report.id).toBe(id);
      expect(report.timeToInteractive).toBe(800);  // domInteractive - fetchStart
      expect(report.timeToContentLoaded).toBe(900); // domContentLoadedEventEnd - fetchStart  
      expect(report.timeToDOMComplete).toBe(1000);   // domComplete - fetchStart
      expect(report.timeToFullLoad).toBe(1030);      // loadEventEnd - fetchStart
      expect(report.domContentLoadedDuration).toBe(50); // domContentLoadedEventEnd - Start
      expect(report.loadEventDuration).toBe(30);     // loadEventEnd - loadEventStart
    });

    it('should handle negative values by using Math.max(0, calculation)', () => {
      // Given
      const id = 'test-edge-case';
      const entry = DOMTimingReportMothers.createPerformanceNavigationTiming('minimal');

      // When
      const report = DOMTimingReport.fromPerformanceEntry(id, entry);

      // Then
      expect(report.timeToInteractive).toBe(0);
      expect(report.timeToContentLoaded).toBe(0);
      expect(report.timeToDOMComplete).toBe(0);
      expect(report.timeToFullLoad).toBe(1);
      expect(report.domContentLoadedDuration).toBe(0);
      expect(report.loadEventDuration).toBe(1);
    });
  });

  describe('calculated getters', () => {
    it('should calculate totalEventHandlerTime as sum of domContentLoaded and load durations', () => {
      // Given
      const data = DOMTimingReportMothers.fastPageLoad();
      const report = DOMTimingReport.create(data);

      // When
      const totalEventHandlerTime = report.totalEventHandlerTime;

      // Then
      expect(totalEventHandlerTime).toBe(80); // 50 + 30
    });

    it('should calculate domParsingTime as timeToDOMComplete minus timeToInteractive', () => {
      // Given
      const data = DOMTimingReportMothers.slowPageLoad();
      const report = DOMTimingReport.create(data);

      // When
      const domParsingTime = report.domParsingTime;

      // Then
      expect(domParsingTime).toBe(1500); // 4500 - 3000
    });

    it('should calculate resourceLoadTime as timeToFullLoad minus timeToDOMComplete', () => {
      // Given
      const data = DOMTimingReportMothers.fastPageLoad();
      const report = DOMTimingReport.create(data);

      // When
      const resourceLoadTime = report.resourceLoadTime;

      // Then
      expect(resourceLoadTime).toBe(30); // 1030 - 1000
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
        'DOMTiming: 1030ms total (Interactive: 800ms, DOMContentLoaded: 900ms)'
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
        // Metadata
        id: 'slow-dom-timing-002',
        createdAt: data.createdAt.absoluteTime,
        occurredAt: data.occurredAt.absoluteTime,
        
        // Core milestones
        timeToInteractive: data.timeToInteractive,
        timeToContentLoaded: data.timeToContentLoaded,
        timeToDOMComplete: data.timeToDOMComplete,
        timeToFullLoad: data.timeToFullLoad,
        
        // Event execution
        domContentLoadedDuration: data.domContentLoadedDuration,
        loadEventDuration: data.loadEventDuration,
        totalEventHandlerTime: data.domContentLoadedDuration + data.loadEventDuration, // 200 + 150
        
        // Derived metrics
        domParsingTime: data.timeToDOMComplete - data.timeToInteractive, // 4500 - 3000 = 1500
        resourceLoadTime: data.timeToFullLoad - data.timeToDOMComplete, // 4650 - 4500 = 150
        hasSlowEventHandlers: true, // 350ms > 50ms
        slowestPhase: 'interactive' // 3000ms is the largest phase
      });
    });
  });

  describe('edge cases', () => {
    it('should handle zero timing values correctly', () => {
      // Given
      const data = DOMTimingReportMothers.minimalTiming();
      const report = DOMTimingReport.create(data);

      // When & Then
      expect(report.totalEventHandlerTime).toBe(1);     // 0 + 1
      expect(report.domParsingTime).toBe(0);   // 0 - 0
      expect(report.resourceLoadTime).toBe(1);     // 1 - 0
      expect(report.toString()).toBe('DOMTiming: 1ms total (Interactive: 0ms, DOMContentLoaded: 0ms)');
    });

    it('should maintain immutability when accessing calculated properties', () => {
      // Given
      const data = DOMTimingReportMothers.fastPageLoad();
      const report = DOMTimingReport.create(data);

      // When
      const eventTime1 = report.totalEventHandlerTime;
      const eventTime2 = report.totalEventHandlerTime;

      // Then
      expect(eventTime1).toBe(eventTime2);
      expect(Object.isFrozen(report)).toBe(true);
    });
  });
});