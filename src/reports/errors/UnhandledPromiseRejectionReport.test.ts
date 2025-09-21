import { describe, it, expect, vi } from 'vitest';

import { UnhandledPromiseRejectionReportMothers } from '@/test-utils/mothers/UnhandledPromiseRejectionReportMothers';
import { PromiseRejectionEventMother } from '@/test-utils/mothers/PromiseRejectionEventMother';
import { PERFORMANCE_TIMESTAMPS } from '@/test-utils/performanceHelpers';

import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { UnhandledPromiseRejectionReport } from './UnhandledPromiseRejectionReport';

describe('UnhandledPromiseRejectionReport', () => {
  describe('create factory method', () => {
    describe('when data is valid', () => {
      it('should create UnhandledPromiseRejectionReport successfully with all promise error properties', () => {
        // Given
        const id = 'test-promise-123';
        const errorMessage = 'Promise rejection occurred';
        const errorName = 'TypeError';
        const stack = 'TypeError: Promise rejection\n    at handler (/app.js:42:5)';
        const occurredAt = PerformanceTime.fromRelativeTime(100);
        const createdAt = PerformanceTime.fromRelativeTime(200);
        const data = { id, errorMessage, errorName, stack, occurredAt, createdAt };

        // When
        const report = UnhandledPromiseRejectionReport.create(data);

        // Then
        expect(report.id).toBe(id);
        expect(report.errorMessage).toBe(errorMessage);
        expect(report.errorName).toBe(errorName);
        expect(report.stack).toBe(stack);
        expect(report.occurredAt).toBe(occurredAt);
        expect(report.createdAt).toBe(createdAt);
      });

      it('should be immutable after creation', () => {
        // Given
        const report = UnhandledPromiseRejectionReportMothers.high();

        // When & Then
        expect(Object.isFrozen(report)).toBe(true);
        expect(() => {
          // @ts-expect-error Testing immutability
          report.errorMessage = 'modified';
        }).toThrow();
      });
    });
  });

  describe('fromPromiseRejectionEvent factory method', () => {
    describe('when PromiseRejectionEvent is valid', () => {
      it('should create report with extracted error information from Error reason', () => {
        // Given
        const id = 'promise-from-event-123';
        const networkErrorEvent = PromiseRejectionEventMother.withNetworkError();
        vi.spyOn(PerformanceTime, 'now').mockReturnValue(
          PerformanceTime.fromRelativeTime(PERFORMANCE_TIMESTAMPS.CURRENT_TIME)
        );

        // When
        const report = UnhandledPromiseRejectionReport.fromPromiseRejectionEvent(id, networkErrorEvent);

        // Then
        expect(report.id).toBe(id);
        expect(report.errorMessage).toBe('Failed to fetch');
        expect(report.errorName).toBe('Error');
        expect(report.occurredAt.relativeTime).toBe(networkErrorEvent.timeStamp);
        expect(report.createdAt.relativeTime).toBe(PERFORMANCE_TIMESTAMPS.CURRENT_TIME);
      });

      it('should extract error message with fallback hierarchy for different reason types', () => {
        // Given
        const stringEvent = PromiseRejectionEventMother.withStringReason();
        const objectEvent = PromiseRejectionEventMother.withObjectReason();
        const nullEvent = PromiseRejectionEventMother.withNullReason();
        const errorNoMessageEvent = PromiseRejectionEventMother.withErrorNoMessage();

        // When
        const stringReport = UnhandledPromiseRejectionReport.fromPromiseRejectionEvent('string', stringEvent);
        const objectReport = UnhandledPromiseRejectionReport.fromPromiseRejectionEvent('object', objectEvent);
        const nullReport = UnhandledPromiseRejectionReport.fromPromiseRejectionEvent('null', nullEvent);
        const noMessageReport = UnhandledPromiseRejectionReport.fromPromiseRejectionEvent('no-msg', errorNoMessageEvent);

        // Then
        expect(stringReport.errorMessage).toBe('Something went wrong');
        expect(objectReport.errorMessage).toBe('Resource not found'); // From object.message
        expect(nullReport.errorMessage).toBe('Unknown promise rejection');
        expect(noMessageReport.errorMessage).toBe('Unknown error'); // Error with empty message
      });

      it('should handle object reasons with status codes', () => {
        // Given
        const statusOnlyEvent = PromiseRejectionEventMother.withStatusOnlyReason();

        // When
        const report = UnhandledPromiseRejectionReport.fromPromiseRejectionEvent('status', statusOnlyEvent);

        // Then
        expect(report.errorMessage).toBe('500: Unknown status'); // Fallback for status without statusText
      });

      it('should handle complex reasons that fail string conversion', () => {
        // Given
        const complexEvent = PromiseRejectionEventMother.withComplexReason();

        // When
        const report = UnhandledPromiseRejectionReport.fromPromiseRejectionEvent('complex', complexEvent);

        // Then
        expect(report.errorMessage).toBe('Unknown promise rejection'); // Fallback when String() fails
      });
    });
  });

  describe('severity classification', () => {
    it('should classify promise rejection severity correctly based on error patterns', () => {
      // Given
      const criticalReport = UnhandledPromiseRejectionReportMothers.critical(); // Chunk load failed
      const highReport = UnhandledPromiseRejectionReportMothers.high(); // Network error
      const mediumReport = UnhandledPromiseRejectionReportMothers.medium(); // Timeout
      const lowReport = UnhandledPromiseRejectionReportMothers.low(); // Generic error
      const memoryReport = UnhandledPromiseRejectionReportMothers.withCustom({
        errorMessage: 'JavaScript heap out of memory'
      });

      // When & Then
      expect(criticalReport.severity).toBe('critical');
      expect(highReport.severity).toBe('high');
      expect(mediumReport.severity).toBe('medium');
      expect(lowReport.severity).toBe('low');
      expect(memoryReport.severity).toBe('critical'); // Memory errors are critical
    });
  });

  describe('network-related detection', () => {
    it('should detect network-related promise rejections correctly', () => {
      // Given
      const networkReport = UnhandledPromiseRejectionReportMothers.networkRelated();
      const corsReport = UnhandledPromiseRejectionReportMothers.withCustom({
        errorMessage: 'CORS policy blocked the request'
      });
      const fetchReport = UnhandledPromiseRejectionReportMothers.high(); // Failed to fetch
      const genericReport = UnhandledPromiseRejectionReportMothers.low();

      // When & Then
      expect(networkReport.isNetworkRelated).toBe(true);
      expect(corsReport.isNetworkRelated).toBe(true);
      expect(fetchReport.isNetworkRelated).toBe(true);
      expect(genericReport.isNetworkRelated).toBe(false);
    });
  });

  describe('JavaScript error detection', () => {
    it('should identify JavaScript runtime errors correctly', () => {
      // Given
      const jsErrorReport = UnhandledPromiseRejectionReportMothers.jsError(); // TypeError
      const syntaxReport = UnhandledPromiseRejectionReportMothers.withCustom({
        errorName: 'SyntaxError'
      });
      const rangeReport = UnhandledPromiseRejectionReportMothers.withCustom({
        errorName: 'RangeError'
      });
      const genericReport = UnhandledPromiseRejectionReportMothers.low();

      // When & Then
      expect(jsErrorReport.isJavaScriptError).toBe(true);
      expect(syntaxReport.isJavaScriptError).toBe(true);
      expect(rangeReport.isJavaScriptError).toBe(true);
      expect(genericReport.isJavaScriptError).toBe(false); // Generic Error, not JS-specific
    });
  });

  describe('toString', () => {
    it('should return formatted string with severity and error message', () => {
      // Given
      const report = UnhandledPromiseRejectionReportMothers.high();

      // When
      const result = report.toString();

      // Then
      expect(result).toBe('Promise Rejection [HIGH]: Failed to fetch');
    });

    it('should format different severity levels correctly', () => {
      // Given
      const criticalReport = UnhandledPromiseRejectionReportMothers.critical();
      const mediumReport = UnhandledPromiseRejectionReportMothers.medium();

      // When
      const criticalResult = criticalReport.toString();
      const mediumResult = mediumReport.toString();

      // Then
      expect(criticalResult).toBe('Promise Rejection [CRITICAL]: Loading chunk 0 failed');
      expect(mediumResult).toBe('Promise Rejection [MEDIUM]: Request timeout after 5000ms');
    });
  });

  describe('toJSON', () => {
    it('should return complete JSON representation with all promise error properties and computed values', () => {
      // Given
      const report = UnhandledPromiseRejectionReportMothers.high();

      // When
      const result = report.toJSON();

      // Then
      expect(result).toEqual({
        id: 'promise-high',
        createdAt: report.createdAt.absoluteTime,
        occurredAt: report.occurredAt.absoluteTime,
        errorMessage: 'Failed to fetch',
        errorName: 'TypeError',
        stack: 'TypeError: Failed to fetch\n    at fetchData (/api.js:45:12)',
        severity: 'high',
        isNetworkRelated: true,
        isJavaScriptError: true
      });
      expect(typeof result.createdAt).toBe('number');
      expect(result.createdAt).toBeGreaterThan(PERFORMANCE_TIMESTAMPS.TIME_ORIGIN);
    });
  });

  describe('edge cases', () => {
    it('should handle missing optional properties correctly', () => {
      // Given
      const minimalReport = UnhandledPromiseRejectionReportMothers.withCustom({
        errorName: undefined,
        stack: undefined
      });

      // When & Then
      expect(minimalReport.errorName).toBeUndefined();
      expect(minimalReport.stack).toBeUndefined();
      expect(minimalReport.severity).toBe('low'); // Default severity
      expect(minimalReport.isNetworkRelated).toBe(false);
      expect(minimalReport.isJavaScriptError).toBe(false);
    });

    it('should handle case-insensitive error classification', () => {
      // Given
      const upperCaseError = UnhandledPromiseRejectionReportMothers.withCustom({
        errorName: 'TYPEERROR',
        errorMessage: 'FAILED TO FETCH'
      });

      // When & Then
      expect(upperCaseError.severity).toBe('high'); // Should match 'failed to fetch'
      expect(upperCaseError.isNetworkRelated).toBe(true);
      expect(upperCaseError.isJavaScriptError).toBe(true);
    });

    it('should handle empty or null error message and name', () => {
      // Given
      const emptyReport = UnhandledPromiseRejectionReportMothers.withCustom({
        errorMessage: '',
        errorName: ''
      });
      const nullReport = UnhandledPromiseRejectionReportMothers.withCustom({
        errorMessage: 'test',
        errorName: undefined
      });

      // When & Then
      expect(emptyReport.severity).toBe('low');
      expect(emptyReport.isNetworkRelated).toBe(false);
      expect(emptyReport.isJavaScriptError).toBe(false);
      
      expect(nullReport.isJavaScriptError).toBe(false);
    });
  });

  describe('promise rejection scenarios from PromiseRejectionEvent', () => {
    it('should create reports from various PromiseRejectionEvent types correctly', () => {
      // Given
      const typeErrorEvent = PromiseRejectionEventMother.withTypeError();
      const networkEvent = PromiseRejectionEventMother.withNetworkError();
      const timeoutEvent = PromiseRejectionEventMother.withTimeoutError();
      const chunkEvent = PromiseRejectionEventMother.withChunkLoadError();

      // When
      const typeErrorReport = UnhandledPromiseRejectionReport.fromPromiseRejectionEvent('type-error', typeErrorEvent);
      const networkReport = UnhandledPromiseRejectionReport.fromPromiseRejectionEvent('network', networkEvent);
      const timeoutReport = UnhandledPromiseRejectionReport.fromPromiseRejectionEvent('timeout', timeoutEvent);
      const chunkReport = UnhandledPromiseRejectionReport.fromPromiseRejectionEvent('chunk', chunkEvent);

      // Then
      expect(typeErrorReport.severity).toBe('high');
      expect(typeErrorReport.isJavaScriptError).toBe(true);
      expect(typeErrorReport.isNetworkRelated).toBe(false);
      
      expect(networkReport.severity).toBe('high');
      expect(networkReport.isNetworkRelated).toBe(true);
      
      expect(timeoutReport.severity).toBe('medium');
      expect(timeoutReport.isNetworkRelated).toBe(false);
      
      expect(chunkReport.severity).toBe('critical');
    });
  });
});