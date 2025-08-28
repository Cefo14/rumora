import type { PerformanceReport } from "@/shared/PerformanceReport";

// NetworkTimingReport.ts
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

export class NetworkTimingReport implements PerformanceReport {
  public readonly id: string;
  public readonly createdAt: number;

  /**
   * Time spent resolving domain name to IP address.
   * 
   * @unit milliseconds
   * @remarks
   * - DNS cache hit: 0-1ms
   * - Fast DNS: 5-20ms  
   * - Slow DNS: 100-500ms
   */
  public readonly dnsLookupTime: number;

  /**
   * Time spent establishing TCP connection to server.
   * 
   * @unit milliseconds
   * @remarks
   * - Local server: 1-10ms
   * - Same continent: 20-100ms
   * - Cross-continental: 100-300ms
   */
  public readonly tcpConnectTime: number;

  /**
   * Time spent on SSL/TLS handshake for HTTPS connections.
   * 
   * @unit milliseconds
   * @remarks
   * - HTTP connections: 0ms
   * - Modern TLS 1.3: 10-50ms
   * - Legacy TLS 1.2: 50-150ms
   */
  public readonly tlsHandshakeTime: number;

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
  public readonly timeToFirstByte: number;

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

  constructor(data: NetworkTimingData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.dnsLookupTime = data.dnsLookupTime;
    this.tcpConnectTime = data.tcpConnectTime;
    this.tlsHandshakeTime = data.tlsHandshakeTime;
    this.timeToFirstByte = data.timeToFirstByte;
    this.responseTime = data.responseTime;
    this.redirectTime = data.redirectTime;
    this.createdAt = data.createdAt;
  }

  /**
   * Time spent establishing connection to server.
   * 
   * @unit milliseconds
   * @returns DNS + TCP + TLS combined
   */
  get connectionTime(): number {
    return this.dnsLookupTime + this.tcpConnectTime + this.tlsHandshakeTime;
  }

  get networkTime(): number {
    return this.connectionTime + this.timeToFirstByte + this.responseTime;
  }

  /**
   * Total time spent on all network operations.
   * 
   * @unit milliseconds
   * @remarks
   * Sum of all network-related timing phases.
   */
  public get totalNetworkTime(): number {
    return this.redirectTime + this.dnsLookupTime + this.tcpConnectTime + this.tlsHandshakeTime + this.timeToFirstByte + this.responseTime;
  }

  /**
   * Time spent on server-side processing.
   * 
   * @unit milliseconds
   * @returns Alias for TTFB with semantic clarity
   */
  get serverResponseTime(): number {
    return this.timeToFirstByte;
  }

  toString(): string {
    return `Network: ${this.totalNetworkTime}ms (TTFB: ${this.timeToFirstByte}ms, Connection: ${this.connectionTime}ms)`;
  }

  toJSON() {
    return {
      id: this.id,
      dnsLookupTime: this.dnsLookupTime,
      tcpConnectTime: this.tcpConnectTime,
      tlsHandshakeTime: this.tlsHandshakeTime,
      timeToFirstByte: this.timeToFirstByte,
      responseTime: this.responseTime,
      redirectTime: this.redirectTime,
      createdAt: this.createdAt
    };
  }
}