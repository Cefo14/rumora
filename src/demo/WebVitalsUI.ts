import { 
  observeLCP, 
  observeFCP, 
  observeCLS, 
  observeFID, 
  observeINP 
} from '@/metrics/web-vitals';

import type { WebVitalRating } from '@/reports/web-vitals/WebVitalReport';
import { ActivityLogger } from './ActivityLogger';

const logger = ActivityLogger.getInstance();

const ratingClassNames: Record<WebVitalRating, string> = {
  GOOD: 'text-green-600 font-semibold',
  NEEDS_IMPROVEMENT: 'text-yellow-600 font-semibold',
  POOR: 'text-red-600 font-semibold',
};

observeLCP().onSuccess((collection) => {
  const report = collection.lastReport;
  if (!report) return;

  console.log('LCP Collection:', collection);

  const ratingElement = document.getElementById('lcp-rating');
  const valueElement = document.getElementById('lcp-value');

  if (ratingElement) {
    ratingElement.textContent = report.rating;
    ratingElement.className = ratingClassNames[report.rating];
  }

  if (valueElement) {
    valueElement.textContent = `${report.value} ms`;
  }

  logger.success(`[LCP] Largest Contentful Paint: ${report.value} ms`);
});

observeFCP().onSuccess((report) => {
  const ratingElement = document.getElementById('fcp-rating');
  const valueElement = document.getElementById('fcp-value');

  if (ratingElement) {
    ratingElement.textContent = report.rating;
    ratingElement.className = ratingClassNames[report.rating];
  }

  if (valueElement) {
    valueElement.textContent = `${report.value} ms`;
  }

  logger.success(`[FCP] First Contentful Paint: ${report.value} ms`);
});

observeCLS().onSuccess((report) => {
  const ratingElement = document.getElementById('cls-rating');
  const valueElement = document.getElementById('cls-value');

  if (ratingElement) {
    ratingElement.textContent = report.rating;
    ratingElement.className = ratingClassNames[report.rating];
  }

  if (valueElement) {
    valueElement.textContent = report.value.toFixed(4);
  }

  logger.success(`[CLS] Cumulative Layout Shift: ${report.value.toFixed(4)}`);
});

observeFID().onSuccess((report) => {
  const ratingElement = document.getElementById('fid-rating');
  const valueElement = document.getElementById('fid-value');

  if (ratingElement) {
    ratingElement.textContent = report.rating;
    ratingElement.className = ratingClassNames[report.rating];
  }

  if (valueElement) {
    valueElement.textContent = `${report.value.toFixed(4)} ms`;
  }

  logger.success(`[FID] First Input Delay: ${report.value.toFixed(4)} ms`);
});

observeINP().onSuccess((collection) => {
  const report = collection.worstReport;
  if (!report) return;

  console.log('INP Collection:', collection);

  const ratingElement = document.getElementById('inp-rating');
  const valueElement = document.getElementById('inp-value');

  if (ratingElement) {
    ratingElement.textContent = report.rating;
    ratingElement.className = ratingClassNames[report.rating];
  }

  if (valueElement) {
    valueElement.textContent = `${report.value.toFixed(4)} ms`;
  }

  logger.success(`[INP] Interaction to Next Paint: ${report.value.toFixed(4)} ms`);
});

const simulateCLSButton = document.getElementById('layout-shift-btn');
simulateCLSButton?.addEventListener('click', () => {
  // TODO
});