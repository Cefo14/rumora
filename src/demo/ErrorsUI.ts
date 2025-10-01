import { 
  observeUnhandledJavaScriptError,
  observeUnhandledPromiseRejection,
  observeResourceError,
  observeCSPViolation
} from '@/metrics/errors';
import { ActivityLogger } from './ActivityLogger';

const logger = ActivityLogger.getInstance();

const errorCounts = {
  js: 0,
  promise: 0,
  resource: 0,
  csp: 0
};

/**
 * Initialize all error observers
 */
export function initErrorTracking(): void {
  // JavaScript errors
  observeUnhandledJavaScriptError().onSuccess((report) => {
    errorCounts.js++;
    const el = document.getElementById('js-error-count');
    if (el) el.textContent = String(errorCounts.js);
    logger.error(`JavaScript error: ${report.errorMessage}`);
  });

  // Promise rejections
  observeUnhandledPromiseRejection().onSuccess((report) => {
    errorCounts.promise++;
    const el = document.getElementById('promise-error-count');
    if (el) el.textContent = String(errorCounts.promise);
    logger.error(`Promise rejection: ${report.errorMessage}`);
  });

  // Resource errors
  observeResourceError().onSuccess((report) => {
    errorCounts.resource++;
    const el = document.getElementById('resource-error-count');
    if (el) el.textContent = String(errorCounts.resource);
    logger.error(`Resource error: ${report.resourceUrl}`);
  });

  // CSP violations
  observeCSPViolation().onSuccess((report) => {
    errorCounts.csp++;
    const el = document.getElementById('csp-violation-count');
    if (el) el.textContent = String(errorCounts.csp);
    logger.error(`CSP violation: ${report.blockedURI}`);
  });

  // Setup error generation buttons
  setupErrorButtons();
}

/**
 * Setup buttons to manually trigger errors for demo
 */
function setupErrorButtons(): void {
  const jsErrorBtn = document.getElementById('js-error-btn');
  jsErrorBtn?.addEventListener('click', () => {
    setTimeout(() => {
      throw new Error('Demo JavaScript error');
    }, 0);
  });

  const promiseErrorBtn = document.getElementById('promise-error-btn');
  promiseErrorBtn?.addEventListener('click', () => {
    Promise.reject(new Error('Demo promise rejection'));
  });

  const resourceErrorBtn = document.getElementById('resource-error-btn');
  resourceErrorBtn?.addEventListener('click', () => {
    const img = document.createElement('img');
    img.src = 'http://invalid-domain-12345.com/image.png';
    document.body.appendChild(img);
    setTimeout(() => img.remove(), 100);
  });

  const cspViolationBtn = document.getElementById('csp-violation-btn');
  cspViolationBtn?.addEventListener('click', () => {
    const img = document.createElement('img');
    img.src = 'http://invalid-domain-123456.com/image.png';
    document.body.appendChild(img);
    setTimeout(() => img.remove(), 100);
  });
}