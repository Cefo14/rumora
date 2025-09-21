import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ResourceErrorReportMothers } from '@/test-utils/mothers/ResourceErrorReportMothers';
import { ErrorEventMother } from '@/test-utils/mothers/ErrorEventMother';
import { windowLocationHelper } from '@/test-utils/WindowLocationHelper';
import { PerformanceTime } from '@/value-objects/PerformanceTime';

import { ResourceErrorReport } from './ResourceErrorReport';

describe('ResourceErrorReport', () => {
  beforeEach(() => {
    windowLocationHelper.mockSameOrigin();
  });

  afterEach(() => {
    windowLocationHelper.restoreLocation();
  });


  describe('create factory method', () => {
    describe('when data is valid', () => {
      it('should create ResourceErrorReport successfully with all resource properties', () => {
        // Given
        const id = 'test-resource-123';
        const resourceUrl = 'https://example.com/app.js';
        const resourceType = 'script';
        const occurredAt = PerformanceTime.fromRelativeTime(100);
        const createdAt = PerformanceTime.fromRelativeTime(200);
        const data = { id, resourceUrl, resourceType, occurredAt, createdAt };

        // When
        const report = ResourceErrorReport.create(data);

        // Then
        expect(report.id).toBe(id);
        expect(report.resourceUrl).toBe(resourceUrl);
        expect(report.resourceType).toBe(resourceType);
        expect(report.occurredAt).toBe(occurredAt);
        expect(report.createdAt).toBe(createdAt);
      });

      it('should be immutable after creation', () => {
        // Given
        const report = ResourceErrorReportMothers.criticalScript();

        // When & Then
        expect(Object.isFrozen(report)).toBe(true);
        expect(() => {
          // @ts-expect-error Testing immutability
          report.resourceUrl = 'modified';
        }).toThrow();
      });
    });
  });

  describe('fromErrorEvent factory method', () => {
    describe('when ErrorEvent is valid', () => {
      it('should create report with extracted resource information from script element', () => {
        // Given
        const id = 'resource-from-event-123';
        const scriptErrorEvent = ErrorEventMother.withScriptError();
        vi.spyOn(PerformanceTime, 'now').mockReturnValue(
          PerformanceTime.fromRelativeTime(performance.timeOrigin)
        );

        // When
        const report = ResourceErrorReport.fromErrorEvent(id, scriptErrorEvent);

        // Then
        expect(report.id).toBe(id);
        expect(report.resourceUrl).toBe('https://example.com/app.js');
        expect(report.resourceType).toBe('script');
        expect(report.occurredAt.relativeTime).toBe(scriptErrorEvent.timeStamp);
        expect(report.createdAt.relativeTime).toBe(performance.timeOrigin);
      });

      it('should extract resource type and URL correctly from different elements', () => {
        // Given
        const stylesheetEvent = ErrorEventMother.withStylesheetError();
        const imageEvent = ErrorEventMother.withImageError();
        const linkEvent = ErrorEventMother.withLinkError();

        // When
        const stylesheetReport = ResourceErrorReport.fromErrorEvent('css', stylesheetEvent);
        const imageReport = ResourceErrorReport.fromErrorEvent('img', imageEvent);
        const linkReport = ResourceErrorReport.fromErrorEvent('link', linkEvent);

        // Then
        expect(stylesheetReport.resourceType).toBe('stylesheet');
        expect(stylesheetReport.resourceUrl).toBe('https://example.com/styles.css');
        
        expect(imageReport.resourceType).toBe('img');
        expect(imageReport.resourceUrl).toBe('https://example.com/image.jpg');
        
        expect(linkReport.resourceType).toBe('link');
        expect(linkReport.resourceUrl).toBe('https://example.com/resource.json');
      });

      it('should handle unknown resource gracefully', () => {
        // Given
        const unknownEvent = ErrorEventMother.withUnknownResourceError();

        // When
        const report = ResourceErrorReport.fromErrorEvent('unknown', unknownEvent);

        // Then
        expect(report.resourceUrl).toBe('Unknown resource');
        expect(report.resourceType).toBe('div');
      });
    });
  });

  describe('severity classification', () => {
    it('should classify resource severity correctly based on type and origin', () => {
      // Given
      const criticalScript = ResourceErrorReportMothers.criticalScript(); // First-party script
      const highThirdPartyScript = ResourceErrorReportMothers.highThirdPartyScript(); // Third-party script
      const highStylesheet = ResourceErrorReportMothers.highStylesheet(); // Stylesheet
      const mediumImage = ResourceErrorReportMothers.mediumImage(); // Image
      const lowVideo = ResourceErrorReportMothers.lowVideo(); // Video

      // When & Then
      expect(criticalScript.severity).toBe('critical');
      expect(highThirdPartyScript.severity).toBe('high'); // Third-party script is high, not critical
      expect(highStylesheet.severity).toBe('high');
      expect(mediumImage.severity).toBe('medium');
      expect(lowVideo.severity).toBe('low');
    });
  });

  describe('third-party detection', () => {
    it('should detect third-party resources correctly', () => {
      // Given
      const firstPartyScript = ResourceErrorReportMothers.criticalScript(); // example.com
      const thirdPartyScript = ResourceErrorReportMothers.highThirdPartyScript(); // cdn.analytics.com
      const unknownResource = ResourceErrorReportMothers.withCustom({ resourceUrl: 'Unknown resource' });

      // When & Then
      expect(firstPartyScript.isThirdParty).toBe(false);
      expect(thirdPartyScript.isThirdParty).toBe(true);
      expect(unknownResource.isThirdParty).toBe(false);
    });

    it('should handle invalid URLs gracefully', () => {
      // Given
      const invalidUrlReport = ResourceErrorReportMothers.withCustom({
        resourceUrl: 'not-a-valid-url'
      });

      // When & Then
      expect(invalidUrlReport.isThirdParty).toBe(false);
      expect(invalidUrlReport.resourceDomain).toBe('Unknown domain');
    });
  });

  describe('resource domain extraction', () => {
    it('should extract domain correctly from valid URLs', () => {
      // Given
      const report = ResourceErrorReportMothers.highThirdPartyScript();

      // When
      const domain = report.resourceDomain;

      // Then
      expect(domain).toBe('cdn.analytics.com');
    });

    it('should handle invalid URLs gracefully', () => {
      // Given
      const invalidReport = ResourceErrorReportMothers.withCustom({ resourceUrl: 'invalid-url' });

      // When
      const domain = invalidReport.resourceDomain;

      // Then
      expect(domain).toBe('Unknown domain');
    });
  });

  describe('critical resource detection', () => {
    it('should identify critical resources correctly', () => {
      // Given
      const scriptReport = ResourceErrorReportMothers.criticalScript();
      const stylesheetReport = ResourceErrorReportMothers.highStylesheet();
      const imageReport = ResourceErrorReportMothers.mediumImage();
      const videoReport = ResourceErrorReportMothers.lowVideo();

      // When & Then
      expect(scriptReport.isCriticalResource).toBe(true);
      expect(stylesheetReport.isCriticalResource).toBe(true);
      expect(imageReport.isCriticalResource).toBe(false);
      expect(videoReport.isCriticalResource).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return formatted string with severity and resource information', () => {
      // Given
      const report = ResourceErrorReportMothers.criticalScript();

      // When
      const result = report.toString();

      // Then
      expect(result).toBe('Resource Error [CRITICAL]: Failed to load script - https://example.com/app.js');
    });

    it('should include third-party indicator when applicable', () => {
      // Given
      const thirdPartyReport = ResourceErrorReportMothers.highThirdPartyScript();

      // When
      const result = thirdPartyReport.toString();

      // Then
      expect(result).toContain('[3rd-party]');
      expect(result).toBe('Resource Error [HIGH]: Failed to load script - https://cdn.analytics.com/tracker.js [3rd-party]');
    });
  });

  describe('toJSON', () => {
    it('should return complete JSON representation with all resource properties and computed values', () => {
      // Given
      const report = ResourceErrorReportMothers.criticalScript();

      // When
      const result = report.toJSON();

      // Then
      expect(result).toEqual({
        id: 'resource-critical-script',
        createdAt: report.createdAt.absoluteTime,
        occurredAt: report.occurredAt.absoluteTime,
        resourceUrl: 'https://example.com/app.js',
        resourceType: 'script',
        resourceDomain: 'example.com',
        severity: 'critical',
        isThirdParty: false,
        isCriticalResource: true
      });
      expect(typeof result.createdAt).toBe('number');
      expect(result.createdAt).toBeGreaterThan(performance.timeOrigin);
    });
  });

  describe('edge cases', () => {
    it('should handle different resource types correctly', () => {
      // Given
      const iframe = ResourceErrorReportMothers.withCustom({ resourceType: 'iframe' });
      const audio = ResourceErrorReportMothers.withCustom({ resourceType: 'audio' });
      const unknown = ResourceErrorReportMothers.withCustom({ resourceType: 'unknown' });

      // When & Then
      expect(iframe.severity).toBe('medium');
      expect(audio.severity).toBe('low');
      expect(unknown.severity).toBe('low');
      
      expect(iframe.isCriticalResource).toBe(false);
      expect(audio.isCriticalResource).toBe(false);
      expect(unknown.isCriticalResource).toBe(false);
    });

    it('should handle link elements with different rel attributes', () => {
      // Given
      const stylesheet = ResourceErrorReportMothers.withCustom({ 
        resourceType: 'stylesheet' // From link with rel="stylesheet"
      });
      const prefetch = ResourceErrorReportMothers.withCustom({ 
        resourceType: 'link' // From link with other rel
      });

      // When & Then
      expect(stylesheet.severity).toBe('high');
      expect(stylesheet.isCriticalResource).toBe(true);
      
      expect(prefetch.severity).toBe('high'); // Still high severity for links
      expect(prefetch.isCriticalResource).toBe(false); // But not critical
    });
  });

  describe('resource error scenarios from ErrorEvent', () => {
    it('should create reports from various ErrorEvent resource types correctly', () => {
      // Given
      const scriptEvent = ErrorEventMother.withScriptError();
      const stylesheetEvent = ErrorEventMother.withStylesheetError();
      const imageEvent = ErrorEventMother.withImageError();
      const thirdPartyEvent = ErrorEventMother.withThirdPartyScriptError();

      // When
      const scriptReport = ResourceErrorReport.fromErrorEvent('script', scriptEvent);
      const stylesheetReport = ResourceErrorReport.fromErrorEvent('stylesheet', stylesheetEvent);
      const imageReport = ResourceErrorReport.fromErrorEvent('image', imageEvent);
      const thirdPartyReport = ResourceErrorReport.fromErrorEvent('third-party', thirdPartyEvent);

      // Then
      expect(scriptReport.severity).toBe('critical');
      expect(scriptReport.isCriticalResource).toBe(true);
      expect(scriptReport.isThirdParty).toBe(false);
      
      expect(stylesheetReport.severity).toBe('high');
      expect(stylesheetReport.isCriticalResource).toBe(true);
      
      expect(imageReport.severity).toBe('medium');
      expect(imageReport.isCriticalResource).toBe(false);
      
      expect(thirdPartyReport.isThirdParty).toBe(true);
      expect(thirdPartyReport.severity).toBe('high'); // Third-party script
    });
  });
});
