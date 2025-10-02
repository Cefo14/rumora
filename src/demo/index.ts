import { ActivityLogger } from './ActivityLogger';
import { initLCP, initFCP, initCLS, initFID, initINP } from './WebVitalsUI';
import { initDOMTiming } from './DOMTimingUI';
import { initNetworkTiming } from './NetworkTimingUI';
import { initResourceTiming } from './ResourcesUI';
import { initErrorTracking } from './ErrorsUI';

const logger = ActivityLogger.getInstance();

/**
 * Initialize Rumora demo
 */
function initDemo(): void {
  logger.info('Initializing Rumora observers...');

  // Web Vitals
  initLCP();
  initFCP();
  initCLS();
  initFID();
  initINP();

  // Performance
  initDOMTiming();
  initNetworkTiming();
  initResourceTiming();

  // Errors
  initErrorTracking();

  logger.success('All observers initialized');
}

// Start demo when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDemo);
} else {
  initDemo();
}