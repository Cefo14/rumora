import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { ResourceTimingReportMothers } from '@/test/mothers/ResourceTimingReportMothers';
import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { TimeSegment } from '@/value-objects/TimeSegment';
import { windowLocationHelper } from '@/test/helpers/WindowLocationHelper';

import { ResourceTimingReport } from './ResourceTimingReport';

describe('ResourceTimingReport', () => {
  beforeEach(() => {
    windowLocationHelper.mock();
  });
  afterEach(() => {
    windowLocationHelper.unmock();
  });
  describe('create factory method', () => {
    it('should create ResourceTimingReport with provided data', () => {
      // Given
      const data = ResourceTimingReportMothers.fastScript();

      // When
      const report = ResourceTimingReport.create(data);

      // Then
      expect(report.id).toBe(data.id);
      expect(report.createdAt).toBe(data.createdAt);
      expect(report.occurredAt).toBe(data.occurredAt);
      expect(report.name).toBe('https://example.com/js/main.js');
      expect(report.type).toBe('script');
      expect(report.duration).toBe(250);
      expect(report.transferSize).toBe(45000);
      expect(report.encodedSize).toBe(35000);
      expect(report.decodedSize).toBe(35000);
    });

    it('should freeze the created report instance', () => {
      // Given
      const data = ResourceTimingReportMothers.compressedCSS();

      // When
      const report = ResourceTimingReport.create(data);

      // Then
      expect(Object.isFrozen(report)).toBe(true);
    });
  });

  describe('fromPerformanceResourceTiming factory method', () => {
    it('should create ResourceTimingReport from PerformanceResourceTiming data', () => {
      // Given
      const id = 'test-resource-timing';
      const entry = ResourceTimingReportMothers.createPerformanceResourceTiming('script');
      vi.spyOn(PerformanceTime, 'now').mockReturnValue(
        PerformanceTime.fromAbsoluteTime(performance.timeOrigin)
      );

      // When
      const report = ResourceTimingReport.fromPerformanceResourceTiming(id, entry);

      // Then
      expect(report.id).toBe(id);
      expect(report.name).toBe('https://example.com/js/main.js');
      expect(report.type).toBe('script');
      expect(report.duration).toBe(250);
      expect(report.transferSize).toBe(45000);
    });

    it('should handle entries without TLS correctly', () => {
      // Given
      const id = 'test-no-tls';
      const entry = ResourceTimingReportMothers.createPerformanceResourceTiming('font');

      // When
      const report = ResourceTimingReport.fromPerformanceResourceTiming(id, entry);

      // Then
      expect(report.name).toBe('http://fonts.example.com/fonts/roboto.woff2');
      expect(report.type).toBe('css');
    });
  });

  describe('computed getters', () => {
    it('should calculate correct endTime', () => {
      // Given
      const data = ResourceTimingReportMothers.fastScript();
      const report = ResourceTimingReport.create(data);

      // When
      const endTime = report.endTime;

      // Then
      expect(endTime.relativeTime).toBe(350); // startTime 100 + duration 250
    });

    it('should detect third-party resources correctly', () => {
      // Given
      const sameOrigin = ResourceTimingReport.create(ResourceTimingReportMothers.fastScript());
      const thirdParty = ResourceTimingReport.create(ResourceTimingReportMothers.slowThirdPartyImage());

      // When & Then
      expect(sameOrigin.isThirdParty).toBe(false);  // example.com (same as mocked window.location)
      expect(thirdParty.isThirdParty).toBe(true);   // cdn.thirdparty.com
    });

    it('should detect compression correctly', () => {
      // Given
      const compressed = ResourceTimingReport.create(ResourceTimingReportMothers.compressedCSS());
      const uncompressed = ResourceTimingReport.create(ResourceTimingReportMothers.fastScript());

      // When & Then
      expect(compressed.hasCompression).toBe(true);   // 6000 < 12000
      expect(uncompressed.hasCompression).toBe(false); // 35000 === 35000
    });

    it('should calculate compression ratio correctly', () => {
      // Given
      const data = ResourceTimingReportMothers.slowThirdPartyImage();
      const report = ResourceTimingReport.create(data); // 95000 encoded, 150000 decoded

      // When
      const ratio = report.compressionRatio;

      // Then
      expect(ratio).toBeCloseTo(0.367, 3); // (150000 - 95000) / 150000 ≈ 0.367
    });

    it('should identify primary bottleneck correctly for each scenario', () => {
      // Given
      const scenarios = [
        { data: ResourceTimingReportMothers.dnsBottleneck(), expected: 'dns' },     // 600ms DNS
        { data: ResourceTimingReportMothers.slowThirdPartyImage(), expected: 'download' }, // 500ms download
        { data: ResourceTimingReportMothers.httpFont(), expected: 'download' },     // 280ms download
        { data: ResourceTimingReportMothers.fastScript(), expected: 'download' },   // 175ms download
        { data: ResourceTimingReportMothers.cached(), expected: 'download' }        // 3ms download (minimal)
      ];

      scenarios.forEach(({ data, expected }) => {
        // When
        const report = ResourceTimingReport.create(data);
        const bottleneck = report.primaryBottleneck;

        // Then
        expect(bottleneck).toBe(expected);
      });
    });

    it('should detect detailed timing availability', () => {
      // Given
      const withTiming = ResourceTimingReport.create(ResourceTimingReportMothers.fastScript());
      const cached = ResourceTimingReport.create(ResourceTimingReportMothers.cached());

      // When & Then
      expect(withTiming.hasDetailedTiming).toBe(true);  // Has server processing > 0
      expect(cached.hasDetailedTiming).toBe(true);      // Has server processing = 2ms
    });

    it('should extract domain correctly', () => {
      // Given
      const scenarios = [
        { data: ResourceTimingReportMothers.fastScript(), expected: 'example.com' },
        { data: ResourceTimingReportMothers.slowThirdPartyImage(), expected: 'cdn.thirdparty.com' },
        { data: ResourceTimingReportMothers.compressedCSS(), expected: 'fonts.googleapis.com' }
      ];

      scenarios.forEach(({ data, expected }) => {
        // When
        const report = ResourceTimingReport.create(data);
        const domain = report.domain;

        // Then
        expect(domain).toBe(expected);
      });
    });
  });

  describe('toString', () => {
    it('should return formatted string with bottleneck when not none', () => {
      // Given
      const data = ResourceTimingReportMothers.dnsBottleneck();
      const report = ResourceTimingReport.create(data);

      // When
      const stringRepresentation = report.toString();

      // Then
      expect(stringRepresentation).toBe(
        'ResourceTimingReport: https://slow-dns.example.com/api/data.json - 800ms (bottleneck: dns)'
      );
    });

    it('should not show bottleneck when none detected', () => {
      // Given
      const data = {
        ...ResourceTimingReportMothers.cached(),
        // Create scenario where all timings are 0
        dnsLookup: TimeSegment.fromTiming(0, 0),
        tcpConnect: TimeSegment.fromTiming(0, 0),
        serverProcessing: TimeSegment.fromTiming(0, 0),
        contentDownload: TimeSegment.fromTiming(0, 0)
      };
      const report = ResourceTimingReport.create(data);

      // When
      const stringRepresentation = report.toString();

      // Then
      expect(stringRepresentation).toBe(
        'ResourceTimingReport: https://example.com/css/cached.css - 5ms'
      );
    });
  });

  describe('toJSON', () => {
    it('should return complete object representation with all properties', () => {
      // Given
      const data = ResourceTimingReportMothers.compressedCSS();
      const report = ResourceTimingReport.create(data);

      // When
      const jsonRepresentation = report.toJSON();

      // Then
      expect(jsonRepresentation).toEqual({
        // Basic metadata
        id: 'compressed-css-resource-003',
        createdAt: data.createdAt.absoluteTime,
        occurredAt: data.occurredAt.absoluteTime,

        // Resource identification
        name: data.name,
        domain: 'fonts.googleapis.com',
        type: data.type,

        // Overall timing
        duration: data.duration,
        startTime: data.startTime.absoluteTime,
        endTime: data.startTime.add(data.duration).absoluteTime,

        // Resource size and compression
        transferSize: data.transferSize,
        encodedSize: data.encodedSize,
        decodedSize: data.decodedSize,
        compressionRatio: 0.5, // (12000 - 6000) / 12000
        hasCompression: true,

        // Analysis
        isThirdParty: true,
        primaryBottleneck: 'download',

        // Detailed network timing segments
        dnsLookup: data.dnsLookup.toJSON(),
        tcpConnect: data.tcpConnect.toJSON(),
        serverProcessing: data.serverProcessing.toJSON(),
        contentDownload: data.contentDownload.toJSON(),
        tlsHandshake: data.tlsHandshake?.toJSON()
      });
    });

    it('should handle null TLS handshake correctly', () => {
      // Given
      const data = ResourceTimingReportMothers.httpFont();
      const report = ResourceTimingReport.create(data);

      // When
      const jsonRepresentation = report.toJSON();

      // Then
      expect(jsonRepresentation.tlsHandshake).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle cached resources with minimal data', () => {
      // Given
      const data = ResourceTimingReportMothers.cached();
      const report = ResourceTimingReport.create(data);

      // When & Then
      expect(report.transferSize).toBe(0);
      expect(report.hasCompression).toBe(false); // 0 < 8000 but decoded size doesn't reflect real compression
      expect(report.compressionRatio).toBe(1); // (8000 - 0) / 8000
      expect(report.isThirdParty).toBe(false);
      expect(report.domain).toBe('example.com');
    });

    it('should maintain immutability when accessing computed properties', () => {
      // Given
      const data = ResourceTimingReportMothers.slowThirdPartyImage();
      const report = ResourceTimingReport.create(data);

      // When
      const bottleneck1 = report.primaryBottleneck;
      const bottleneck2 = report.primaryBottleneck;
      const isThirdParty1 = report.isThirdParty;
      const isThirdParty2 = report.isThirdParty;

      // Then
      expect(bottleneck1).toBe(bottleneck2);
      expect(isThirdParty1).toBe(isThirdParty2);
      expect(Object.isFrozen(report)).toBe(true);
    });

    it('should handle invalid URLs gracefully', () => {
      // Given
      const data = {
        ...ResourceTimingReportMothers.fastScript(),
        name: 'invalid-url'
      };
      const report = ResourceTimingReport.create(data);

      // When & Then
      expect(report.domain).toBe('');
      expect(report.isThirdParty).toBe(false);
    });
  });
});