/* eslint-disable @typescript-eslint/no-extraneous-class */
import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { TimeSegment } from '@/value-objects/TimeSegment';
import { PerformanceNavigationTimingMother } from './PerformanceNavigationTimingMother';

/**
 * Object Mother for NetworkTimingReport test scenarios
 */
export class NetworkTimingReportMothers {
  /**
   * Fast network scenario - optimized connection with HTTP/2
   */
  static fastNetwork() {
    return {
      id: 'fast-network-timing-001',
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(0),
      transferSize: 15000,    // 15KB
      encodedSize: 12000,     // 12KB (compressed)
      decodedSize: 12000,     // 12KB (same - no compression for this scenario)
      redirects: TimeSegment.fromTiming(0, 0),           // No redirects
      dnsLookup: TimeSegment.fromTiming(0, 10),          // 10ms DNS (cached)
      tcpConnect: TimeSegment.fromTiming(10, 50),        // 40ms TCP
      tlsHandshake: TimeSegment.fromTiming(15, 50),      // 35ms TLS (within TCP)
      serverProcessing: TimeSegment.fromTiming(50, 100), // 50ms TTFB
      contentDownload: TimeSegment.fromTiming(100, 200)  // 100ms download
    };
  }

  /**
   * Slow network scenario - poor connectivity with bottlenecks
   */
  static slowNetwork() {
    return {
      id: 'slow-network-timing-002',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin + 1000),
      occurredAt: PerformanceTime.fromRelativeTime(100),
      transferSize: 85000,    // 85KB - large payload
      encodedSize: 75000,     // 75KB compressed
      decodedSize: 100000,    // 100KB uncompressed (25% compression)
      redirects: TimeSegment.fromTiming(0, 0),             // No redirects
      dnsLookup: TimeSegment.fromTiming(100, 200),         // 100ms DNS (slow)
      tcpConnect: TimeSegment.fromTiming(200, 400),        // 200ms TCP (high latency)
      tlsHandshake: TimeSegment.fromTiming(250, 400),      // 150ms TLS
      serverProcessing: TimeSegment.fromTiming(400, 800),  // 400ms TTFB (slow server)
      contentDownload: TimeSegment.fromTiming(800, 1500)   // 700ms download (large file)
    };
  }

  /**
   * Cached/minimal timing scenario - everything from cache
   */
  static cached() {
    return {
      id: 'cached-network-timing-003',
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(0),
      transferSize: 500,      // 500B - minimal
      encodedSize: 300,       // 300B
      decodedSize: 300,       // 300B (no compression)
      redirects: TimeSegment.fromTiming(0, 0),         // No redirects
      dnsLookup: TimeSegment.fromTiming(0, 0),         // 0ms DNS (cached)
      tcpConnect: TimeSegment.fromTiming(0, 0),        // 0ms TCP (keep-alive)
      tlsHandshake: undefined,                         // No TLS (HTTP or cached)
      serverProcessing: TimeSegment.fromTiming(0, 0),  // 0ms TTFB (304 Not Modified)
      contentDownload: TimeSegment.fromTiming(0, 1)    // 1ms minimal
    };
  }

  /**
   * Redirect scenario - includes redirect overhead
   */
  static withRedirects() {
    return {
      id: 'redirect-network-timing-004',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin + 500),
      occurredAt: PerformanceTime.fromRelativeTime(0),
      transferSize: 25000,    // 25KB
      encodedSize: 20000,     // 20KB
      decodedSize: 20000,     // 20KB (no compression)
      redirects: TimeSegment.fromTiming(0, 150),         // 150ms redirects
      dnsLookup: TimeSegment.fromTiming(150, 170),       // 20ms DNS
      tcpConnect: TimeSegment.fromTiming(170, 220),      // 50ms TCP
      tlsHandshake: TimeSegment.fromTiming(180, 220),    // 40ms TLS
      serverProcessing: TimeSegment.fromTiming(220, 300), // 80ms TTFB
      contentDownload: TimeSegment.fromTiming(300, 450)   // 150ms download
    };
  }

  /**
   * DNS bottleneck scenario - slow DNS resolution
   */
  static dnsBottleneck() {
    return {
      id: 'dns-bottleneck-timing-005',
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(0),
      transferSize: 10000,    // 10KB
      encodedSize: 8000,      // 8KB
      decodedSize: 8000,      // 8KB
      redirects: TimeSegment.fromTiming(0, 0),           // No redirects
      dnsLookup: TimeSegment.fromTiming(0, 500),         // 500ms DNS (bottleneck!)
      tcpConnect: TimeSegment.fromTiming(500, 550),      // 50ms TCP
      tlsHandshake: TimeSegment.fromTiming(510, 550),    // 40ms TLS
      serverProcessing: TimeSegment.fromTiming(550, 600), // 50ms TTFB
      contentDownload: TimeSegment.fromTiming(600, 700)   // 100ms download
    };
  }

  /**
   * Server bottleneck scenario - slow server processing (TTFB)
   */
  static serverBottleneck() {
    return {
      id: 'server-bottleneck-timing-006',
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(0),
      transferSize: 8000,     // 8KB
      encodedSize: 6000,      // 6KB  
      decodedSize: 8000,      // 8KB (25% compression)
      redirects: TimeSegment.fromTiming(0, 0),           // No redirects
      dnsLookup: TimeSegment.fromTiming(0, 10),          // 10ms DNS
      tcpConnect: TimeSegment.fromTiming(10, 50),        // 40ms TCP
      tlsHandshake: TimeSegment.fromTiming(15, 50),      // 35ms TLS
      serverProcessing: TimeSegment.fromTiming(50, 1050), // 1000ms TTFB (bottleneck!)
      contentDownload: TimeSegment.fromTiming(1050, 1150) // 100ms download
    };
  }

  /**
   * Download bottleneck scenario - large file download
   */
  static downloadBottleneck() {
    return {
      id: 'download-bottleneck-timing-007',
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(0),
      transferSize: 200000,   // 200KB - large file
      encodedSize: 150000,    // 150KB compressed
      decodedSize: 200000,    // 200KB uncompressed (25% compression)
      redirects: TimeSegment.fromTiming(0, 0),           // No redirects
      dnsLookup: TimeSegment.fromTiming(0, 10),          // 10ms DNS
      tcpConnect: TimeSegment.fromTiming(10, 50),        // 40ms TCP
      tlsHandshake: TimeSegment.fromTiming(15, 50),      // 35ms TLS
      serverProcessing: TimeSegment.fromTiming(50, 100),  // 50ms TTFB
      contentDownload: TimeSegment.fromTiming(100, 2100) // 2000ms download (bottleneck!)
    };
  }

  /**
   * HTTP scenario (no TLS) - insecure connection
   */
  static httpNoTls() {
    return {
      id: 'http-no-tls-timing-008',
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(0),
      transferSize: 5000,     // 5KB
      encodedSize: 5000,      // 5KB (no compression)
      decodedSize: 5000,      // 5KB
      redirects: TimeSegment.fromTiming(0, 0),         // No redirects
      dnsLookup: TimeSegment.fromTiming(0, 15),        // 15ms DNS
      tcpConnect: TimeSegment.fromTiming(15, 55),      // 40ms TCP
      tlsHandshake: undefined,                         // No TLS (HTTP)
      serverProcessing: TimeSegment.fromTiming(55, 105), // 50ms TTFB
      contentDownload: TimeSegment.fromTiming(105, 205)  // 100ms download
    };
  }

  /**
   * Creates a PerformanceNavigationTiming for testing fromPerformanceEntry
   */
  static createPerformanceNavigationTiming(scenario: 'fast' | 'slow' | 'cached' | 'redirects' = 'fast'): PerformanceNavigationTiming {
    switch (scenario) {
      case 'fast':
        return PerformanceNavigationTimingMother.fastPageLoad();
      case 'slow':
        return PerformanceNavigationTimingMother.slowPageLoad();
      case 'cached':
        return PerformanceNavigationTimingMother.minimalTiming();
      case 'redirects':
        return PerformanceNavigationTimingMother.withRedirects();
      default:
        return PerformanceNavigationTimingMother.fastPageLoad();
    }
  }
}