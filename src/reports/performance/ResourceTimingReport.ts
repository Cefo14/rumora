import { Report } from "@/shared/Report";
import { PerformanceTimestamp } from "@/shared/PerformanceTimestamp";

/**
 * Network timing segment with start, end, and calculated duration
 */
interface TimingSegment {
  start?: PerformanceTimestamp;
  end?: PerformanceTimestamp;
  duration: number;
}

/**
 * Grouped network timing segments for easier analysis
 */
interface NetworkSegments {
  dnsLookup: TimingSegment;
  tcpConnect: TimingSegment;
  tlsHandshake?: TimingSegment;
  serverProcessing: TimingSegment;
  contentDownload: TimingSegment;
}

/**
 * Data structure for creating a ResourceTimingReport.
 */
interface ResourceTimingData {
  /** Unique identifier for the report */
  id: string;
  /** Timestamp when the report was created */
  createdAt: PerformanceTimestamp;
  /** Timestamp when the resource loading occurred */
  occurredAt: PerformanceTimestamp;
  
  // Core resource information
  /** Resource name/URL */
  name: string;
  /** Type of resource initiator (script, stylesheet, img, etc.) */
  type: string;
  
  // Essential timing
  /** Total load duration in milliseconds */
  duration: number;
  /** Start time of the resource load */
  startTime: PerformanceTimestamp;
  
  // Size information
  /** Transfer size in bytes (over the wire) */
  transferSize: number;
  /** Encoded body size in bytes (compressed) */
  encodedSize: number;
  /** Decoded body size in bytes (uncompressed) */
  decodedSize: number;

  /** DNS resolution timing */
  dnsLookup: TimingSegment;
  /** TCP connection establishment */
  tcpConnect: TimingSegment;
  /** TLS/SSL handshake (only for HTTPS) */
  tlsHandshake?: TimingSegment;
  /** Server processing time (request sent to first byte received) */
  serverProcessing: TimingSegment;
  /** Content download time */
  contentDownload: TimingSegment;
}

/**
 * Report for Resource Timing API performance entries.
 * 
 * Resource timing provides detailed network timing information for loading
 * resources such as stylesheets, scripts, images, and fonts. This report
 * organizes timing data into logical segments for easier bottleneck identification.
 * ```
 */
export class ResourceTimingReport implements Report {
  /** Unique identifier for the report */
  public readonly id: string;
  
  /** Timestamp when the report was created */
  public readonly createdAt: PerformanceTimestamp;

  /** Timestamp when the resource loading occurred */
  public readonly occurredAt: PerformanceTimestamp;
  
  /** Resource name/URL */
  public readonly name: string;
  
  /** Type of resource initiator */
  public readonly type: string;
  
  /** Total load duration in milliseconds */
  public readonly duration: number;
  
  /** Start time of the resource load */
  public readonly startTime: PerformanceTimestamp;
  
  /** Transfer size in bytes (actual bytes over network) */
  public readonly transferSize: number;
  
  /** Encoded body size in bytes (compressed size) */
  public readonly encodedSize: number;

  /** Decoded body size in bytes (uncompressed size) */
  public readonly decodedSize: number;

  /** DNS resolution timing */
  private readonly dnsLookup: TimingSegment;

  /** TCP connection establishment */
  private readonly tcpConnect: TimingSegment;

  /** TLS/SSL handshake (only for HTTPS) */
  private readonly tlsHandshake?: TimingSegment;

  /** Server processing time (request sent to first byte received) */
  private readonly serverProcessing: TimingSegment;

  /** Content download time */
  private readonly contentDownload: TimingSegment;


  /**
   * Creates a new ResourceTimingReport instance.
   * 
   * @param data - Resource timing data
   * @private
   */
  private constructor(data: ResourceTimingData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.occurredAt = data.occurredAt;
    this.name = data.name;
    this.type = data.type;
    this.duration = data.duration;
    this.startTime = data.startTime;
    this.transferSize = data.transferSize;
    this.encodedSize = data.encodedSize;
    this.decodedSize = data.decodedSize;
    this.dnsLookup = data.dnsLookup;
    this.tcpConnect = data.tcpConnect;
    this.tlsHandshake = data.tlsHandshake;
    this.serverProcessing = data.serverProcessing;
    this.contentDownload = data.contentDownload;
  }

  /**
   * Creates a ResourceTimingReport from provided data.
   * 
   * @param data - Resource timing data
   * @returns New ResourceTimingReport instance
   */
  public static create(data: ResourceTimingData): ResourceTimingReport {
    return new ResourceTimingReport(data);
  }

  /**
   * Creates a ResourceTimingReport from a PerformanceResourceTiming entry.
   * 
   * @param id - Unique identifier for the report
   * @param entry - PerformanceResourceTiming entry from Resource Timing API
   * @returns New ResourceTimingReport instance with calculated network segments
   */
  public static fromPerformanceResourceTiming(
    id: string,
    entry: PerformanceResourceTiming
  ): ResourceTimingReport {
    // Helper to create PerformanceTimestamp from relative time, handling 0 values
    const fromRelativeTime = (relativeTime: number): PerformanceTimestamp | undefined => {
      return relativeTime > 0 ? PerformanceTimestamp.fromRelativeTime(relativeTime) : undefined;
    };

    // Calculate network timing segments
    const networkSegments = this.calculateNetworkSegments(entry, fromRelativeTime);

    return new ResourceTimingReport({
      id,
      createdAt: PerformanceTimestamp.now(),
      occurredAt: PerformanceTimestamp.fromRelativeTime(entry.startTime),
      name: entry.name,
      type: entry.initiatorType,
      duration: entry.duration,
      startTime: PerformanceTimestamp.fromRelativeTime(entry.fetchStart),
      transferSize: entry.transferSize || 0,
      encodedSize: entry.encodedBodySize || 0,
      decodedSize: entry.decodedBodySize || 0,
      dnsLookup: networkSegments.dnsLookup,
      tcpConnect: networkSegments.tcpConnect,
      tlsHandshake: networkSegments.tlsHandshake,
      serverProcessing: networkSegments.serverProcessing,
      contentDownload: networkSegments.contentDownload,
    });
  }

  /**
   * Calculates network timing segments from PerformanceResourceTiming entry.
   * 
   * @param entry - Performance resource timing entry
   * @param fromRelativeTime - Helper function to create PerformanceTimestamp
   * @returns Calculated network segments
   * @private
   */
  private static calculateNetworkSegments(
    entry: PerformanceResourceTiming,
    fromRelativeTime: (time: number) => PerformanceTimestamp | undefined
  ): NetworkSegments {
    // DNS Lookup: domain resolution time
    const dnsLookup: TimingSegment = {
      start: fromRelativeTime(entry.domainLookupStart),
      end: fromRelativeTime(entry.domainLookupEnd),
      duration: Math.max(0, entry.domainLookupEnd - entry.domainLookupStart)
    };

    // TCP Connect: connection establishment time
    const tcpConnect: TimingSegment = {
      start: fromRelativeTime(entry.connectStart),
      end: fromRelativeTime(entry.connectEnd),
      duration: Math.max(0, entry.connectEnd - entry.connectStart)
    };

    // TLS Handshake: SSL/TLS negotiation (only for HTTPS)
    let tlsHandshake: TimingSegment | undefined;
      if (entry.secureConnectionStart > 0) {
        tlsHandshake = {
        start: fromRelativeTime(entry.secureConnectionStart),
        end: fromRelativeTime(entry.connectEnd),
        duration: Math.max(0, entry.connectEnd - entry.secureConnectionStart)
      };
    }

    // Server Processing: time from request sent to first response byte
    const serverProcessing: TimingSegment = {
      start: fromRelativeTime(entry.requestStart),
      end: fromRelativeTime(entry.responseStart),
      duration: Math.max(0, entry.responseStart - entry.requestStart)
    };

    // Content Download: time to download the response body
    const contentDownload: TimingSegment = {
      start: fromRelativeTime(entry.responseStart),
      end: fromRelativeTime(entry.responseEnd),
      duration: Math.max(0, entry.responseEnd - entry.responseStart)
    };

    return {
      dnsLookup,
      tcpConnect,
      tlsHandshake,
      serverProcessing,
      contentDownload
    };
  }

  /**
   * Gets the end time of the resource loading.
   * 
   * @returns End time calculated from start time and duration
   */
  public get endTime(): PerformanceTimestamp {
    return this.startTime.add(this.duration);
  }

  /**
   * Determines if this resource is from a third-party domain.
   * 
   * @returns True if resource is loaded from a different origin
   */
  public get isThirdParty(): boolean {
    try {
      const resourceHost = new URL(this.name).hostname;
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
      return resourceHost !== currentHost;
    } catch {
      return false;
    }
  }

  /**
   * Checks if the resource has compression applied.
   * 
   * @returns True if encoded size is smaller than decoded size
   */
  public get hasCompression(): boolean {
    return this.encodedSize < this.decodedSize;
  }

  /**
   * Calculates compression ratio of the resource.
   * 
   * @returns Compression ratio (0-1), where higher values mean better compression
   */
  public get compressionRatio(): number {
    if (this.decodedSize === 0) return 0;
    return Math.max(0, (this.decodedSize - this.encodedSize) / this.decodedSize);
  }

  /**
   * Identifies the primary network bottleneck.
   * 
   * @returns The network segment with the longest duration
   */
  public get primaryBottleneck(): 'dns' | 'tcp' | 'tls' | 'server' | 'download' | 'none' {
    let maxDuration = 0;
    let bottleneck: 'dns' | 'tcp' | 'tls' | 'server' | 'download' | 'none' = 'none';

    if (this.dnsLookup.duration > maxDuration) {
      maxDuration = this.dnsLookup.duration;
      bottleneck = 'dns';
    }

    if (this.tcpConnect.duration > maxDuration) {
      maxDuration = this.tcpConnect.duration;
      bottleneck = 'tcp';
    }

    if (this.tlsHandshake && this.tlsHandshake.duration > maxDuration) {
      maxDuration = this.tlsHandshake.duration;
      bottleneck = 'tls';
    }

    if (this.serverProcessing.duration > maxDuration) {
      maxDuration = this.serverProcessing.duration;
      bottleneck = 'server';
    }

    if (this.contentDownload.duration > maxDuration) {
      maxDuration = this.contentDownload.duration;
      bottleneck = 'download';
    }

    return bottleneck;
  }

  /**
   * Checks if the resource has detailed timing information available.
   * 
   * @returns True if network segments have timing data
   */
  public get hasDetailedTiming(): boolean {
    return this.serverProcessing.duration > 0 ||
           this.dnsLookup.duration > 0;
  }

  /**
   * Gets the resource domain for analysis.
   * 
   * @returns Domain of the resource URL
   */
  public get domain(): string {
    try {
      return new URL(this.name).hostname;
    } catch {
      return '';
    }
  }

  /**
   * Creates a human-readable string representation of the resource timing report.
   * 
   * @returns String representation with key performance insights
   */
  public toString(): string {
    const bottleneck = this.primaryBottleneck !== 'none' ? ` (bottleneck: ${this.primaryBottleneck})` : '';
    return `ResourceTimingReport: ${this.name} - ${this.duration}ms${bottleneck}`;
  }

  /**
   * Converts the report to a JSON object suitable for serialization.
   * 
   * @returns JSON representation with network segment analysis
   */
  public toJSON() {
    return {
      // Basic report metadata
      id: this.id,
      createdAt: this.createdAt.absoluteTime,
      occurredAt: this.occurredAt.absoluteTime,
      
      // Resource identification
      name: this.name,
      domain: this.domain,
      type: this.type,
      
      // Overall timing
      duration: this.duration,
      startTime: this.startTime.absoluteTime,
      endTime: this.endTime.absoluteTime,

      // Resource size and compression analysis
      transferSize: this.transferSize,
      encodedSize: this.encodedSize,
      decodedSize: this.decodedSize,
      compressionRatio: this.compressionRatio,
      hasCompression: this.hasCompression,

      isThirdParty: this.isThirdParty,
      primaryBottleneck: this.primaryBottleneck,

      // Detailed network timing segments
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
