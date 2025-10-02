import { observeNetworkTiming } from '@/metrics/performance';
import { ActivityLogger } from './ActivityLogger';
import { updateElement } from './helpers';

const logger = ActivityLogger.getInstance();

export function initNetworkTiming(): void {
  observeNetworkTiming()
    .onSuccess((report) => {
      updateElement('network-dns', `${report.dnsLookup.duration.toFixed(0)}ms`);
      updateElement('network-tcp', `${report.tcpConnect.duration.toFixed(0)}ms`);
      updateElement('network-ttfb', `${report.serverProcessing.duration.toFixed(0)}ms`);
      updateElement('network-total', `${report.totalNetworkTime.toFixed(0)}ms`);
      
      logger.success('Network timing metrics captured');
    })
    .onError((error) => {
      logger.error(`Network timing error: ${error.message}`);
    });
}
