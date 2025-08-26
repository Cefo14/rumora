import { NetworkTimingReport } from "@/reports/NetworkTimingReport";
import { UnsupportedMetricException } from "@/errors/UnsupportedMetricException";
import { generateId } from "@/shared/generateId";
import { isPerformanceObservationSupported, PerformanceMetricObserver } from "./PerformanceMetricObserver";

export class NetworkTiming extends PerformanceMetricObserver<NetworkTimingReport> {
  protected readonly performanceObserverType = "navigation";

  protected initialize(): void {
    if (isPerformanceObservationSupported(this.performanceObserverType)) {
      this.handlePerformanceObserver();
    } else {
      const error = new UnsupportedMetricException("Network Timing");
      this.addError(error);
    }
  }

  protected handlePerformanceObserver(): void {
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      
      for (const entry of entries) {
        const navEntry = entry as PerformanceNavigationTiming;
        
        if (navEntry.responseEnd > 0) {
          this.notifyReport(navEntry);
          observer.disconnect();
          break;
        }
      }
    });
    
    this.setObserver(observer);
    observer.observe({ type: this.performanceObserverType, buffered: true });
  }

  private notifyReport(entry: PerformanceNavigationTiming): void {
    const dnsLookup = this.calculateDNSLookup(entry);
    const tcpConnect = this.calculateTCPConnect(entry);
    const tlsHandshake = this.calculateTLSHandshake(entry);
    const ttfb = this.calculateTTFB(entry);
    const responseTime = this.calculateResponseTime(entry);
    const redirectTime = this.calculateRedirectTime(entry);

    const report = new NetworkTimingReport({
      id: generateId(),
      dnsLookup,
      tcpConnect,
      tlsHandshake,
      ttfb,
      responseTime,
      redirectTime,
      totalNetworkTime: redirectTime + dnsLookup + tcpConnect + tlsHandshake + ttfb + responseTime
    });
    
    this.addReport(report);
  }


  /**
   * Calculate DNS lookup time.
   * 
   * @param entry - Navigation timing entry
   * @returns DNS lookup duration in milliseconds
   * @remarks Returns 0 if DNS lookup was cached or not performed
   */
  private calculateDNSLookup(entry: PerformanceNavigationTiming): number {
    if (entry.domainLookupStart === 0 || entry.domainLookupEnd === 0) {
      return 0; // No DNS lookup (cached or same origin)
    }
    return Math.max(0, entry.domainLookupEnd - entry.domainLookupStart);
  }

  /**
   * Calculate TCP connection time.
   * 
   * @param entry - Navigation timing entry
   * @returns TCP connection duration in milliseconds
   * @remarks Returns 0 if connection was reused
   */
  private calculateTCPConnect(entry: PerformanceNavigationTiming): number {
    if (entry.connectStart === 0 || entry.connectEnd === 0) {
      return 0; // Connection was reused
    }
    return Math.max(0, entry.connectEnd - entry.connectStart);
  }

  /**
   * Calculate TLS handshake time.
   * 
   * @param entry - Navigation timing entry  
   * @returns TLS handshake duration in milliseconds
   * @remarks Returns 0 for HTTP connections or reused connections
   */
  private calculateTLSHandshake(entry: PerformanceNavigationTiming): number {
    if (entry.secureConnectionStart === 0 || entry.connectEnd === 0) {
      return 0; // HTTP connection or no TLS handshake needed
    }
    return Math.max(0, entry.connectEnd - entry.secureConnectionStart);
  }

  /**
   * Calculate Time To First Byte (TTFB).
   * 
   * @param entry - Navigation timing entry
   * @returns TTFB duration in milliseconds
   * @remarks Measures server processing time from request to first response byte
   */
  private calculateTTFB(entry: PerformanceNavigationTiming): number {
    if (entry.requestStart === 0 || entry.responseStart === 0) {
      return 0;
    }
    return Math.max(0, entry.responseStart - entry.requestStart);
  }

  /**
   * Calculate response download time.
   * 
   * @param entry - Navigation timing entry
   * @returns Response download duration in milliseconds
   * @remarks Time spent downloading the complete response body
   */
  private calculateResponseTime(entry: PerformanceNavigationTiming): number {
    if (entry.responseStart === 0 || entry.responseEnd === 0) {
      return 0;
    }
    return Math.max(0, entry.responseEnd - entry.responseStart);
  }


  /**
   * Calculate redirect time if any redirects occurred.
   * 
   * @param entry - Navigation timing entry
   * @returns Redirect duration in milliseconds
   * @remarks Returns 0 if no redirects occurred
   */
  private calculateRedirectTime(entry: PerformanceNavigationTiming): number {
    if (entry.redirectStart === 0 || entry.redirectEnd === 0) {
      return 0; // No redirects
    }
    return Math.max(0, entry.redirectEnd - entry.redirectStart);
  }
}
