import type { Report } from '@/reports/Report';
import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { TimeSegment } from '@/value-objects/TimeSegment';

/**
 * Grouped network timing segments for navigation timing analysis
 */
interface NavigationSegments {
  redirects: TimeSegment
  dnsLookup: TimeSegment;
  tcpConnect: TimeSegment;
  tlsHandshake?: TimeSegment;
  serverProcessing: TimeSegment;
  contentDownload: TimeSegment;
}

/**
 * Data structure for creating a NetworkTimingReport.
 */
interface NetworkTimingData {
  id: string;
  createdAt: PerformanceTime;
  occurredAt: PerformanceTime;
  
  // Size information
  transferSize: number;
  encodedSize: number;
  decodedSize: number;
  
  // Network segments
  redirects: TimeSegment;
  dnsLookup: TimeSegment;
  tcpConnect: TimeSegment;
  tlsHandshake?: TimeSegment;
  serverProcessing: TimeSegment;
  contentDownload: TimeSegment;
}

/**
 * Report for measuring network timing performance during navigation.
 * 
 * Tracks the time spent in different phases of network communication,
 * from DNS resolution to complete response download. Uses the same
 * TimeSegment pattern as ResourceTimingReport for consistency.
 */
export class NetworkTimingReport implements Report {
  /** Unique identifier for the report */
  public readonly id: string;
  
  /** Timestamp when the report was created */
  public readonly createdAt: PerformanceTime;

  /** Timestamp when the event occurred */
  public readonly occurredAt: PerformanceTime;

  /** Transfer size in bytes (actual bytes over network including headers) */
  public readonly transferSize: number;

  /** Encoded body size in bytes (compressed size) */
  public readonly encodedSize: number;

  /** Decoded body size in bytes (uncompressed size) */
  public readonly decodedSize: number;

  /** Time spent on redirects if any occurred */
  private readonly redirects: TimeSegment;

  /** DNS resolution timing */
  private readonly dnsLookup: TimeSegment;

  /** TCP connection establishment */
  private readonly tcpConnect: TimeSegment;

  /** TLS/SSL handshake (only for HTTPS) */
  private readonly tlsHandshake?: TimeSegment;

  /** Server processing time (request sent to first byte received) */
  private readonly serverProcessing: TimeSegment;

  /** Content download time */
  private readonly contentDownload: TimeSegment;

  /**
   * Creates a new NetworkTimingReport instance.
   * 
   * @param data - Network timing data
   * @private
   */
  private constructor(data: NetworkTimingData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.occurredAt = data.occurredAt;
    this.transferSize = data.transferSize;
    this.encodedSize = data.encodedSize;
    this.decodedSize = data.decodedSize;
    this.redirects = data.redirects;
    this.dnsLookup = data.dnsLookup;
    this.tcpConnect = data.tcpConnect;
    this.tlsHandshake = data.tlsHandshake;
    this.serverProcessing = data.serverProcessing;
    this.contentDownload = data.contentDownload;

    Object.freeze(this);
  }

  /**
   * Creates a NetworkTimingReport from provided data.
   * 
   * @param data - Network timing data
   * @returns New NetworkTimingReport instance
   */
  public static create(data: NetworkTimingData): NetworkTimingReport {
    return new NetworkTimingReport(data);
  }

  /**
   * Creates a NetworkTimingReport from PerformanceNavigationTiming data.
   * 
   * @param id - Unique identifier for the report
   * @param entry - PerformanceNavigationTiming entry from the browser
   * @returns New NetworkTimingReport instance with calculated network segments
   */
  public static fromPerformanceEntry(
    id: string, 
    entry: PerformanceNavigationTiming
  ): NetworkTimingReport {
    // Calculate network timing segments
    const segments = this.calculateNavigationSegments(entry);
    
    return new NetworkTimingReport({
      id,
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(entry.startTime),
      transferSize: entry.transferSize || 0,
      encodedSize: entry.encodedBodySize || 0,
      decodedSize: entry.decodedBodySize || 0,
      redirects: segments.redirects,
      dnsLookup: segments.dnsLookup,
      tcpConnect: segments.tcpConnect,
      tlsHandshake: segments.tlsHandshake,
      serverProcessing: segments.serverProcessing,
      contentDownload: segments.contentDownload,
    });
  }

  /**
   * Calculates network timing segments from PerformanceNavigationTiming entry.
   * 
   * @param entry - Performance navigation timing entry
   * @param fromRelativeTime - Helper function to create PerformanceTime
   * @returns Calculated navigation segments
   * @private
   */
  private static calculateNavigationSegments(
    entry: PerformanceNavigationTiming,
  ): NavigationSegments {
    // Redirects: time spent on any redirects
    const redirects: TimeSegment = TimeSegment.fromTiming(
      entry.redirectStart,
      entry.redirectEnd
    );

    // DNS Lookup: domain resolution time
    const dnsLookup: TimeSegment = TimeSegment.fromTiming(
      entry.domainLookupStart,
      entry.domainLookupEnd
    );

    // TCP Connect: connection establishment time
    const tcpConnect: TimeSegment = TimeSegment.fromTiming(
      entry.connectStart,
      entry.connectEnd
    );

    // TLS Handshake: SSL/TLS negotiation (only for HTTPS)
    let tlsHandshake: TimeSegment | undefined;
    if (entry.secureConnectionStart > 0 && entry.secureConnectionStart <= entry.connectEnd) {
      tlsHandshake = TimeSegment.fromTiming(
        entry.secureConnectionStart,
        entry.connectEnd
      );
    }

    // Server Processing: time from request sent to first response byte (TTFB)
    const serverProcessing: TimeSegment = TimeSegment.fromTiming(
      entry.requestStart,
      entry.responseStart
    );

    // Content Download: time to download the complete response
    const contentDownload: TimeSegment = TimeSegment.fromTiming(
      entry.responseStart,
      entry.responseEnd
    );

    return {
      redirects,
      dnsLookup,
      tcpConnect,
      tlsHandshake,
      serverProcessing,
      contentDownload
    };
  }

  // ===== TIMING SEGMENT GETTERS =====

  /**
   * Time spent resolving domain name to IP address in milliseconds.
   * 
   * - DNS cache hit: 0-1ms
   * - Fast DNS: 5-20ms  
   * - Slow DNS: 100-500ms
   */
  public get dnsLookupTime(): number {
    return this.dnsLookup.duration;
  }

  /**
   * Time spent establishing TCP connection to server in milliseconds.
   * 
   * - Local server: 1-10ms
   * - Same continent: 20-100ms
   * - Cross-continental: 100-300ms
   */
  public get tcpConnectTime(): number {
    return this.tcpConnect.duration;
  }

  /**
   * Time spent on SSL/TLS handshake for HTTPS connections in milliseconds.
   * 
   * - HTTP connections: 0ms
   * - Modern TLS 1.3: 10-50ms
   * - Legacy TLS 1.2: 50-150ms
   */
  public get tlsHandshakeTime(): number {
    return this.tlsHandshake?.duration || 0;
  }

  /**
   * Time until server sends the first byte of response (server processing time) in milliseconds.
   * 
   * Core Web Vitals thresholds:
   * - Good: < 200ms
   * - Needs improvement: 200-600ms  
   * - Poor: > 600ms
   */
  public get timeToFirstByte(): number {
    return this.serverProcessing.duration;
  }

  /**
   * Time spent downloading the complete response body in milliseconds.
   * 
   * Depends on response size and network bandwidth.
   * Excludes connection setup and server processing time.
   */
  public get responseTime(): number {
    return this.contentDownload.duration;
  }

  /**
   * Time spent on redirects if any occurred in milliseconds.
   * 
   * 0ms if no redirects happened.
   * Each redirect adds ~100-300ms typically.
   */
  public get redirectTime(): number {
    return this.redirects.duration;
  }

  // ===== COMPUTED METRICS =====

  /**
   * Time spent establishing connection to server in milliseconds.
   * 
   * Total time to establish a connection before sending request.
   * Good target: < 100ms for optimal performance.
   * 
   * @returns DNS + TCP + TLS combined
   */
  public get connectionSetupTime(): number {
    return this.dnsLookupTime + this.tcpConnectTime + this.tlsHandshakeTime;
  }

  /**
   * Total time for request and response (excluding connection setup) in milliseconds.
   * 
   * Time spent on actual data transfer after connection is established.
   * 
   * @returns TTFB + Response download time
   */
  public get requestResponseTime(): number {
    return this.timeToFirstByte + this.responseTime;
  }

  /**
   * Total time spent on all network operations in milliseconds.
   * 
   * Includes redirects, connection setup, and data transfer.
   * Good target: < 500ms for optimal user experience.
   * 
   * @returns Complete network timing from start to finish
   */
  public get totalNetworkTime(): number {
    return this.redirectTime + this.connectionSetupTime + this.requestResponseTime;
  }

  /**
   * Time spent on network communication (excluding redirects) in milliseconds.
   * 
   * Pure network performance without redirect penalties.
   * 
   * @returns Network time without redirect overhead
   */
  public get pureNetworkTime(): number {
    return this.connectionSetupTime + this.requestResponseTime;
  }

  /**
   * Check if there were redirects.
   * 
   * Redirects add latency and should be minimized.
   * 
   * @returns true if any redirect time was recorded
   */
  public get hasRedirects(): boolean {
    return this.redirectTime > 0;
  }

  /**
   * Checks if the main document has compression applied.
   * 
   * @returns True if encoded size is smaller than decoded size
   */
  public get hasCompression(): boolean {
    return this.encodedSize < this.decodedSize && this.decodedSize > 0;
  }

  /**
   * Calculates compression ratio of the main document.
   * 
   * @returns Compression ratio (0-1), where higher values mean better compression
   */
  public get compressionRatio(): number {
    if (this.decodedSize === 0) return 0;
    return Math.max(0, (this.decodedSize - this.encodedSize) / this.decodedSize);
  }

  /**
   * Gets download speed in KB/s based on content download time and transfer size.
   * 
   * @returns Download speed in KB/s, or 0 if no download time recorded
   */
  public get downloadSpeed(): number {
    if (this.responseTime === 0 || this.transferSize === 0) return 0;
    // Convert bytes to KB and ms to seconds: (bytes / 1024) / (ms / 1000)
    return Math.round((this.transferSize / 1024) / (this.responseTime / 1000));
  }

  /**
   * Identifies the primary bottleneck phase in the network timing.
   * 
   * @returns The phase with the highest time consumption
   */
  public get primaryBottleneck(): 'redirects' | 'dns' | 'tcp' | 'tls' | 'server' | 'download' {
    let maxDuration = 0;
    let bottleneck: 'redirects' | 'dns' | 'tcp' | 'tls' | 'server' | 'download' = 'dns';

    const segments = [
      { name: 'redirects' as const, duration: this.redirectTime },
      { name: 'dns' as const, duration: this.dnsLookupTime },
      { name: 'tcp' as const, duration: this.tcpConnectTime },
      { name: 'tls' as const, duration: this.tlsHandshakeTime },
      { name: 'server' as const, duration: this.timeToFirstByte },
      { name: 'download' as const, duration: this.responseTime }
    ];

    segments.forEach(segment => {
      if (segment.duration > maxDuration) {
        maxDuration = segment.duration;
        bottleneck = segment.name;
      }
    });

    return bottleneck;
  }

  /**
   * String representation of network timing metrics.
   * 
   * @returns Formatted string with key timing metrics and performance level
   */
  public toString(): string {
    return `NetworkTiming: ${this.totalNetworkTime}ms`;
  }

  /**
   * JSON representation for serialization following the same pattern as ResourceTimingReport.
   * 
   * @returns Object with all timing data organized by segments
   */
  public toJSON() {
    return {
      // Basic report metadata
      id: this.id,
      createdAt: this.createdAt.absoluteTime,
      occurredAt: this.occurredAt.absoluteTime,
      
      // Size and compression analysis
      transferSize: this.transferSize,
      encodedSize: this.encodedSize,
      decodedSize: this.decodedSize,
      compressionRatio: this.compressionRatio,
      hasCompression: this.hasCompression,
      downloadSpeed: this.downloadSpeed,
      
      // Overall metrics
      totalNetworkTime: this.totalNetworkTime,
      pureNetworkTime: this.pureNetworkTime,
      connectionSetupTime: this.connectionSetupTime,
      requestResponseTime: this.requestResponseTime,
      
      // Analysis
      primaryBottleneck: this.primaryBottleneck,
      hasRedirects: this.hasRedirects,

      // Detailed timing segments (matching ResourceTimingReport pattern)
      redirects: {
        duration: this.redirects.duration,
        start: this.redirects.start?.absoluteTime,
        end: this.redirects.end?.absoluteTime
      },
      dnsLookup: {
        duration: this.dnsLookup.duration,
        start: this.dnsLookup.start?.absoluteTime,
        end: this.dnsLookup.end?.absoluteTime
      },
      tcpConnect: {
        duration: this.tcpConnect.duration,
        start: this.tcpConnect.start?.absoluteTime,
        end: this.tcpConnect.end?.absoluteTime
      },
      serverProcessing: {
        duration: this.serverProcessing.duration,
        start: this.serverProcessing.start?.absoluteTime,
        end: this.serverProcessing.end?.absoluteTime
      },
      contentDownload: {
        duration: this.contentDownload.duration,
        start: this.contentDownload.start?.absoluteTime,
        end: this.contentDownload.end?.absoluteTime
      },
      tlsHandshake: this.tlsHandshake ? {
        duration: this.tlsHandshake.duration,
        start: this.tlsHandshake.start?.absoluteTime,
        end: this.tlsHandshake.end?.absoluteTime
      } : null,
    };
  }
}
