import { observeCSPViolation, observeResourceError, observeUnhandledJavaScriptError, observeUnhandledPromiseRejection } from '@/metrics/errors';
import { ActivityLogger } from './ActivityLogger';

const logger = ActivityLogger.getInstance();

let unhandledJavaScriptErrorCount = 0;
observeUnhandledJavaScriptError().onSuccess((entry) => {
  const jsErrorCountElement = document.getElementById('js-error-count');
  if (jsErrorCountElement) {
    jsErrorCountElement.textContent = (++unhandledJavaScriptErrorCount).toString();
  }
  logger.error(`Unhandled JavaScript error: ${entry.errorMessage}`);
});

let unhandledPromiseRejectionCount = 0;
observeUnhandledPromiseRejection().onSuccess((entry) => {
  const promiseRejectionCountElement = document.getElementById('promise-error-count');
  if (promiseRejectionCountElement) {
    promiseRejectionCountElement.textContent = (++unhandledPromiseRejectionCount).toString();
  }
  logger.error(`Unhandled Promise rejection: ${entry.errorMessage}`);
});

let resourceErrorCount = 0;
observeResourceError().onSuccess((entry) => {
  const resourceErrorCountElement = document.getElementById('resource-error-count');
  if (resourceErrorCountElement) {
    resourceErrorCountElement.textContent = (++resourceErrorCount).toString();
  }
  logger.error(`Resource error: ${entry.resourceUrl} (${entry.resourceType})`);
});

let cspViolationCount = 0;
observeCSPViolation().onSuccess((entry) => {
  const cspViolationCountElement = document.getElementById('csp-violation-count');
  if (cspViolationCountElement) {
    cspViolationCountElement.textContent = (++cspViolationCount).toString();
  }
  logger.error(`CSP Violation: ${entry.blockedURI} - ${entry.directive}`);
});

const jsErrorBtn = document.getElementById('js-error-btn');
jsErrorBtn?.addEventListener('click', () => {
  throw new Error('This is a test unhandled JavaScript error');
});

const promiseErrorBtn = document.getElementById('promise-error-btn');
promiseErrorBtn?.addEventListener('click', () => {
  Promise.reject(new Error('This is a test unhandled Promise rejection'));
});

const resourceErrorBtn = document.getElementById('resource-error-btn');
resourceErrorBtn?.addEventListener('click', () => {
  const img = document.createElement('img');
  img.src = 'http://localhost:12345/non-existent-image.png'; // Invalid URL to trigger error
  img.alt = 'This image will fail to load';
  document.body.appendChild(img);
  img.onerror = () => {
    img.remove();
  };
});

const cspViolationBtn = document.getElementById('csp-violation-btn');
cspViolationBtn?.addEventListener('click', () => {
  const script = document.createElement('script');
  script.textContent = 'console.log("This inline script should violate CSP if configured correctly.")';
  document.body.appendChild(script);
});