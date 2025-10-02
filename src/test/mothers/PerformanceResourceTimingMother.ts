/* eslint-disable @typescript-eslint/no-extraneous-class */
/**
 * Object Mother for PerformanceResourceTiming test scenarios
 */
export class PerformanceResourceTimingMother {
  /**
   * Fast script loading from same domain
   */
  static fastScript(): PerformanceResourceTiming {
    return {
      // Required PerformanceEntry properties
      name: 'https://example.com/js/main.js',
      entryType: 'resource',
      startTime: 100,
      duration: 250,

      // PerformanceResourceTiming properties
      initiatorType: 'script',
      nextHopProtocol: 'h2',
      workerStart: 0,
      transferSize: 45000,
      encodedBodySize: 35000,
      decodedBodySize: 35000, // No compression
      responseStatus: 200,
      serverTiming: [],
      redirectStart: 0,
      redirectEnd: 0,

      // Network timing
      fetchStart: 100,
      domainLookupStart: 100,
      domainLookupEnd: 105,     // 5ms DNS
      connectStart: 105,
      connectEnd: 125,          // 20ms TCP
      secureConnectionStart: 110,
      requestStart: 125,
      responseStart: 175,       // 50ms server processing
      responseEnd: 350,         // 175ms download

      toJSON: () => ({})
    } as PerformanceResourceTiming;
  }

  /**
   * Slow third-party image with compression
   */
  static slowThirdPartyImage(): PerformanceResourceTiming {
    return {
      // Required PerformanceEntry properties
      name: 'https://cdn.thirdparty.com/images/hero.jpg',
      entryType: 'resource',
      startTime: 500,
      duration: 1200,

      // PerformanceResourceTiming properties
      initiatorType: 'img',
      nextHopProtocol: 'http/1.1',
      workerStart: 0,
      transferSize: 120000,
      encodedBodySize: 95000,   // Compressed
      decodedBodySize: 150000,  // 36% compression ratio
      responseStatus: 200,
      serverTiming: [],
      redirectStart: 0,
      redirectEnd: 0,

      // Network timing
      fetchStart: 500,
      domainLookupStart: 500,
      domainLookupEnd: 650,     // 150ms DNS (slow)
      connectStart: 650,
      connectEnd: 850,          // 200ms TCP (high latency)
      secureConnectionStart: 700,
      requestStart: 850,
      responseStart: 1200,      // 350ms server processing
      responseEnd: 1700,        // 500ms download

      toJSON: () => ({})
    } as PerformanceResourceTiming;
  }

  /**
   * Compressed CSS with TLS
   */
  static compressedCSS(): PerformanceResourceTiming {
    return {
      // Required PerformanceEntry properties
      name: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700',
      entryType: 'resource',
      startTime: 200,
      duration: 180,

      // PerformanceResourceTiming properties
      initiatorType: 'link',
      nextHopProtocol: 'h2',
      workerStart: 0,
      transferSize: 8000,
      encodedBodySize: 6000,    // Compressed
      decodedBodySize: 12000,   // 50% compression ratio
      responseStatus: 200,
      serverTiming: [],
      redirectStart: 0,
      redirectEnd: 0,

      // Network timing
      fetchStart: 200,
      domainLookupStart: 200,
      domainLookupEnd: 210,     // 10ms DNS
      connectStart: 210,
      connectEnd: 260,          // 50ms TCP
      secureConnectionStart: 220,
      requestStart: 260,
      responseStart: 300,       // 40ms server processing
      responseEnd: 380,         // 80ms download

      toJSON: () => ({})
    } as PerformanceResourceTiming;
  }

  /**
   * Cached resource with minimal timing
   */
  static cached(): PerformanceResourceTiming {
    return {
      // Required PerformanceEntry properties
      name: 'https://example.com/css/cached.css',
      entryType: 'resource',
      startTime: 50,
      duration: 5,

      // PerformanceResourceTiming properties
      initiatorType: 'link',
      nextHopProtocol: 'h2',
      workerStart: 0,
      transferSize: 0,          // From cache
      encodedBodySize: 0,
      decodedBodySize: 8000,    // Original size
      responseStatus: 304,
      serverTiming: [],
      redirectStart: 0,
      redirectEnd: 0,

      // Network timing (all minimal/cached)
      fetchStart: 50,
      domainLookupStart: 0,
      domainLookupEnd: 0,       // 0ms DNS (cached)
      connectStart: 0,
      connectEnd: 0,            // 0ms TCP (keep-alive)
      secureConnectionStart: 0,
      requestStart: 50,
      responseStart: 52,        // 2ms server (304 check)
      responseEnd: 55,          // 3ms response

      toJSON: () => ({})
    } as PerformanceResourceTiming;
  }

  /**
   * Font resource without TLS (HTTP)
   */
  static httpFont(): PerformanceResourceTiming {
    return {
      // Required PerformanceEntry properties
      name: 'http://fonts.example.com/fonts/roboto.woff2',
      entryType: 'resource',
      startTime: 300,
      duration: 400,

      // PerformanceResourceTiming properties
      initiatorType: 'css',
      nextHopProtocol: 'http/1.1',
      workerStart: 0,
      transferSize: 25000,
      encodedBodySize: 22000,
      decodedBodySize: 22000,   // Font files usually not compressed further
      responseStatus: 200,
      serverTiming: [],
      redirectStart: 0,
      redirectEnd: 0,

      // Network timing (no TLS)
      fetchStart: 300,
      domainLookupStart: 300,
      domainLookupEnd: 320,     // 20ms DNS
      connectStart: 320,
      connectEnd: 370,          // 50ms TCP
      secureConnectionStart: 0, // No TLS for HTTP
      requestStart: 370,
      responseStart: 420,       // 50ms server processing
      responseEnd: 700,         // 280ms download

      toJSON: () => ({})
    } as PerformanceResourceTiming;
  }

  /**
   * DNS bottleneck scenario
   */
  static dnsBottleneck(): PerformanceResourceTiming {
    return {
      // Required PerformanceEntry properties
      name: 'https://slow-dns.example.com/api/data.json',
      entryType: 'resource',
      startTime: 1000,
      duration: 800,

      // PerformanceResourceTiming properties
      initiatorType: 'fetch',
      nextHopProtocol: 'h2',
      workerStart: 0,
      transferSize: 5000,
      encodedBodySize: 3000,
      decodedBodySize: 4000,
      responseStatus: 200,
      serverTiming: [],
      redirectStart: 0,
      redirectEnd: 0,

      // Network timing (DNS is the bottleneck)
      fetchStart: 1000,
      domainLookupStart: 1000,
      domainLookupEnd: 1600,    // 600ms DNS (bottleneck!)
      connectStart: 1600,
      connectEnd: 1650,         // 50ms TCP
      secureConnectionStart: 1610,
      requestStart: 1650,
      responseStart: 1700,      // 50ms server processing
      responseEnd: 1800,        // 100ms download

      toJSON: () => ({})
    } as PerformanceResourceTiming;
  }
}