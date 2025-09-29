import { describe, it, expect, vi } from 'vitest';

import { NetworkTimingReportMothers } from '@/test/mothers/NetworkTimingReportMothers';

import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { TimeSegment } from '@/value-objects/TimeSegment';
import { NetworkTimingReport } from './NetworkTimingReport';

describe('NetworkTimingReport', () => {
  describe('create factory method', () => {
    it('should create NetworkTimingReport with provided data', () => {
      // Given
      const data = NetworkTimingReportMothers.fastNetwork();

      // When
      const report = NetworkTimingReport.create(data);

      // Then
      expect(report.id).toBe(data.id);
      expect(report.createdAt).toBe(data.createdAt);
      expect(report.occurredAt).toBe(data.occurredAt);
      expect(report.transferSize).toBe(15000);
      expect(report.encodedSize).toBe(12000);
      expect(report.decodedSize).toBe(12000);
    });

    it('should freeze the created report instance', () => {
      // Given
      const data = NetworkTimingReportMothers.fastNetwork();

      // When
      const report = NetworkTimingReport.create(data);

      // Then
      expect(Object.isFrozen(report)).toBe(true);
    });
  });

  describe('fromPerformanceEntry factory method', () => {
    it('should create NetworkTimingReport from PerformanceNavigationTiming data', () => {
      // Given
      const id = 'test-network-timing';
      const entry = NetworkTimingReportMothers.createPerformanceNavigationTiming('fast');
      vi.spyOn(PerformanceTime, 'now').mockReturnValue(
        PerformanceTime.fromAbsoluteTime(performance.timeOrigin)
      );

      // When
      const report = NetworkTimingReport.fromPerformanceEntry(id, entry);

      // Then
      expect(report.id).toBe(id);
      expect(report.transferSize).toBe(15000);
      expect(report.encodedSize).toBe(12000);
      expect(report.decodedSize).toBe(12000);
      expect(report.dnsLookup.duration).toBe(10);  // domainLookupEnd - domainLookupStart
      expect(report.tcpConnect.duration).toBe(40); // connectEnd - connectStart
      expect(report.tlsHandshake?.duration).toBe(35); // connectEnd - secureConnectionStart
    });

    it('should handle entries without TLS handshake correctly', () => {
      // Given
      const id = 'test-no-tls';
      const entry = NetworkTimingReportMothers.createPerformanceNavigationTiming('cached');

      // When
      const report = NetworkTimingReport.fromPerformanceEntry(id, entry);

      // Then
      expect(report.tlsHandshake?.duration || 0).toBe(0);
    });
  });

  describe('individual timing getters', () => {
    it('should return correct DNS lookup time', () => {
      // Given
      const data = NetworkTimingReportMothers.dnsBottleneck();
      const report = NetworkTimingReport.create(data);

      // When
      const dnsTime = report.dnsLookup.duration;

      // Then
      expect(dnsTime).toBe(500); // Primary bottleneck in this scenario
    });

    it('should return correct TCP connection time', () => {
      // Given
      const data = NetworkTimingReportMothers.slowNetwork();
      const report = NetworkTimingReport.create(data);

      // When
      const tcpTime = report.tcpConnect.duration;

      // Then
      expect(tcpTime).toBe(200); // 400 - 200
    });

    it('should return correct TLS handshake time when present', () => {
      // Given
      const data = NetworkTimingReportMothers.fastNetwork();
      const report = NetworkTimingReport.create(data);

      // When
      const tlsTime = report.tlsHandshake?.duration || 0;

      // Then
      expect(tlsTime).toBe(35); // 50 - 15
    });

    it('should return zero TLS handshake time when not present', () => {
      // Given
      const data = NetworkTimingReportMothers.httpNoTls();
      const report = NetworkTimingReport.create(data);

      // When
      const tlsTime = report.tlsHandshake?.duration || 0;

      // Then
      expect(tlsTime).toBe(0);
    });

    it('should return correct time to first byte (TTFB)', () => {
      // Given
      const data = NetworkTimingReportMothers.serverBottleneck();
      const report = NetworkTimingReport.create(data);

      // When
      const ttfb = report.serverProcessing.duration;

      // Then
      expect(ttfb).toBe(1000); // Primary bottleneck in this scenario
    });

    it('should return correct response download time', () => {
      // Given
      const data = NetworkTimingReportMothers.downloadBottleneck();
      const report = NetworkTimingReport.create(data);

      // When
      const responseTime = report.contentDownload.duration;

      // Then
      expect(responseTime).toBe(2000); // Primary bottleneck in this scenario
    });

    it('should return correct redirect time', () => {
      // Given
      const data = NetworkTimingReportMothers.withRedirects();
      const report = NetworkTimingReport.create(data);

      // When
      const redirectTime = report.redirects.duration;

      // Then
      expect(redirectTime).toBe(150);
    });
  });

  describe('computed metrics', () => {
    it('should calculate connection setup time as DNS + TCP + TLS', () => {
      // Given
      const data = NetworkTimingReportMothers.fastNetwork();
      const report = NetworkTimingReport.create(data);

      // When
      const setupTime = report.connectionSetupTime;

      // Then
      expect(setupTime).toBe(85); // 10 + 40 + 35
    });

    it('should calculate request response time as TTFB + download', () => {
      // Given
      const data = NetworkTimingReportMothers.slowNetwork();
      const report = NetworkTimingReport.create(data);

      // When
      const requestResponseTime = report.serverProcessing.duration + report.contentDownload.duration;

      // Then
      expect(requestResponseTime).toBe(1100); // 400 + 700
    });

    it('should calculate total network time including all phases', () => {
      // Given
      const data = NetworkTimingReportMothers.withRedirects();
      const report = NetworkTimingReport.create(data);

      // When
      const totalTime = report.totalNetworkTime;

      // Then
      expect(totalTime).toBe(490); // 150 (redirects) + 110 (setup: 20+50+40) + 230 (request: 80+150)
    });

    it('should calculate pure network time excluding redirects', () => {
      // Given
      const data = NetworkTimingReportMothers.withRedirects();
      const report = NetworkTimingReport.create(data);

      // When
      const pureTime = report.totalNetworkTime - report.redirects.duration;

      // Then
      expect(pureTime).toBe(340); // Total 490 - redirects 150
    });
  });

  describe('analysis methods', () => {
    it('should detect when redirects occurred', () => {
      // Given
      const withRedirects = NetworkTimingReport.create(NetworkTimingReportMothers.withRedirects());
      const withoutRedirects = NetworkTimingReport.create(NetworkTimingReportMothers.fastNetwork());

      // When & Then
      expect(withRedirects.redirects.duration > 0).toBe(true);
      expect(withoutRedirects.redirects.duration > 0).toBe(false);
    });

    it('should detect when compression is applied', () => {
      // Given
      const compressed = NetworkTimingReport.create(NetworkTimingReportMothers.slowNetwork());
      const uncompressed = NetworkTimingReport.create(NetworkTimingReportMothers.fastNetwork());

      // When & Then
      expect(compressed.hasCompression).toBe(true);  // 75000 < 100000
      expect(uncompressed.hasCompression).toBe(false); // 12000 === 12000
    });

    it('should calculate compression ratio correctly', () => {
      // Given
      const data = NetworkTimingReportMothers.serverBottleneck();
      const report = NetworkTimingReport.create(data); // 6000 encoded, 8000 decoded

      // When
      const ratio = report.compressionRatio;

      // Then
      expect(ratio).toBe(0.25); // (8000 - 6000) / 8000 = 0.25 (25% compression)
    });

    it('should return zero compression ratio when no content', () => {
      // Given
      const data = NetworkTimingReportMothers.cached();
      const report = NetworkTimingReport.create(data);

      // When
      const ratio = report.compressionRatio;

      // Then
      expect(ratio).toBe(0);
    });

    it('should calculate download speed in KB/s', () => {
      // Given
      const data = NetworkTimingReportMothers.downloadBottleneck();
      const report = NetworkTimingReport.create(data); // 200KB in 2000ms

      // When
      const kilobytes = report.transferSize / 1024;
      const seconds = report.contentDownload.duration / 1000;
      const speed = Math.round(kilobytes / seconds);

      // Then
      expect(speed).toBe(98); // (200000/1024) / (2000/1000) = 195.31/2 ≈ 98 KB/s
    });

    it('should return zero download speed when no transfer time', () => {
      // Given - create a custom scenario with zero response time
      const data = {
        ...NetworkTimingReportMothers.cached(),
        contentDownload: TimeSegment.fromTiming(0, 0) // 0ms download time
      };
      const report = NetworkTimingReport.create(data);

      // When
      const speed = report.contentDownload.duration === 0 || report.transferSize === 0 
        ? 0 
        : Math.round((report.transferSize / 1024) / (report.contentDownload.duration / 1000));

      // Then
      expect(speed).toBe(0);
    });

    it('should identify primary bottleneck correctly for each scenario', () => {
      // Given
      const scenarios = [
        { data: NetworkTimingReportMothers.dnsBottleneck(), expected: 'dns' },
        { data: NetworkTimingReportMothers.serverBottleneck(), expected: 'server' },
        { data: NetworkTimingReportMothers.downloadBottleneck(), expected: 'download' },
        { data: NetworkTimingReportMothers.withRedirects(), expected: 'redirects' }, // 150ms redirects vs 150ms download (redirects wins tie)
        { data: NetworkTimingReportMothers.fastNetwork(), expected: 'download' } // 100ms download is highest
      ];

      scenarios.forEach(({ data, expected }) => {
        // When
        const report = NetworkTimingReport.create(data);
        const bottleneck = report.primaryBottleneck;

        // Then
        expect(bottleneck).toBe(expected);
      });
    });
  });

  describe('toString', () => {
    it('should return simplified formatted string with total network time', () => {
      // Given
      const data = NetworkTimingReportMothers.serverBottleneck();
      const report = NetworkTimingReport.create(data);

      // When
      const stringRepresentation = report.toString();

      // Then
      expect(stringRepresentation).toBe('NetworkTiming: 1185ms (bottleneck: server)');
    });

    it('should handle different timing scenarios consistently', () => {
      // Given
      const scenarios = [
        { data: NetworkTimingReportMothers.fastNetwork(), expected: 'NetworkTiming: 235ms (bottleneck: download)' },
        { data: NetworkTimingReportMothers.slowNetwork(), expected: 'NetworkTiming: 1550ms (bottleneck: download)' },
        { data: NetworkTimingReportMothers.cached(), expected: 'NetworkTiming: 1ms (bottleneck: download)' }
      ];

      scenarios.forEach(({ data, expected }) => {
        // When
        const report = NetworkTimingReport.create(data);
        const result = report.toString();

        // Then
        expect(result).toBe(expected);
      });
    });
  });

  describe('toJSON', () => {
    it('should return complete object representation with all metrics and segments', () => {
      // Given
      const data = NetworkTimingReportMothers.slowNetwork();
      const report = NetworkTimingReport.create(data);

      // When
      const jsonRepresentation = report.toJSON();

      // Then
      expect(jsonRepresentation).toEqual({
        // Basic metadata
        id: 'slow-network-timing-002',
        createdAt: data.createdAt.absoluteTime,
        occurredAt: data.occurredAt.absoluteTime,

        // Size and compression
        transferSize: data.transferSize,
        encodedSize: data.encodedSize,
        decodedSize: data.decodedSize,

        // Computed timings
        compressionRatio: 0.25,
        hasCompression: true,
        totalNetworkTime: 1550, // 0 + 450 (setup: 100+200+150) + 1100 (request: 400+700)
        connectionSetupTime: 450, // 100 + 200 + 150
        
        // Analysis
        primaryBottleneck: 'download',

        // Detailed segments
        redirects: {
          duration: 0,
          start: data.redirects.start.absoluteTime,
          end: data.redirects.end.absoluteTime
        },
        dnsLookup: {
          duration: data.dnsLookup.duration,
          start: data.dnsLookup.start.absoluteTime,
          end: data.dnsLookup.end.absoluteTime
        },
        tcpConnect: {
          duration: data.tcpConnect.duration,
          start: data.tcpConnect.start.absoluteTime,
          end: data.tcpConnect.end.absoluteTime
        },
        serverProcessing: {
          duration: data.serverProcessing.duration,
          start: data.serverProcessing.start.absoluteTime,
          end: data.serverProcessing.end.absoluteTime
        },
        contentDownload: {
          duration: data.contentDownload.duration,
          start: data.contentDownload.start.absoluteTime,
          end: data.contentDownload.end.absoluteTime
        },
        tlsHandshake: {
          duration: data.tlsHandshake.duration,
          start: data.tlsHandshake.start.absoluteTime,
          end: data.tlsHandshake.end.absoluteTime
        }
      });
    });

    it('should handle null TLS handshake correctly', () => {
      // Given
      const data = NetworkTimingReportMothers.httpNoTls();
      const report = NetworkTimingReport.create(data);

      // When
      const jsonRepresentation = report.toJSON();

      // Then
      expect(jsonRepresentation.tlsHandshake).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('should handle cached content with minimal timings', () => {
      // Given
      const data = NetworkTimingReportMothers.cached();
      const report = NetworkTimingReport.create(data);

      // When & Then
      expect(report.dnsLookup.duration).toBe(0);
      expect(report.tcpConnect.duration).toBe(0);
      expect(report.tlsHandshake?.duration || 0).toBe(0);
      expect(report.serverProcessing.duration).toBe(0);
      expect(report.contentDownload.duration).toBe(1);
      expect(report.totalNetworkTime).toBe(1);
      expect(report.redirects.duration > 0).toBe(false);
      expect(report.hasCompression).toBe(false);
    });

    it('should maintain immutability when accessing calculated properties', () => {
      // Given
      const data = NetworkTimingReportMothers.fastNetwork();
      const report = NetworkTimingReport.create(data);

      // When
      const time1 = report.totalNetworkTime;
      const time2 = report.totalNetworkTime;
      const bottleneck1 = report.primaryBottleneck;
      const bottleneck2 = report.primaryBottleneck;

      // Then
      expect(time1).toBe(time2);
      expect(bottleneck1).toBe(bottleneck2);
      expect(Object.isFrozen(report)).toBe(true);
    });
  });
});