import type { PerformanceReport } from "@/reports/PerformanceReport";

// NetworkTimingReport.ts
interface NetworkTimingData {
  dnsLookup: number;
  tcpConnect: number;
  tlsHandshake: number;
  ttfb: number;
  responseTime: number;
  redirectTime: number;
  totalNetworkTime: number;
}

export class NetworkTimingReport implements PerformanceReport {
  public readonly id: string;
  public readonly timestamp: number;

  /**
   * Time spent resolving domain name to IP address.
   * 
   * @unit milliseconds
   * @remarks
   * - DNS cache hit: 0-1ms
   * - Fast DNS: 5-20ms  
   * - Slow DNS: 100-500ms
   */
  public readonly dnsLookup: number;

  /**
   * Time spent establishing TCP connection to server.
   * 
   * @unit milliseconds
   * @remarks
   * - Local server: 1-10ms
   * - Same continent: 20-100ms
   * - Cross-continental: 100-300ms
   */
  public readonly tcpConnect: number;

  /**
   * Time spent on SSL/TLS handshake for HTTPS connections.
   * 
   * @unit milliseconds
   * @remarks
   * - HTTP connections: 0ms
   * - Modern TLS 1.3: 10-50ms
   * - Legacy TLS 1.2: 50-150ms
   */
  public readonly tlsHandshake: number;

  /**
   * Time until server sends the first byte of response.
   * 
   * @unit milliseconds
   * @remarks
   * Core Web Vitals thresholds:
   * - Good: < 200ms
   * - Needs improvement: 200-600ms  
   * - Poor: > 600ms
   */
  public readonly ttfb: number;

  /**
   * Time spent downloading the complete response body.
   * 
   * @unit milliseconds
   * @remarks
   * Depends on response size and network bandwidth.
   */
  public readonly responseTime: number;

  /**
   * Time spent on redirects if any occurred.
   * 
   * @unit milliseconds
   * @remarks
   * 0ms if no redirects happened.
   * Each redirect adds ~100-300ms typically.
   */
  public readonly redirectTime: number;

  /**
   * Total time spent on all network operations.
   * 
   * @unit milliseconds
   * @remarks
   * Sum of all network-related timing phases.
   */
  public readonly totalNetworkTime: number;

  constructor(data: NetworkTimingData) {
    this.id = crypto.randomUUID();
    this.timestamp = Date.now();
    this.dnsLookup = data.dnsLookup;
    this.tcpConnect = data.tcpConnect;
    this.tlsHandshake = data.tlsHandshake;
    this.ttfb = data.ttfb;
    this.responseTime = data.responseTime;
    this.redirectTime = data.redirectTime;
    this.totalNetworkTime = data.totalNetworkTime;
  }

  /**
   * Time spent establishing connection to server.
   * 
   * @unit milliseconds
   * @returns DNS + TCP + TLS combined
   */
  get connectionTime(): number {
    return this.dnsLookup + this.tcpConnect + this.tlsHandshake;
  }

  get networkTime(): number {
    return this.connectionTime + this.ttfb + this.responseTime;
  }

  /**
   * Time spent on server-side processing.
   * 
   * @unit milliseconds
   * @returns Alias for TTFB with semantic clarity
   */
  get serverResponseTime(): number {
    return this.ttfb;
  }

  toString(): string {
    return `Network: ${this.totalNetworkTime}ms (TTFB: ${this.ttfb}ms, Connection: ${this.connectionTime}ms)`;
  }

  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      dnsLookup: this.dnsLookup,
      tcpConnect: this.tcpConnect,
      tlsHandshake: this.tlsHandshake,
      ttfb: this.ttfb,
      responseTime: this.responseTime,
      redirectTime: this.redirectTime,
      totalNetworkTime: this.totalNetworkTime,
    };
  }
}