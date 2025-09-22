/* eslint-disable @typescript-eslint/no-extraneous-class */

export class SecurityPolicyViolationEventMother {
  /**
   * Default SecurityPolicyViolationEvent
   */
  static aDefault(): SecurityPolicyViolationEvent {
    const event = new SecurityPolicyViolationEvent('securitypolicyviolation', {
      effectiveDirective: 'script-src',
      blockedURI: 'https://malicious.com/evil.js',
      sourceFile: 'https://example.com/app.js',
      lineNumber: 42,
      columnNumber: 10,
      violatedDirective: 'script-src'
    });
    
    Object.defineProperty(event, 'timeStamp', {
      value: 1000,
      writable: false,
      configurable: true
    });
    
    return event;
  }

  /**
   * Custom SecurityPolicyViolationEvent with overrides
   */
  static withCustomValues(
    overrides: Partial<SecurityPolicyViolationEventInit> = {},
    timeStamp = 1000
  ): SecurityPolicyViolationEvent {
    const defaultInit: SecurityPolicyViolationEventInit = {
      effectiveDirective: 'script-src',
      blockedURI: 'https://example.com/blocked.js',
      sourceFile: 'https://example.com/app.js',
      lineNumber: 42,
      columnNumber: 10,
      violatedDirective: 'script-src'
    };
    
    const event = new SecurityPolicyViolationEvent('securitypolicyviolation', { 
      ...defaultInit, 
      ...overrides 
    });
    
    Object.defineProperty(event, 'timeStamp', {
      value: timeStamp,
      writable: false,
      configurable: true
    });
    
    return event;
  }

  /**
   * Script-src violation - critical/high severity
   */
  static withScriptSrcViolation(): SecurityPolicyViolationEvent {
    return SecurityPolicyViolationEventMother.withCustomValues({
      effectiveDirective: 'script-src',
      blockedURI: 'https://malicious.com/script.js',
      sourceFile: 'https://example.com/index.html',
      lineNumber: 25
    }, 1500);
  }

  /**
   * Inline script violation - critical severity
   */
  static withInlineScriptViolation(): SecurityPolicyViolationEvent {
    return SecurityPolicyViolationEventMother.withCustomValues({
      effectiveDirective: 'script-src',
      blockedURI: 'inline',
      sourceFile: 'https://example.com/page.html',
      lineNumber: 67,
      columnNumber: 15
    }, 2000);
  }

  /**
   * Eval violation - critical severity
   */
  static withEvalViolation(): SecurityPolicyViolationEvent {
    return SecurityPolicyViolationEventMother.withCustomValues({
      effectiveDirective: 'script-src',
      blockedURI: 'eval',
      sourceFile: 'https://example.com/dynamic.js',
      lineNumber: 123
    }, 2500);
  }

  /**
   * Style-src violation - high severity
   */
  static withStyleSrcViolation(): SecurityPolicyViolationEvent {
    return SecurityPolicyViolationEventMother.withCustomValues({
      effectiveDirective: 'style-src',
      blockedURI: 'https://fonts.googleapis.com/css',
      sourceFile: 'https://example.com/styles.css',
      lineNumber: 5
    }, 3000);
  }

  /**
   * Connect-src violation - high severity
   */
  static withConnectSrcViolation(): SecurityPolicyViolationEvent {
    return SecurityPolicyViolationEventMother.withCustomValues({
      effectiveDirective: 'connect-src',
      blockedURI: 'https://api.third-party.com/data',
      sourceFile: 'https://example.com/api.js',
      lineNumber: 89
    }, 3500);
  }

  /**
   * Image-src violation - medium severity
   */
  static withImgSrcViolation(): SecurityPolicyViolationEvent {
    return SecurityPolicyViolationEventMother.withCustomValues({
      effectiveDirective: 'img-src',
      blockedURI: 'https://untrusted.com/image.jpg',
      sourceFile: 'https://example.com/gallery.html',
      lineNumber: 156
    }, 4000);
  }

  /**
   * Frame-src violation - medium severity
   */
  static withFrameSrcViolation(): SecurityPolicyViolationEvent {
    return SecurityPolicyViolationEventMother.withCustomValues({
      effectiveDirective: 'frame-src',
      blockedURI: 'https://embed.third-party.com/widget',
      sourceFile: 'https://example.com/widgets.html',
      lineNumber: 78
    }, 4500);
  }

  /**
   * Font-src violation - medium severity
   */
  static withFontSrcViolation(): SecurityPolicyViolationEvent {
    return SecurityPolicyViolationEventMother.withCustomValues({
      effectiveDirective: 'font-src',
      blockedURI: 'https://fonts.example.com/custom.woff2',
      sourceFile: 'https://example.com/typography.css',
      lineNumber: 12
    }, 5000);
  }

  /**
   * Object-src violation - low severity
   */
  static withObjectSrcViolation(): SecurityPolicyViolationEvent {
    return SecurityPolicyViolationEventMother.withCustomValues({
      effectiveDirective: 'object-src',
      blockedURI: 'https://plugins.com/flash.swf',
      sourceFile: 'https://example.com/legacy.html',
      lineNumber: 234
    }, 5500);
  }

  /**
   * Data URI violation
   */
  static withDataURIViolation(): SecurityPolicyViolationEvent {
    return SecurityPolicyViolationEventMother.withCustomValues({
      effectiveDirective: 'img-src',
      blockedURI: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      sourceFile: 'https://example.com/images.html',
      lineNumber: 45
    }, 6000);
  }

  /**
   * Blob URI violation
   */
  static withBlobURIViolation(): SecurityPolicyViolationEvent {
    return SecurityPolicyViolationEventMother.withCustomValues({
      effectiveDirective: 'script-src',
      blockedURI: 'blob:https://example.com/550e8400-e29b-41d4-a716-446655440000',
      sourceFile: 'https://example.com/dynamic.js',
      lineNumber: 98
    }, 6500);
  }

  /**
   * Violation without source file info
   */
  static withoutSourceFile(): SecurityPolicyViolationEvent {
    return SecurityPolicyViolationEventMother.withCustomValues({
      effectiveDirective: 'script-src',
      blockedURI: 'https://unknown.com/script.js',
      sourceFile: undefined,
      lineNumber: undefined,
      columnNumber: undefined
    }, 7000);
  }
}