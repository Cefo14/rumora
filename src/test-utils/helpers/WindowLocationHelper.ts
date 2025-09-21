/**
 * Helper utilities for mocking window.location in tests
 */

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

class WindowLocationHelper {
  private originalLocation: Location | undefined;

  /**
   * Mock window.location with custom configuration
   */
  mockLocation(config: MockLocationConfig = {}) {
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

    return mockLocation;
  }

  /**
   * Restore original window.location
   */
  restoreLocation() {
    Object.defineProperty(window, 'location', {
      value: this.originalLocation,
      writable: true,
      configurable: true
    });
  }

  /**
   * Mock as same-origin domain (example.com)
   */
  mockSameOrigin() {
    return this.mockLocation({
      hostname: 'example.com',
      origin: 'https://example.com'
    });
  }

  /**
   * Mock as third-party domain
   */
  mockThirdParty(hostname = 'thirdparty.com') {
    return this.mockLocation({
      hostname,
      origin: `https://${hostname}`
    });
  }

  /**
   * Mock as localhost for development testing
   */
  mockLocalhost(port = '3000') {
    return this.mockLocation({
      hostname: 'localhost',
      origin: `http://localhost:${port}`,
      protocol: 'http:',
      port
    });
  }
}

export const windowLocationHelper = new WindowLocationHelper();
