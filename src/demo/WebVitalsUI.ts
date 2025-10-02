import { observeLCP, observeFCP, observeCLS, observeFID, observeINP } from '@/metrics/web-vitals';
import { ActivityLogger } from './ActivityLogger';
import { updateElement, updateRating } from './helpers';

const logger = ActivityLogger.getInstance();

/**
 * Initialize LCP observer
 */
export function initLCP(): void {
  observeLCP()
    .onSuccess((collection) => {
      const lcp = collection.lastReport;
      if (!lcp) return;
      
      updateElement('lcp-value', `${lcp.value.toFixed(0)}ms`);
      updateRating('lcp-rating', lcp.value, 2500, 4000);
      logger.success(`LCP: ${lcp.value.toFixed(0)}ms`);
    })
    .onError((error) => {
      logger.error(`LCP error: ${error.message}`);
    });
}

/**
 * Initialize FCP observer
 */
export function initFCP(): void {
  observeFCP()
    .onSuccess((report) => {
      updateElement('fcp-value', `${report.value.toFixed(0)}ms`);
      updateRating('fcp-rating', report.value, 1800, 3000);
      logger.success(`FCP: ${report.value.toFixed(0)}ms`);
    })
    .onError((error) => {
      logger.error(`FCP error: ${error.message}`);
    });
}

/**
 * Initialize CLS observer
 */
export function initCLS(): void {
  observeCLS()
    .onSuccess((collection) => {
      const cls = collection.cumulativeShiftScore;
      updateElement('cls-value', cls.toFixed(3));
      updateRating('cls-rating', cls, 0.1, 0.25);
      logger.success(`CLS: ${cls.toFixed(3)}`);
    })
    .onError((error) => {
      logger.error(`CLS error: ${error.message}`);
    });

  // Layout shift button
  const layoutShiftBtn = document.getElementById('layout-shift-btn');
  layoutShiftBtn?.addEventListener('click', () => {
    const box = document.createElement('div');
    box.style.cssText = 'height: 100px; background: #f0f0f0; margin: 20px 0;';
    layoutShiftBtn.appendChild(box);
    setTimeout(() => box.remove(), 1000);
    logger.warning('Layout shift triggered');
  });
}

/**
 * Initialize FID observer
 */
export function initFID(): void {
  let fidMeasured = false;
  
  observeFID()
    .onSuccess((report) => {
      if (fidMeasured) return;
      fidMeasured = true;
      
      updateElement('fid-value', `${report.value.toFixed(0)}ms`);
      updateRating('fid-rating', report.value, 100, 300);
      logger.success(`FID: ${report.value.toFixed(0)}ms`);
    })
    .onError((error) => {
      logger.error(`FID error: ${error.message}`);
    });
}

/**
 * Initialize INP observer
 */
export function initINP(): void {
  observeINP()
    .onSuccess((collection) => {
      const inp = collection.percentile98;
      if (!inp) return;
      
      updateElement('inp-value', `${inp.value.toFixed(0)}ms`);
      updateRating('inp-rating', inp.value, 200, 500);
      logger.info(`INP updated: ${inp.value.toFixed(0)}ms (p98)`);
    })
    .onError((error) => {
      logger.error(`INP error: ${error.message}`);
    });
}
