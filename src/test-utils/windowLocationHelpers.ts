import { beforeEach, afterEach } from 'vitest';
import { windowLocationHelper } from './WindowLocationHelper';

/**
 * Auto-cleanup setup for window.location mocking
 * Use in describe blocks that need window.location mocking
 */
export function setupWindowLocationMocking() {
  afterEach(() => {
    windowLocationHelper.restoreLocation();
  });
}

/**
 * Setup with automatic same-origin mocking for each test
 */
export function setupSameOriginLocation() {
  beforeEach(() => {
    windowLocationHelper.mockSameOrigin();
  });
  
  afterEach(() => {
    windowLocationHelper.restoreLocation();
  });
}