import { PerformanceReport } from "@/shared/PerformanceReport";
import { PerformanceTimestamp } from "@/shared/PerformanceTimestamp";

/**
 * Data structure for creating a ResourceTimingReport.
 */
interface ResourceTimingData {
  /** Unique identifier for the report */
  id: string;

  /** Timestamp when the report was created */
  createdAt: PerformanceTimestamp;

  /** Timestamp when the resource was loaded */
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
  encodedBodySize: number;
  /** Decoded body size in bytes (uncompressed) */
  decodedBodySize: number;
  
  // Network timing details (optional for detailed analysis)
  domainLookupStart?: PerformanceTimestamp;
  domainLookupEnd?: PerformanceTimestamp;
  connectStart?: PerformanceTimestamp;
  connectEnd?: PerformanceTimestamp;
  secureConnectionStart?: PerformanceTimestamp;
  requestStart?: PerformanceTimestamp;
  responseStart?: PerformanceTimestamp;
}

/**
 * Report for Resource Timing API performance entries.
 * 
 * Resource timing provides detailed network timing information for loading
 * resources such as stylesheets, scripts, images, and fonts. This helps
 * identify network bottlenecks and optimize resource loading performance.
 * 
 * The report focuses on actionable insights for performance optimization
 * rather than exposing all raw timing data.
 * 
 * @example
 * ```typescript
 * // From PerformanceObserver
 * const report = ResourceTimingReport.fromPerformanceEntry(
 *   'rt-001',
 *   PerformanceTimestamp.fromAbsoluteTime(Date.now()),
 *   resourceEntry
 * );
 * 
 * // Check if resource is problematic
 * if (report.isProblematic) {
 *   console.log(`Slow resource: ${report.name}`);
 *   console.log(`Bottleneck: ${report.primaryBottleneck}`);
 *   console.log(`Started at: ${new Date(report.startTime.absolute)}`);
 * }
 * ```
 */
export class ResourceTimingReport implements PerformanceReport {
  /** Unique identifier for the report */
  public readonly id: string;
  
  /** Timestamp when the report was created */
  public readonly createdAt: PerformanceTimestamp;

  /** Timestamp when the resource was loaded */
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
  public readonly encodedBodySize: number;
  
  /** Decoded body size in bytes (uncompressed size) */
  public readonly decodedBodySize: number;
  
  // Optional timing details (for detailed analysis)
  private readonly domainLookupStart?: PerformanceTimestamp;
  private readonly domainLookupEnd?: PerformanceTimestamp;
  private readonly connectStart?: PerformanceTimestamp;
  private readonly connectEnd?: PerformanceTimestamp;
  private readonly secureConnectionStart?: PerformanceTimestamp;
  private readonly requestStart?: PerformanceTimestamp;
  private readonly responseStart?: PerformanceTimestamp;

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
    this.encodedBodySize = data.encodedBodySize;
    this.decodedBodySize = data.decodedBodySize;
    
    // Optional timing details
    this.domainLookupStart = data.domainLookupStart;
    this.domainLookupEnd = data.domainLookupEnd;
    this.connectStart = data.connectStart;
    this.connectEnd = data.connectEnd;
    this.secureConnectionStart = data.secureConnectionStart;
    this.requestStart = data.requestStart;
    this.responseStart = data.responseStart;
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
   * @param createdAt - Timestamp when the report was created
   * @param entry - PerformanceResourceTiming entry from Resource Timing API
   * @returns New ResourceTimingReport instance with converted timing data
   */
  public static fromPerformanceResourceTiming(
    id: string,
    createdAt: PerformanceTimestamp,
    entry: PerformanceResourceTiming
  ): ResourceTimingReport {
    // Helper to create PerformanceTimestamp from relative time, handling 0 values
    const fromRelativeTime = (relativeTime: number): PerformanceTimestamp | undefined => {
      return relativeTime > 0 ? PerformanceTimestamp.fromRelativeTime(relativeTime) : undefined;
    };

    return new ResourceTimingReport({
      id,
      createdAt: createdAt,
      occurredAt: PerformanceTimestamp.fromRelativeTime(entry.startTime),
      name: entry.name,
      type: entry.initiatorType,
      duration: entry.duration,
      startTime: PerformanceTimestamp.fromRelativeTime(entry.fetchStart),
      transferSize: entry.transferSize || 0,
      encodedBodySize: entry.encodedBodySize || 0,
      decodedBodySize: entry.decodedBodySize || 0,
      domainLookupStart: fromRelativeTime(entry.domainLookupStart),
      domainLookupEnd: fromRelativeTime(entry.domainLookupEnd),
      connectStart: fromRelativeTime(entry.connectStart),
      connectEnd: fromRelativeTime(entry.connectEnd),
      secureConnectionStart: fromRelativeTime(entry.secureConnectionStart),
      requestStart: fromRelativeTime(entry.requestStart),
      responseStart: fromRelativeTime(entry.responseStart),
    });
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

  public get hasCompression(): boolean {
    return this.encodedBodySize < this.decodedBodySize;
  }

  /**
   * Calculates compression ratio of the resource.
   * 
   * @returns Compression ratio (0-1), where higher values mean better compression
   */
  public get compressionRatio(): number {
    if (this.decodedBodySize === 0) return 0;
    return Math.max(0, (this.decodedBodySize - this.encodedBodySize) / this.decodedBodySize);
  }

  /**
   * Checks if detailed timing information is available.
   */
  private get hasDetailedTiming(): boolean {
    return !!(this.requestStart && this.responseStart && this.domainLookupStart);
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
    return `ResourceTimingReport: ${this.name} - ${this.duration}ms`;
  }

  /**
   * Converts the report to a JSON object suitable for serialization.
   * 
   * @returns JSON representation with analysis insights
   */
  public toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt.absoluteTime,
      occurredAt: this.occurredAt.absoluteTime,
      name: this.name,
      domain: this.domain,
      type: this.type,
      duration: this.duration,
      startTime: this.startTime.absoluteTime,
      endTime: this.endTime.absoluteTime,

      // Size analysis
      transferSize: this.transferSize,
      encodedBodySize: this.encodedBodySize,
      decodedBodySize: this.decodedBodySize,
      compressionRatio: this.compressionRatio,
      hasCompression: this.hasCompression,

      // Origin analysis
      isThirdParty: this.isThirdParty,
      
      // Optional detailed timing (only if available)
      ...(this.hasDetailedTiming && {
        detailedTiming: {
          domainLookupStart: this.domainLookupStart?.toJSON(),
          domainLookupEnd: this.domainLookupEnd?.toJSON(),
          connectStart: this.connectStart?.toJSON(),
          connectEnd: this.connectEnd?.toJSON(),
          secureConnectionStart: this.secureConnectionStart?.toJSON(),
          requestStart: this.requestStart?.toJSON(),
          responseStart: this.responseStart?.toJSON()
        }
      })
    };
  }
}

export type ResourceTimingReportJSON = ReturnType<ResourceTimingReport['toJSON']>;
