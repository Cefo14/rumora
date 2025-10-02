/* eslint-disable @typescript-eslint/no-extraneous-class */
import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { TimeSegment } from '@/value-objects/TimeSegment';
import { PerformanceResourceTimingMother } from './PerformanceResourceTimingMother';

/**
 * Object Mother for ResourceTimingReport test scenarios
 */
export class ResourceTimingReportMothers {
  /**
   * Fast script loading from same domain
   */
  static fastScript() {
    return {
      id: 'fast-script-resource-001',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin),
      occurredAt: PerformanceTime.fromRelativeTime(100),
      name: 'https://example.com/js/main.js',
      type: 'script',
      duration: 250,
      startTime: PerformanceTime.fromRelativeTime(100),
      transferSize: 45000,
      encodedSize: 35000,
      decodedSize: 35000,
      dnsLookup: TimeSegment.fromTiming(100, 105),        // 5ms
      tcpConnect: TimeSegment.fromTiming(105, 125),       // 20ms
      tlsHandshake: TimeSegment.fromTiming(110, 125),     // 15ms
      serverProcessing: TimeSegment.fromTiming(125, 175), // 50ms
      contentDownload: TimeSegment.fromTiming(175, 350)   // 175ms
    };
  }

  /**
   * Slow third-party image with compression
   */
  static slowThirdPartyImage() {
    return {
      id: 'slow-image-resource-002',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin + 500),
      occurredAt: PerformanceTime.fromRelativeTime(500),
      name: 'https://cdn.thirdparty.com/images/hero.jpg',
      type: 'img',
      duration: 1200,
      startTime: PerformanceTime.fromRelativeTime(500),
      transferSize: 120000,
      encodedSize: 95000,      // Compressed
      decodedSize: 150000,     // 36% compression
      dnsLookup: TimeSegment.fromTiming(500, 650),        // 150ms
      tcpConnect: TimeSegment.fromTiming(650, 850),       // 200ms
      tlsHandshake: TimeSegment.fromTiming(700, 850),     // 150ms
      serverProcessing: TimeSegment.fromTiming(850, 1200), // 350ms
      contentDownload: TimeSegment.fromTiming(1200, 1700) // 500ms
    };
  }

  /**
   * Compressed CSS with TLS
   */
  static compressedCSS() {
    return {
      id: 'compressed-css-resource-003',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin),
      occurredAt: PerformanceTime.fromRelativeTime(200),
      name: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700',
      type: 'link',
      duration: 180,
      startTime: PerformanceTime.fromRelativeTime(200),
      transferSize: 8000,
      encodedSize: 6000,       // Compressed
      decodedSize: 12000,      // 50% compression
      dnsLookup: TimeSegment.fromTiming(200, 210),        // 10ms
      tcpConnect: TimeSegment.fromTiming(210, 260),       // 50ms
      tlsHandshake: TimeSegment.fromTiming(220, 260),     // 40ms
      serverProcessing: TimeSegment.fromTiming(260, 300), // 40ms
      contentDownload: TimeSegment.fromTiming(300, 380)   // 80ms
    };
  }

  /**
   * Cached resource with minimal timing
   */
  static cached() {
    return {
      id: 'cached-resource-004',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin),
      occurredAt: PerformanceTime.fromRelativeTime(50),
      name: 'https://example.com/css/cached.css',
      type: 'link',
      duration: 5,
      startTime: PerformanceTime.fromRelativeTime(50),
      transferSize: 0,         // From cache
      encodedSize: 0,
      decodedSize: 8000,
      dnsLookup: TimeSegment.fromTiming(0, 0),            // 0ms (cached)
      tcpConnect: TimeSegment.fromTiming(0, 0),           // 0ms (keep-alive)
      tlsHandshake: undefined,                            // No TLS needed
      serverProcessing: TimeSegment.fromTiming(50, 52),   // 2ms (304 check)
      contentDownload: TimeSegment.fromTiming(52, 55)     // 3ms
    };
  }

  /**
   * Font resource without TLS (HTTP)
   */
  static httpFont() {
    return {
      id: 'http-font-resource-005',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin),
      occurredAt: PerformanceTime.fromRelativeTime(300),
      name: 'http://fonts.example.com/fonts/roboto.woff2',
      type: 'css',
      duration: 400,
      startTime: PerformanceTime.fromRelativeTime(300),
      transferSize: 25000,
      encodedSize: 22000,
      decodedSize: 22000,
      dnsLookup: TimeSegment.fromTiming(300, 320),        // 20ms
      tcpConnect: TimeSegment.fromTiming(320, 370),       // 50ms
      tlsHandshake: undefined,                            // No TLS (HTTP)
      serverProcessing: TimeSegment.fromTiming(370, 420), // 50ms
      contentDownload: TimeSegment.fromTiming(420, 700)   // 280ms
    };
  }

  /**
   * DNS bottleneck scenario
   */
  static dnsBottleneck() {
    return {
      id: 'dns-bottleneck-resource-006',
      createdAt: PerformanceTime.fromAbsoluteTime(performance.timeOrigin),
      occurredAt: PerformanceTime.fromRelativeTime(1000),
      name: 'https://slow-dns.example.com/api/data.json',
      type: 'fetch',
      duration: 800,
      startTime: PerformanceTime.fromRelativeTime(1000),
      transferSize: 5000,
      encodedSize: 3000,
      decodedSize: 4000,
      dnsLookup: TimeSegment.fromTiming(1000, 1600),      // 600ms (bottleneck!)
      tcpConnect: TimeSegment.fromTiming(1600, 1650),     // 50ms
      tlsHandshake: TimeSegment.fromTiming(1610, 1650),   // 40ms
      serverProcessing: TimeSegment.fromTiming(1650, 1700), // 50ms
      contentDownload: TimeSegment.fromTiming(1700, 1800)  // 100ms
    };
  }

  /**
   * Creates a PerformanceResourceTiming for testing fromPerformanceResourceTiming
   */
  static createPerformanceResourceTiming(
    scenario: 'script' | 'image' | 'css' | 'cached' | 'font' | 'dns' = 'script'
  ): PerformanceResourceTiming {
    switch (scenario) {
      case 'script':
        return PerformanceResourceTimingMother.fastScript();
      case 'image':
        return PerformanceResourceTimingMother.slowThirdPartyImage();
      case 'css':
        return PerformanceResourceTimingMother.compressedCSS();
      case 'cached':
        return PerformanceResourceTimingMother.cached();
      case 'font':
        return PerformanceResourceTimingMother.httpFont();
      case 'dns':
        return PerformanceResourceTimingMother.dnsBottleneck();
      default:
        return PerformanceResourceTimingMother.fastScript();
    }
  }
}