import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { CSPViolationErrorReportMothers } from '@/test/mothers/CSPViolationErrorReportMothers';
import { SecurityPolicyViolationEventMother } from '@/test/mothers/SecurityPolicyViolationEventMother';
import { windowLocationHelper } from '@/test/helpers/WindowLocationHelper';
import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { securityPolicyViolationEventHelper } from '@/test/helpers/SecurityPolicyViolationEventHelper';

import { CSPViolationErrorReport } from './CSPViolationErrorReport';

describe('CSPViolationErrorReport', () => {
  beforeEach(() => {
    windowLocationHelper.mock();
    securityPolicyViolationEventHelper.mock();
  });

  afterEach(() => {
    windowLocationHelper.unmock();
    securityPolicyViolationEventHelper.unmock();
  });

  describe('create factory method', () => {
    describe('when data is valid', () => {
      it('should create CSPViolationErrorReport successfully with all CSP violation properties', () => {
        // Given
        const id = 'test-csp-123';
        const directive = 'script-src';
        const blockedURI = 'https://malicious.com/evil.js';
        const sourceFile = 'https://example.com/app.js';
        const lineNumber = 42;
        const columnNumber = 10;
        const occurredAt = PerformanceTime.fromRelativeTime(100);
        const createdAt = PerformanceTime.fromRelativeTime(200);
        const data = { id, directive, blockedURI, sourceFile, lineNumber, columnNumber, occurredAt, createdAt };

        // When
        const report = CSPViolationErrorReport.create(data);

        // Then
        expect(report.id).toBe(id);
        expect(report.directive).toBe(directive);
        expect(report.blockedURI).toBe(blockedURI);
        expect(report.sourceFile).toBe(sourceFile);
        expect(report.lineNumber).toBe(lineNumber);
        expect(report.columnNumber).toBe(columnNumber);
        expect(report.occurredAt).toBe(occurredAt);
        expect(report.createdAt).toBe(createdAt);
      });

      it('should be immutable after creation', () => {
        // Given
        const report = CSPViolationErrorReportMothers.high();

        // When & Then
        expect(Object.isFrozen(report)).toBe(true);
        expect(() => {
          // @ts-expect-error Testing immutability
          report.directive = 'modified';
        }).toThrow();
      });
    });
  });

  describe('fromSecurityPolicyViolationEvent factory method', () => {
    describe('when SecurityPolicyViolationEvent is valid', () => {
      it('should create report with extracted CSP violation information', () => {
        // Given
        const id = 'csp-from-event-123';
        const violationEvent = SecurityPolicyViolationEventMother.withScriptSrcViolation();
        vi.spyOn(PerformanceTime, 'now').mockReturnValue(
          PerformanceTime.fromRelativeTime(performance.timeOrigin)
        );

        // When
        const report = CSPViolationErrorReport.fromSecurityPolicyViolationEvent(id, violationEvent);

        // Then
        expect(report.id).toBe(id);
        expect(report.directive).toBe(violationEvent.effectiveDirective);
        expect(report.blockedURI).toBe(violationEvent.blockedURI);
        expect(report.sourceFile).toBe(violationEvent.sourceFile);
        expect(report.lineNumber).toBe(violationEvent.lineNumber);
        expect(report.columnNumber).toBe(violationEvent.columnNumber);
        expect(report.occurredAt.relativeTime).toBe(violationEvent.timeStamp);
        expect(report.createdAt.relativeTime).toBe(performance.timeOrigin);
      });
    });
  });

  describe('severity classification', () => {
    it('should classify CSP violation severity correctly based on directive type and blocked content', () => {
      // Given
      const criticalInline = CSPViolationErrorReportMothers.critical(); // inline script
      const criticalEval = CSPViolationErrorReportMothers.evalViolation(); // eval
      const highScript = CSPViolationErrorReportMothers.withCustom({ 
        directive: 'script-src', 
        blockedURI: 'https://third-party.com/script.js' 
      }); // external script
      const highStyle = CSPViolationErrorReportMothers.high(); // style-src
      const highConnect = CSPViolationErrorReportMothers.withCustom({ directive: 'connect-src' });
      const mediumImg = CSPViolationErrorReportMothers.medium(); // img-src
      const mediumFrame = CSPViolationErrorReportMothers.withCustom({ directive: 'frame-src' });
      const lowObject = CSPViolationErrorReportMothers.low(); // object-src

      // When & Then
      expect(criticalInline.severity).toBe('critical');
      expect(criticalEval.severity).toBe('critical');
      expect(highScript.severity).toBe('high');
      expect(highStyle.severity).toBe('high');
      expect(highConnect.severity).toBe('high');
      expect(mediumImg.severity).toBe('medium');
      expect(mediumFrame.severity).toBe('medium');
      expect(lowObject.severity).toBe('low');
    });
  });

  describe('violation type detection', () => {
    it('should detect inline violations correctly', () => {
      // Given
      const inlineReport = CSPViolationErrorReportMothers.critical(); // inline
      const externalReport = CSPViolationErrorReportMothers.thirdParty(); // external URL

      // When & Then
      expect(inlineReport.isInlineViolation).toBe(true);
      expect(externalReport.isInlineViolation).toBe(false);
    });

    it('should detect eval violations correctly', () => {
      // Given
      const evalReport = CSPViolationErrorReportMothers.evalViolation(); // eval
      const unsafeEvalReport = CSPViolationErrorReportMothers.withCustom({ 
        blockedURI: 'unsafe-eval' 
      });
      const regularReport = CSPViolationErrorReportMothers.high();

      // When & Then
      expect(evalReport.isEvalBlocked).toBe(true);
      expect(unsafeEvalReport.isEvalBlocked).toBe(true);
      expect(regularReport.isEvalBlocked).toBe(false);
    });

    it('should detect third-party violations correctly', () => {
      // Given
      const thirdPartyReport = CSPViolationErrorReportMothers.thirdParty(); // malicious.com
      const firstPartyReport = CSPViolationErrorReportMothers.withCustom({ 
        blockedURI: 'https://example.com/script.js' 
      });
      const inlineReport = CSPViolationErrorReportMothers.critical(); // inline

      // When & Then
      expect(thirdPartyReport.isThirdPartyViolation).toBe(true);
      expect(firstPartyReport.isThirdPartyViolation).toBe(false);
      expect(inlineReport.isThirdPartyViolation).toBe(false);
    });

    it('should detect special URIs correctly', () => {
      // Given
      const inlineReport = CSPViolationErrorReportMothers.critical(); // inline
      const evalReport = CSPViolationErrorReportMothers.evalViolation(); // eval
      const dataReport = CSPViolationErrorReportMothers.withCustom({ 
        blockedURI: 'data:text/javascript,alert("xss")' 
      });
      const blobReport = CSPViolationErrorReportMothers.withCustom({ 
        blockedURI: 'blob:https://example.com/uuid' 
      });
      const regularReport = CSPViolationErrorReportMothers.thirdParty();

      // When & Then
      expect(inlineReport.isSpecialURI).toBe(true);
      expect(evalReport.isSpecialURI).toBe(true);
      expect(dataReport.isSpecialURI).toBe(true);
      expect(blobReport.isSpecialURI).toBe(true);
      expect(regularReport.isSpecialURI).toBe(false);
    });
  });

  describe('domain extraction', () => {
    it('should extract domain correctly from regular URLs', () => {
      // Given
      const report = CSPViolationErrorReportMothers.thirdParty();

      // When
      const domain = report.blockedDomain;

      // Then
      expect(domain).toBe('malicious.com');
    });

    it('should return special URI as-is for blocked domain', () => {
      // Given
      const inlineReport = CSPViolationErrorReportMothers.critical();
      const evalReport = CSPViolationErrorReportMothers.evalViolation();

      // When & Then
      expect(inlineReport.blockedDomain).toBe('inline');
      expect(evalReport.blockedDomain).toBe('eval');
    });

    it('should handle invalid URLs gracefully', () => {
      // Given
      const invalidReport = CSPViolationErrorReportMothers.withCustom({ 
        blockedURI: 'not-a-valid-url' 
      });

      // When
      const domain = invalidReport.blockedDomain;

      // Then
      expect(domain).toBe('not-a-valid-url');
    });
  });

  describe('toString', () => {
    it('should return formatted string with severity and violation information', () => {
      // Given
      const report = CSPViolationErrorReportMothers.high();

      // When
      const result = report.toString();

      // Then
      expect(result).toBe('CSP Violation [HIGH]: style-src blocked https://fonts.googleapis.com/css [3rd-party]');
    });

    it('should include inline indicator when applicable', () => {
      // Given
      const inlineReport = CSPViolationErrorReportMothers.critical();

      // When
      const result = inlineReport.toString();

      // Then
      expect(result).toContain('[inline]');
      expect(result).toBe('CSP Violation [CRITICAL]: script-src blocked inline [inline]');
    });

    it('should include third-party indicator when applicable', () => {
      // Given
      const thirdPartyReport = CSPViolationErrorReportMothers.thirdParty();

      // When
      const result = thirdPartyReport.toString();

      // Then
      expect(result).toContain('[3rd-party]');
      expect(result).toBe('CSP Violation [HIGH]: script-src blocked https://malicious.com/script.js [3rd-party]');
    });
  });

  describe('toJSON', () => {
    it('should return complete JSON representation with all CSP violation properties and computed values', () => {
      // Given
      const report = CSPViolationErrorReportMothers.high();

      // When
      const result = report.toJSON();

      // Then
      expect(result).toEqual({
        id: 'csp-high',
        createdAt: report.createdAt.absoluteTime,
        occurredAt: report.occurredAt.absoluteTime,
        directive: 'style-src',
        blockedURI: 'https://fonts.googleapis.com/css',
        blockedDomain: 'fonts.googleapis.com',
        sourceFile: 'https://example.com/styles.css',
        lineNumber: 15,
        columnNumber: 5,
        severity: 'high',
        isInlineViolation: false,
        isEvalBlocked: false,
        isThirdPartyViolation: true,
        isSpecialURI: false
      });
      expect(typeof result.createdAt).toBe('number');
      expect(result.createdAt).toBeGreaterThan(performance.timeOrigin);
    });
  });

  describe('edge cases', () => {
    it('should handle missing optional properties correctly', () => {
      // Given
      const minimalReport = CSPViolationErrorReportMothers.withCustom({
        sourceFile: undefined,
        lineNumber: undefined,
        columnNumber: undefined
      });

      // When & Then
      expect(minimalReport.sourceFile).toBeUndefined();
      expect(minimalReport.lineNumber).toBeUndefined();
      expect(minimalReport.columnNumber).toBeUndefined();
      expect(minimalReport.severity).toBe('high'); // script-src default
    });

    it('should handle different directive variations correctly', () => {
      // Given
      const scriptReport = CSPViolationErrorReportMothers.withCustom({ directive: 'script-src-elem' });
      const styleReport = CSPViolationErrorReportMothers.withCustom({ directive: 'style-src-attr' });
      const connectReport = CSPViolationErrorReportMothers.withCustom({ directive: 'connect-src' });

      // When & Then
      expect(scriptReport.severity).toBe('high'); // script-src variants are high
      expect(styleReport.severity).toBe('high'); // style-src variants are high  
      expect(connectReport.severity).toBe('high'); // connect-src is high
    });

    it('should handle unusual URI schemes correctly', () => {
      // Given
      const javascriptReport = CSPViolationErrorReportMothers.withCustom({ 
        blockedURI: 'javascript:alert("xss")' 
      });
      const aboutReport = CSPViolationErrorReportMothers.withCustom({ 
        blockedURI: 'about:blank' 
      });

      // When & Then
      expect(javascriptReport.isSpecialURI).toBe(true);
      expect(aboutReport.isSpecialURI).toBe(true);
      expect(javascriptReport.blockedDomain).toBe('javascript:alert("xss")');
      expect(aboutReport.blockedDomain).toBe('about:blank');
    });
  });

  describe('CSP-specific scenarios from SecurityPolicyViolationEvent', () => {
    it('should create reports from various CSP violation types correctly', () => {
      // Given
      const inlineEvent = SecurityPolicyViolationEventMother.withInlineScriptViolation();
      const evalEvent = SecurityPolicyViolationEventMother.withEvalViolation();
      const styleEvent = SecurityPolicyViolationEventMother.withStyleSrcViolation();
      const imgEvent = SecurityPolicyViolationEventMother.withImgSrcViolation();

      // When
      const inlineReport = CSPViolationErrorReport.fromSecurityPolicyViolationEvent('inline', inlineEvent);
      const evalReport = CSPViolationErrorReport.fromSecurityPolicyViolationEvent('eval', evalEvent);
      const styleReport = CSPViolationErrorReport.fromSecurityPolicyViolationEvent('style', styleEvent);
      const imgReport = CSPViolationErrorReport.fromSecurityPolicyViolationEvent('img', imgEvent);

      // Then
      expect(inlineReport.severity).toBe('critical');
      expect(inlineReport.isInlineViolation).toBe(true);
      
      expect(evalReport.severity).toBe('critical');
      expect(evalReport.isEvalBlocked).toBe(true);
      
      expect(styleReport.severity).toBe('high');
      expect(styleReport.isThirdPartyViolation).toBe(true);
      
      expect(imgReport.severity).toBe('medium');
      expect(imgReport.isThirdPartyViolation).toBe(true);
    });

    it('should handle special URI violations from events correctly', () => {
      // Given
      const dataEvent = SecurityPolicyViolationEventMother.withDataURIViolation();
      const blobEvent = SecurityPolicyViolationEventMother.withBlobURIViolation();

      // When
      const dataReport = CSPViolationErrorReport.fromSecurityPolicyViolationEvent('data', dataEvent);
      const blobReport = CSPViolationErrorReport.fromSecurityPolicyViolationEvent('blob', blobEvent);

      // Then
      expect(dataReport.isSpecialURI).toBe(true);
      expect(dataReport.isThirdPartyViolation).toBe(false);
      
      expect(blobReport.isSpecialURI).toBe(true);
      expect(blobReport.isThirdPartyViolation).toBe(false);
    });
  });
});