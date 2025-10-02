import { vi } from 'vitest';
import { WebApiMock } from './WebApiMock';

interface MockCSPViolationConfig {
  documentURI?: string;
  referrer?: string;
  blockedURI?: string;
  violatedDirective?: string;
  effectiveDirective?: string;
  originalPolicy?: string;
  sourceFile?: string;
  sample?: string;
  disposition?: SecurityPolicyViolationEventDisposition;
  statusCode?: number;
  lineNumber?: number;
  columnNumber?: number;
}

class SecurityPolicyViolationEventHelper extends WebApiMock {
  private originalConstructor: typeof SecurityPolicyViolationEvent | undefined;

  /**
   * Mock SecurityPolicyViolationEvent with predictable values
   */
  mock() {
    // Store original constructor if first mock
    if (!this.hasBeenMocked && typeof globalThis.SecurityPolicyViolationEvent !== 'undefined') {
      this.originalConstructor = globalThis.SecurityPolicyViolationEvent;
    }

    // Create mock constructor
    const MockSecurityPolicyViolationEvent = vi.fn().mockImplementation((type: string, eventInitDict?: SecurityPolicyViolationEventInit) => {
      const defaults: Required<SecurityPolicyViolationEventInit> = {
        documentURI: 'https://example.com/',
        referrer: '',
        blockedURI: 'https://malicious.com/script.js',
        violatedDirective: 'script-src',
        effectiveDirective: 'script-src',
        originalPolicy: "default-src 'self'; script-src 'self'",
        sourceFile: 'https://example.com/app.js',
        sample: '',
        disposition: 'enforce',
        statusCode: 200,
        lineNumber: 42,
        columnNumber: 15,
        bubbles: false,
        cancelable: false,
        composed: false
      };

      const config = { ...defaults, ...eventInitDict };

      return {
        type,
        ...config,
        target: null,
        currentTarget: null,
        eventPhase: Event.AT_TARGET,
        isTrusted: false,
        defaultPrevented: false,
        timeStamp: Date.now(),
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        stopImmediatePropagation: vi.fn()
      };
    });

    // Replace global constructor
    Object.defineProperty(globalThis, 'SecurityPolicyViolationEvent', {
      value: MockSecurityPolicyViolationEvent,
      writable: true,
      configurable: true
    });

    this.hasBeenMocked = true;
  }

  /**
   * Restore original SecurityPolicyViolationEvent constructor
   */
  unmock() {
    if (this.hasBeenMocked) {
      vi.restoreAllMocks();

      if (this.originalConstructor !== undefined) {
        Object.defineProperty(globalThis, 'SecurityPolicyViolationEvent', {
          value: this.originalConstructor,
          writable: true,
          configurable: true
        });
      }

      this.hasBeenMocked = false;
    }
  }

  /**
   * Create a mock CSP violation event with custom config
   */
  createMockEvent(type = 'securitypolicyviolation', config?: MockCSPViolationConfig): SecurityPolicyViolationEvent {
    if (!this.hasBeenMocked) {
      this.mock();
    }

    return new SecurityPolicyViolationEvent(type, config);
  }

  /**
   * Create common CSP violation scenarios
   */
  createScriptSrcViolation(): SecurityPolicyViolationEvent {
    return this.createMockEvent('securitypolicyviolation', {
      violatedDirective: 'script-src',
      blockedURI: 'https://malicious.com/script.js',
      effectiveDirective: 'script-src'
    });
  }

  createInlineScriptViolation(): SecurityPolicyViolationEvent {
    return this.createMockEvent('securitypolicyviolation', {
      violatedDirective: 'script-src',
      blockedURI: 'inline',
      effectiveDirective: 'script-src',
      sample: 'console.log("malicious")'
    });
  }

  createStyleSrcViolation(): SecurityPolicyViolationEvent {
    return this.createMockEvent('securitypolicyviolation', {
      violatedDirective: 'style-src',
      blockedURI: 'https://evil.com/styles.css',
      effectiveDirective: 'style-src'
    });
  }

  createEvalViolation(): SecurityPolicyViolationEvent {
    return this.createMockEvent('securitypolicyviolation', {
      violatedDirective: 'script-src',
      blockedURI: 'eval',
      effectiveDirective: 'script-src',
      sample: 'eval("malicious code")'
    });
  }
}

// Singleton instance
export const securityPolicyViolationEventHelper = new SecurityPolicyViolationEventHelper();