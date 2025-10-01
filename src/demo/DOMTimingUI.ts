import { observeDOMTiming } from '@/metrics/performance';
import { ActivityLogger } from './ActivityLogger';
import { updateElement } from './helpers';

const logger = ActivityLogger.getInstance();

export function initDOMTiming(): void {
  observeDOMTiming()
    .onSuccess((report) => {
      updateElement('dom-interactive', `${report.timeToInteractive.toFixed(0)}ms`);
      updateElement('dom-content-loaded', `${report.timeToContentLoaded.toFixed(0)}ms`);
      updateElement('dom-complete', `${report.timeToDOMComplete.toFixed(0)}ms`);
      updateElement('dom-full-load', `${report.timeToFullLoad.toFixed(0)}ms`);
      
      logger.success('DOM timing metrics captured');
    })
    .onError((error) => {
      logger.error(`DOM timing error: ${error.message}`);
    });
}
