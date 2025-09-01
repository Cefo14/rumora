import type { PerformanceReport } from "@/shared/PerformanceReport";

interface NetworkTimingData {
  id: string;
  createdAt: number;
  dnsLookupTime: number;
  tcpConnectTime: number;
  tlsHandshakeTime: number;
  timeToFirstByte: number;
  responseTime: number;
  redirectTime: number;
}

/**
 * Report for measuring network timing performance during navigation.
 * 
 * Tracks the time spent in different phases of network communication,
 * from DNS resolution to complete response download.
 */
export class NetworkTimingReport implements PerformanceReport {
  /** Unique identifier for the report */
  public readonly id: string;
  
  /** Timestamp when the report was created */
  public readonly createdAt: number;

  /**
   * Time spent resolving domain name to IP address in milliseconds.
   * 
   * - DNS cache hit: 0-1ms
   * - Fast DNS: 5-20ms  
   * - Slow DNS: 100-500ms
   */
  public readonly dnsLookupTime: number;

  /**
   * Time spent establishing TCP connection to server in milliseconds.
   * 
   * - Local server: 1-10ms
   * - Same continent: 20-100ms
   * - Cross-continental: 100-300ms
   */
  public readonly tcpConnectTime: number;

  /**
   * Time spent on SSL/TLS handshake for HTTPS connections in milliseconds.
   * 
   * - HTTP connections: 0ms
   * - Modern TLS 1.3: 10-50ms
   * - Legacy TLS 1.2: 50-150ms
   */
  public readonly tlsHandshakeTime: number;

  /**
   * Time until server sends the first byte of response (server processing time) in milliseconds.
   * 
   * Core Web Vitals thresholds:
   * - Good: < 200ms
   * - Needs improvement: 200-600ms  
   * - Poor: > 600ms
   */
  public readonly timeToFirstByte: number;

  /**
   * Time spent downloading the complete response body in milliseconds.
   * 
   * Depends on response size and network bandwidth.
   * Excludes connection setup and server processing time.
   */
  public readonly responseTime: number;

  /**
   * Time spent on redirects if any occurred in milliseconds.
   * 
   * 0ms if no redirects happened.
   * Each redirect adds ~100-300ms typically.
   */
  public readonly redirectTime: number;

  private constructor(data: NetworkTimingData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.dnsLookupTime = data.dnsLookupTime;
    this.tcpConnectTime = data.tcpConnectTime;
    this.tlsHandshakeTime = data.tlsHandshakeTime;
    this.timeToFirstByte = data.timeToFirstByte;
    this.responseTime = data.responseTime;
    this.redirectTime = data.redirectTime;

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
   * @param createdAt - Timestamp when the report was created
   * @param entry - PerformanceNavigationTiming entry from the browser
   * @returns New NetworkTimingReport instance with calculated timings
   */
  public static fromPerformanceNavigationTiming(
    id: string, 
    createdAt: number, 
    entry: PerformanceNavigationTiming
  ): NetworkTimingReport {
    if (!entry || typeof entry !== 'object') {
      throw new Error('PerformanceNavigationTiming entry is required');
    }

    const data: NetworkTimingData = {
      id,
      createdAt,
      dnsLookupTime: Math.max(0, entry.domainLookupEnd - entry.domainLookupStart),
      tcpConnectTime: Math.max(0, entry.connectEnd - entry.connectStart),
      tlsHandshakeTime: entry.secureConnectionStart > 0 && entry.secureConnectionStart <= entry.connectEnd
        ? Math.max(0, entry.connectEnd - entry.secureConnectionStart)
        : 0,
      timeToFirstByte: Math.max(0, entry.responseStart - entry.requestStart),
      responseTime: Math.max(0, entry.responseEnd - entry.responseStart),
      redirectTime: Math.max(0, entry.redirectEnd - entry.redirectStart)
    };
    
    return new NetworkTimingReport(data);
  }

  /**
   * Time spent establishing connection to server in milliseconds.
   * 
   * Total time to establish a connection before sending request.
   * Good target: < 100ms for optimal performance.
   * 
   * @returns DNS + TCP + TLS combined
   */
  get connectionSetupTime(): number {
    return this.dnsLookupTime + this.tcpConnectTime + this.tlsHandshakeTime;
  }

  /**
   * Total time for request and response (excluding connection setup) in milliseconds.
   * 
   * Time spent on actual data transfer after connection is established.
   * 
   * @returns TTFB + Response download time
   */
  get requestResponseTime(): number {
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
  get totalNetworkTime(): number {
    return this.redirectTime + this.connectionSetupTime + this.requestResponseTime;
  }

  /**
   * Time spent on network communication (excluding redirects) in milliseconds.
   * 
   * Pure network performance without redirect penalties.
   * 
   * @returns Network time without redirect overhead
   */
  get pureNetworkTime(): number {
    return this.connectionSetupTime + this.requestResponseTime;
  }

  /**
   * Check if there were redirects.
   * 
   * Redirects add latency and should be minimized.
   * 
   * @returns true if any redirect time was recorded
   */
  get hasRedirects(): boolean {
    return this.redirectTime > 0;
  }

  /**
   * Identifies the primary bottleneck phase in the network timing.
   * 
   * @returns The phase with the highest time consumption
   */
  get primaryBottleneck(): 'redirects' | 'dns' | 'connection' | 'server' | 'download' {
    const timings = {
      redirects: this.redirectTime,
      dns: this.dnsLookupTime,
      connection: this.tcpConnectTime + this.tlsHandshakeTime,
      server: this.timeToFirstByte,
      download: this.responseTime
    };

    const phases = Object.keys(timings) as Array<keyof typeof timings>;
    
    return phases.reduce((max, phase) => 
      timings[phase] > timings[max] ? phase : max
    );
  }

  /**
   * String representation of network timing metrics.
   * 
   * @returns Formatted string with key timing metrics and performance level
   */
  toString(): string {
    return `Network: ${this.totalNetworkTime}ms (TTFB: ${this.timeToFirstByte}ms, Connection: ${this.connectionSetupTime}ms)`;
  }

  /**
   * JSON representation for serialization.
   * 
   * @returns Object with all timing data and computed metrics
   */
  toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      dnsLookupTime: this.dnsLookupTime,
      tcpConnectTime: this.tcpConnectTime,
      tlsHandshakeTime: this.tlsHandshakeTime,
      timeToFirstByte: this.timeToFirstByte,
      responseTime: this.responseTime,
      redirectTime: this.redirectTime,
      connectionSetupTime: this.connectionSetupTime,
      requestResponseTime: this.requestResponseTime,
      totalNetworkTime: this.totalNetworkTime,
      pureNetworkTime: this.pureNetworkTime,
      primaryBottleneck: this.primaryBottleneck,
      hasRedirects: this.hasRedirects,
    };
  }
}
