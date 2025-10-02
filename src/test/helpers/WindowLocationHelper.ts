/**
 * Helper utilities for mocking window.location in tests
 */

import { WebApiMock } from './WebApiMock';

interface MockLocationConfig {
  hostname?: string;
  href?: string;
  origin?: string;
  protocol?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
}

class WindowLocationHelper extends WebApiMock {
  private originalLocation: Location | undefined;

  /**
   * Mock window.location with custom configuration
   */
  mock(config: MockLocationConfig = {}) {
    // Store original location if first mock
    if (!this.isMocked && typeof window !== 'undefined' && window.location) {
      this.originalLocation = window.location;
    }

    const defaultConfig: Required<MockLocationConfig> = {
      hostname: 'example.com',
      href: 'https://example.com/',
      origin: 'https://example.com',
      protocol: 'https:',
      port: '',
      pathname: '/',
      search: '',
      hash: ''
    };

    const mockLocation = { ...defaultConfig, ...config };

    Object.defineProperty(window, 'location', {
      value: mockLocation,
      writable: true,
      configurable: true
    });

    this.hasBeenMocked = true;
    return mockLocation;
  }

  /**
   * Restore original window.location
   */
  unmock() {
    if (this.hasBeenMocked && this.originalLocation) {
      Object.defineProperty(window, 'location', {
        value: this.originalLocation,
        writable: true,
        configurable: true
      });
      
      this.hasBeenMocked = false;
    }
  }

  /**
   * Mock as same-origin domain (example.com)
   */
  mockSameOrigin() {
    return this.mock({
      hostname: 'example.com',
      origin: 'https://example.com'
    });
  }

  /**
   * Mock as third-party domain
   */
  mockThirdParty(hostname = 'thirdparty.com') {
    return this.mock({
      hostname,
      origin: `https://${hostname}`,
      href: `https://${hostname}/`
    });
  }

  /**
   * Mock as localhost for development testing
   */
  mockLocalhost(port = '3000') {
    return this.mock({
      hostname: 'localhost',
      origin: `http://localhost:${port}`,
      protocol: 'http:',
      port,
      href: `http://localhost:${port}/`
    });
  }
}

export const windowLocationHelper = new WindowLocationHelper();
