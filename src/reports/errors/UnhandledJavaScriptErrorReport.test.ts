import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { UnhandledJavaScriptErrorReportMothers } from '@/test/mothers/UnhandledJavaScriptErrorReportMothers';
import { ErrorEventMother } from '@/test/mothers/ErrorEventMother';
import { windowLocationHelper } from '@/test/helpers/WindowLocationHelper';
import { PerformanceTime } from '@/value-objects/PerformanceTime';

import { UnhandledJavaScriptErrorReport } from './UnhandledJavaScriptErrorReport';

describe('UnhandledJavaScriptErrorReport', () => {
  beforeEach(() => {
    windowLocationHelper.mock();
  });

  afterEach(() => {
    windowLocationHelper.unmock();
  });

  describe('create factory method', () => {
    describe('when data is valid', () => {
      it('should create UnhandledJavaScriptErrorReport successfully with all error properties', () => {
        // Given
        const id = 'test-error-123';
        const errorMessage = 'Test error occurred';
        const errorName = 'TypeError';
        const filename = 'https://example.com/app.js';
        const lineNumber = 42;
        const columnNumber = 10;
        const occurredAt = PerformanceTime.fromRelativeTime(100);
        const createdAt = PerformanceTime.fromRelativeTime(200);
        const data = {
          id, errorMessage, errorName, filename, lineNumber, columnNumber, occurredAt, createdAt
        };

        // When
        const report = UnhandledJavaScriptErrorReport.create(data);

        // Then
        expect(report.id).toBe(id);
        expect(report.errorMessage).toBe(errorMessage);
        expect(report.errorName).toBe(errorName);
        expect(report.filename).toBe(filename);
        expect(report.lineNumber).toBe(lineNumber);
        expect(report.columnNumber).toBe(columnNumber);
        expect(report.occurredAt).toBe(occurredAt);
        expect(report.createdAt).toBe(createdAt);
      });

      it('should be immutable after creation', () => {
        // Given
        const report = UnhandledJavaScriptErrorReportMothers.high();

        // When & Then
        expect(Object.isFrozen(report)).toBe(true);
        expect(() => {
          // @ts-expect-error Testing immutability
          report.errorMessage = 'modified';
        }).toThrow();
      });
    });
  });

  describe('fromErrorEvent factory method', () => {
    describe('when ErrorEvent is valid', () => {
      it('should create report with extracted error information', () => {
        // Given
        const id = 'error-from-event-123';
        const errorEvent = ErrorEventMother.withTypeError();
        vi.spyOn(PerformanceTime, 'now').mockReturnValue(
          PerformanceTime.fromRelativeTime(performance.timeOrigin)
        );

        // When
        const report = UnhandledJavaScriptErrorReport.fromErrorEvent(id, errorEvent);

        // Then
        expect(report.id).toBe(id);
        expect(report.errorMessage).toBe(errorEvent.message);
        expect(report.errorName).toBe(errorEvent.error?.name);
        expect(report.filename).toBe(errorEvent.filename);
        expect(report.lineNumber).toBe(errorEvent.lineno);
        expect(report.columnNumber).toBe(errorEvent.colno);
        expect(report.occurredAt.relativeTime).toBe(errorEvent.timeStamp);
        expect(report.createdAt.relativeTime).toBe(performance.timeOrigin);
      });

      it('should extract error message with fallback hierarchy', () => {
        // Given
        const id = 'fallback-test';
        const missingMessageEvent = ErrorEventMother.withMissingMessage();
        const noErrorObjectEvent = ErrorEventMother.withNoErrorObject();

        // When
        const reportWithFallback = UnhandledJavaScriptErrorReport.fromErrorEvent(id, missingMessageEvent);
        const reportWithEventMessage = UnhandledJavaScriptErrorReport.fromErrorEvent(id, noErrorObjectEvent);

        // Then
        expect(reportWithFallback.errorMessage).toBe('Fallback error message'); // From error.message
        expect(reportWithEventMessage.errorMessage).toBe('Message from event only'); // From event.message
      });
    });
  });

  describe('severity classification', () => {
    it('should classify error severity correctly based on error type', () => {
      // Given
      const criticalReport = UnhandledJavaScriptErrorReportMothers.critical(); // SyntaxError
      const highReport = UnhandledJavaScriptErrorReportMothers.high(); // TypeError
      const mediumReport = UnhandledJavaScriptErrorReportMothers.medium(); // RangeError
      const lowReport = UnhandledJavaScriptErrorReportMothers.low(); // Generic Error
      const outOfMemoryReport = UnhandledJavaScriptErrorReportMothers.withCustom({
        errorMessage: 'JavaScript heap out of memory',
        errorName: 'Error'
      });

      // When & Then
      expect(criticalReport.severity).toBe('critical');
      expect(highReport.severity).toBe('high');
      expect(mediumReport.severity).toBe('medium');
      expect(lowReport.severity).toBe('low');
      expect(outOfMemoryReport.severity).toBe('critical'); // Special case for memory errors
    });
  });

  describe('third-party script detection', () => {
    it('should detect third-party scripts correctly', () => {
      // Given
      const firstPartyReport = UnhandledJavaScriptErrorReportMothers.high(); // example.com
      const thirdPartyReport = UnhandledJavaScriptErrorReportMothers.thirdParty(); // cdn.analytics.com
      const noFilenameReport = UnhandledJavaScriptErrorReportMothers.withCustom({ filename: undefined });

      // When & Then
      expect(firstPartyReport.isThirdPartyScript).toBe(false);
      expect(thirdPartyReport.isThirdPartyScript).toBe(true);
      expect(noFilenameReport.isThirdPartyScript).toBe(false);
    });

    it('should handle invalid URLs as third-party', () => {
      // Given
      const invalidUrlReport = UnhandledJavaScriptErrorReportMothers.withCustom({
        filename: 'not-a-valid-url'
      });

      // When & Then
      expect(invalidUrlReport.isThirdPartyScript).toBe(true);
    });
  });

  describe('programming error detection', () => {
    it('should identify programming errors correctly', () => {
      // Given
      const syntaxErrorReport = UnhandledJavaScriptErrorReportMothers.critical(); // SyntaxError
      const typeErrorReport = UnhandledJavaScriptErrorReportMothers.high(); // TypeError
      const rangeErrorReport = UnhandledJavaScriptErrorReportMothers.medium(); // RangeError
      const genericErrorReport = UnhandledJavaScriptErrorReportMothers.low(); // Generic Error

      // When & Then
      expect(syntaxErrorReport.isProgrammingError).toBe(true);
      expect(typeErrorReport.isProgrammingError).toBe(true);
      expect(rangeErrorReport.isProgrammingError).toBe(false);
      expect(genericErrorReport.isProgrammingError).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return formatted string with severity and location information', () => {
      // Given
      const report = UnhandledJavaScriptErrorReportMothers.high();

      // When
      const result = report.toString();

      // Then
      expect(result).toBe('JS Error [HIGH]: Cannot read property \'length\' of undefined at https://example.com/utils.js:42');
    });

    it('should include third-party indicator when applicable', () => {
      // Given
      const thirdPartyReport = UnhandledJavaScriptErrorReportMothers.thirdParty();

      // When
      const result = thirdPartyReport.toString();

      // Then
      expect(result).toContain('[3rd-party]');
      expect(result).toBe('JS Error [LOW]: Analytics initialization failed at https://cdn.analytics.com/tracker.js:1 [3rd-party]');
    });

    it('should handle missing filename gracefully', () => {
      // Given
      const noFilenameReport = UnhandledJavaScriptErrorReportMothers.withCustom({ filename: undefined });

      // When
      const result = noFilenameReport.toString();

      // Then
      expect(result).toBe('JS Error [LOW]: Custom error message');
      expect(result).not.toContain(' at ');
    });
  });

  describe('toJSON', () => {
    it('should return complete JSON representation with all error properties and computed values', () => {
      // Given
      const report = UnhandledJavaScriptErrorReportMothers.high();

      // When
      const result = report.toJSON();

      // Then
      expect(result).toEqual({
        id: 'error-high',
        createdAt: report.createdAt.absoluteTime,
        occurredAt: report.occurredAt.absoluteTime,
        errorMessage: 'Cannot read property \'length\' of undefined',
        errorName: 'TypeError',
        stack: 'TypeError: Cannot read property \'length\' of undefined\n    at process (/utils.js:42:5)',
        filename: 'https://example.com/utils.js',
        lineNumber: 42,
        columnNumber: 5,
        severity: 'high',
        isThirdPartyScript: false,
        isProgrammingError: true
      });
      expect(typeof result.createdAt).toBe('number');
      expect(result.createdAt).toBeGreaterThan(performance.timeOrigin);
    });
  });

  describe('edge cases', () => {
    it('should handle missing optional properties correctly', () => {
      // Given
      const minimalReport = UnhandledJavaScriptErrorReportMothers.withCustom({
        errorName: undefined,
        stack: undefined,
        filename: undefined,
        lineNumber: undefined,
        columnNumber: undefined
      });

      // When & Then
      expect(minimalReport.errorName).toBeUndefined();
      expect(minimalReport.stack).toBeUndefined();
      expect(minimalReport.filename).toBeUndefined();
      expect(minimalReport.lineNumber).toBeUndefined();
      expect(minimalReport.columnNumber).toBeUndefined();
      expect(minimalReport.severity).toBe('low'); // Default severity
      expect(minimalReport.isThirdPartyScript).toBe(false);
      expect(minimalReport.isProgrammingError).toBe(false);
    });

    it('should handle case-insensitive error name classification', () => {
      // Given
      const upperCaseTypeError = UnhandledJavaScriptErrorReportMothers.withCustom({
        errorName: 'TYPEERROR'
      });
      const mixedCaseSyntaxError = UnhandledJavaScriptErrorReportMothers.withCustom({
        errorName: 'SyntaxError'
      });

      // When & Then
      expect(upperCaseTypeError.severity).toBe('high');
      expect(upperCaseTypeError.isProgrammingError).toBe(true);
      expect(mixedCaseSyntaxError.severity).toBe('critical');
      expect(mixedCaseSyntaxError.isProgrammingError).toBe(true);
    });
  });

  describe('JavaScript error scenarios from ErrorEvent', () => {
    it('should create reports from various ErrorEvent types correctly', () => {
      // Given
      const syntaxEvent = ErrorEventMother.withSyntaxError();
      const referenceEvent = ErrorEventMother.withReferenceError();
      const rangeEvent = ErrorEventMother.withRangeError();
      const thirdPartyEvent = ErrorEventMother.withThirdPartyError();

      // When
      const syntaxReport = UnhandledJavaScriptErrorReport.fromErrorEvent('syntax', syntaxEvent);
      const referenceReport = UnhandledJavaScriptErrorReport.fromErrorEvent('reference', referenceEvent);
      const rangeReport = UnhandledJavaScriptErrorReport.fromErrorEvent('range', rangeEvent);
      const thirdPartyReport = UnhandledJavaScriptErrorReport.fromErrorEvent('third-party', thirdPartyEvent);

      // Then
      expect(syntaxReport.severity).toBe('critical');
      expect(syntaxReport.isProgrammingError).toBe(true);
      
      expect(referenceReport.severity).toBe('high');
      expect(referenceReport.isProgrammingError).toBe(true);
      
      expect(rangeReport.severity).toBe('medium');
      expect(rangeReport.isProgrammingError).toBe(false);
      
      expect(thirdPartyReport.isThirdPartyScript).toBe(true);
    });
  });
});