import type { Report } from '@/reports/Report';
import { PerformanceTime } from '@/value-objects/PerformanceTime';
import { TimeSegment } from '@/value-objects/TimeSegment';

/**
 * Grouped network timing segments for navigation timing analysis
 */
interface NavigationSegments {
  redirects: TimeSegment;
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
 * from DNS resolution to complete response download. Provides detailed
 * timing segments and essential computed metrics for performance analysis.
 * 
 * Timeline:
 * Redirects → DNS → TCP → TLS → Server Processing → Content Download
 */
export class NetworkTimingReport implements Report {
  public readonly id: string;
  public readonly createdAt: PerformanceTime;
  public readonly occurredAt: PerformanceTime;

  /** Transfer size in bytes (actual bytes over network including headers) */
  public readonly transferSize: number;
  
  /** Encoded body size in bytes (compressed size) */
  public readonly encodedSize: number;
  
  /** Decoded body size in bytes (uncompressed size) */
  public readonly decodedSize: number;

  /** Time spent on redirects if any occurred */
  public readonly redirects: TimeSegment;
  
  /** DNS resolution timing */
  public readonly dnsLookup: TimeSegment;
  
  /** TCP connection establishment */
  public readonly tcpConnect: TimeSegment;
  
  /** TLS/SSL handshake (only for HTTPS) */
  public readonly tlsHandshake?: TimeSegment;
  
  /** Server processing time (TTFB - Time to First Byte) */
  public readonly serverProcessing: TimeSegment;
  
  /** Content download time */
  public readonly contentDownload: TimeSegment;

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
   */
  public static create(data: NetworkTimingData): NetworkTimingReport {
    return new NetworkTimingReport(data);
  }

  /**
   * Creates a NetworkTimingReport from PerformanceNavigationTiming data.
   */
  public static fromPerformanceEntry(
    id: string, 
    entry: PerformanceNavigationTiming
  ): NetworkTimingReport {
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
   */
  private static calculateNavigationSegments(
    entry: PerformanceNavigationTiming,
  ): NavigationSegments {
    return {
      redirects: TimeSegment.fromTiming(entry.redirectStart, entry.redirectEnd),
      dnsLookup: TimeSegment.fromTiming(entry.domainLookupStart, entry.domainLookupEnd),
      tcpConnect: TimeSegment.fromTiming(entry.connectStart, entry.connectEnd),
      tlsHandshake: entry.secureConnectionStart > 0 && entry.secureConnectionStart <= entry.connectEnd
        ? TimeSegment.fromTiming(entry.secureConnectionStart, entry.connectEnd)
        : undefined,
      serverProcessing: TimeSegment.fromTiming(entry.requestStart, entry.responseStart),
      contentDownload: TimeSegment.fromTiming(entry.responseStart, entry.responseEnd),
    };
  }

  // ===== COMPUTED METRICS =====

  /**
   * Total time establishing connection before sending request.
   * Combines DNS lookup, TCP connection, and TLS handshake.
   * 
   * Good target: < 100ms
   */
  public get connectionSetupTime(): number {
    return this.dnsLookup.duration + 
           this.tcpConnect.duration + 
           (this.tlsHandshake?.duration || 0);
  }

  /**
   * Total time for all network operations.
   * Includes redirects, connection setup, server processing, and download.
   * 
   * Good target: < 500ms
   */
  public get totalNetworkTime(): number {
    return this.redirects.duration +
           this.connectionSetupTime + 
           this.serverProcessing.duration + 
           this.contentDownload.duration;
  }

  /**
   * Checks if the document has compression applied.
   */
  public get hasCompression(): boolean {
    return this.encodedSize < this.decodedSize && this.decodedSize > 0;
  }

  /**
   * Calculates compression ratio (0-1, higher is better).
   */
  public get compressionRatio(): number {
    if (this.decodedSize === 0) return 0;
    return Math.max(0, (this.decodedSize - this.encodedSize) / this.decodedSize);
  }

  /**
   * Identifies the primary bottleneck phase.
   */
  public get primaryBottleneck(): 'redirects' | 'dns' | 'tcp' | 'tls' | 'server' | 'download' {
    const segments = [
      { name: 'redirects' as const, duration: this.redirects.duration },
      { name: 'dns' as const, duration: this.dnsLookup.duration },
      { name: 'tcp' as const, duration: this.tcpConnect.duration },
      { name: 'tls' as const, duration: this.tlsHandshake?.duration || 0 },
      { name: 'server' as const, duration: this.serverProcessing.duration },
      { name: 'download' as const, duration: this.contentDownload.duration }
    ];

    return segments.reduce((bottleneck, segment) =>
      segment.duration > bottleneck.duration ? segment : bottleneck
    ).name;
  }

  /**
   * String representation of network timing metrics.
   */
  public toString(): string {
    const bottleneck = this.primaryBottleneck !== 'dns' ? ` (bottleneck: ${this.primaryBottleneck})` : '';
    return `NetworkTiming: ${this.totalNetworkTime}ms${bottleneck}`;
  }

  /**
   * JSON representation for serialization.
   */
  public toJSON() {
    return {
      // Metadata
      id: this.id,
      createdAt: this.createdAt.absoluteTime,
      occurredAt: this.occurredAt.absoluteTime,
      
      // Size and compression
      transferSize: this.transferSize,
      encodedSize: this.encodedSize,
      decodedSize: this.decodedSize,
      compressionRatio: this.compressionRatio,
      hasCompression: this.hasCompression,
      
      // Overall metrics
      totalNetworkTime: this.totalNetworkTime,
      connectionSetupTime: this.connectionSetupTime,
      primaryBottleneck: this.primaryBottleneck,

      // Detailed timing segments
      redirects: this.redirects.toJSON(),
      dnsLookup: this.dnsLookup.toJSON(),
      tcpConnect: this.tcpConnect.toJSON(),
      serverProcessing: this.serverProcessing.toJSON(),
      contentDownload: this.contentDownload.toJSON(),
      tlsHandshake: this.tlsHandshake?.toJSON() ?? null,
    };
  }
}