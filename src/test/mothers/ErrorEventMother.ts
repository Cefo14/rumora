/* eslint-disable @typescript-eslint/no-extraneous-class */

export class ErrorEventMother {
  /**
   * Default ErrorEvent
   */
  static aDefault(): ErrorEvent {
    const event = new ErrorEvent('error', {
      message: 'Test error message',
      filename: 'https://example.com/app.js',
      lineno: 42,
      colno: 10,
      error: new Error('Test error message')
    });
    
    // Set timeStamp after creation
    Object.defineProperty(event, 'timeStamp', {
      value: 1000,
      writable: false,
      configurable: true
    });
    
    return event;
  }

  /**
   * Custom ErrorEvent with overrides
   */
  static withCustomValues(
    overrides: Partial<ErrorEventInit> = {}, 
    timeStamp = 1000
  ): ErrorEvent {
    const defaultInit: ErrorEventInit = {
      message: 'Test error message',
      filename: 'https://example.com/app.js',
      lineno: 42,
      colno: 10,
      error: new Error('Test error message')
    };
    
    const event = new ErrorEvent('error', { ...defaultInit, ...overrides });
    
    // Set timeStamp separately since it's not part of ErrorEventInit
    Object.defineProperty(event, 'timeStamp', {
      value: timeStamp,
      writable: false,
      configurable: true
    });
    
    return event;
  }

  /**
   * TypeError - high severity
   */
  static withTypeError(): ErrorEvent {
    const error = new TypeError('Cannot read property of undefined');
    return ErrorEventMother.withCustomValues({
      message: error.message,
      error,
      filename: 'https://example.com/app.js',
      lineno: 125
    }, 1500);
  }

  /**
   * ReferenceError - high severity
   */
  static withReferenceError(): ErrorEvent {
    const error = new ReferenceError('variable is not defined');
    return ErrorEventMother.withCustomValues({
      message: error.message,
      error,
      filename: 'https://example.com/components.js',
      lineno: 67
    }, 2000);
  }

  /**
   * SyntaxError - critical severity
   */
  static withSyntaxError(): ErrorEvent {
    const error = new SyntaxError('Unexpected token');
    return ErrorEventMother.withCustomValues({
      message: error.message,
      error,
      filename: 'https://example.com/parser.js',
      lineno: 15
    }, 500);
  }

  /**
   * RangeError - medium severity
   */
  static withRangeError(): ErrorEvent {
    const error = new RangeError('Maximum call stack size exceeded');
    return ErrorEventMother.withCustomValues({
      message: error.message,
      error,
      filename: 'https://example.com/recursive.js',
      lineno: 89
    }, 3000);
  }

  /**
   * Generic Error - low severity
   */
  static withGenericError(): ErrorEvent {
    const error = new Error('Something went wrong');
    return ErrorEventMother.withCustomValues({
      message: error.message,
      error,
      filename: 'https://example.com/utils.js',
      lineno: 200
    }, 2500);
  }

  /**
   * Third-party script error
   */
  static withThirdPartyError(): ErrorEvent {
    const error = new Error('Third party script error');
    return ErrorEventMother.withCustomValues({
      message: error.message,
      error,
      filename: 'https://cdn.thirdparty.com/analytics.js',
      lineno: 1
    }, 1200);
  }

  /**
   * Error with missing message (tests fallback logic)
   */
  static withMissingMessage(): ErrorEvent {
    const error = new Error('Fallback error message');
    return ErrorEventMother.withCustomValues({
      message: '', // Empty message to test fallback
      error,
      filename: 'https://example.com/broken.js',
      lineno: 33
    }, 1800);
  }

  /**
   * Error with no error object (tests extraction logic)
   */
  static withNoErrorObject(): ErrorEvent {
    return ErrorEventMother.withCustomValues({
      message: 'Message from event only',
      error: undefined,
      filename: 'https://example.com/minimal.js',
      lineno: 5
    }, 900);
  }

  /**
   * Out of memory error - critical severity
   */
  static withOutOfMemoryError(): ErrorEvent {
    const error = new Error('JavaScript heap out of memory');
    return ErrorEventMother.withCustomValues({
      message: error.message,
      error,
      filename: 'https://example.com/memory-heavy.js',
      lineno: 456
    }, 4000);
  }

  /**
   * Error with specific timestamp
   */
  static withTimestamp(timeStamp: number): ErrorEvent {
    return ErrorEventMother.withCustomValues({}, timeStamp);
  }

// ... métodos existentes ...

/**
 * Script loading error
 */
static withScriptError(): ErrorEvent {
  const script = document.createElement('script');
  script.src = 'https://example.com/app.js';
  
  const event = new ErrorEvent('error', {
    message: 'Script load error'
  });
  
  // Mock the target
  Object.defineProperty(event, 'target', {
    value: script,
    writable: false,
    configurable: true
  });
  
  Object.defineProperty(event, 'timeStamp', {
    value: 1000,
    writable: false,
    configurable: true
  });
  
  return event;
}

  /**
   * Stylesheet loading error
   */
  static withStylesheetError(): ErrorEvent {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://example.com/styles.css';
    
    const event = new ErrorEvent('error', {
      message: 'Stylesheet load error'
    });
    
    Object.defineProperty(event, 'target', {
      value: link,
      writable: false,
      configurable: true
    });
    
    Object.defineProperty(event, 'timeStamp', {
      value: 1500,
      writable: false,
      configurable: true
    });
    
    return event;
  }

  /**
   * Image loading error
   */
  static withImageError(): ErrorEvent {
    const img = document.createElement('img');
    img.src = 'https://example.com/image.jpg';
    
    const event = new ErrorEvent('error', {
      message: 'Image load error'
    });
    
    Object.defineProperty(event, 'target', {
      value: img,
      writable: false,
      configurable: true
    });
    
    Object.defineProperty(event, 'timeStamp', {
      value: 2000,
      writable: false,
      configurable: true
    });
    
    return event;
  }

  /**
   * Third-party script error
   */
  static withThirdPartyScriptError(): ErrorEvent {
    const script = document.createElement('script');
    script.src = 'https://cdn.analytics.com/tracker.js';
    
    const event = new ErrorEvent('error', {
      message: 'Third-party script load error'
    });
    
    Object.defineProperty(event, 'target', {
      value: script,
      writable: false,
      configurable: true
    });
    
    Object.defineProperty(event, 'timeStamp', {
      value: 2500,
      writable: false,
      configurable: true
    });
    
    return event;
  }

  /**
   * Iframe loading error
   */
  static withIframeError(): ErrorEvent {
    const iframe = document.createElement('iframe');
    iframe.src = 'https://example.com/widget.html';
    
    const event = new ErrorEvent('error', {
      message: 'Iframe load error'
    });
    
    Object.defineProperty(event, 'target', {
      value: iframe,
      writable: false,
      configurable: true
    });
    
    Object.defineProperty(event, 'timeStamp', {
      value: 3000,
      writable: false,
      configurable: true
    });
    
    return event;
  }

  /**
   * Generic link error (non-stylesheet)
   */
  static withLinkError(): ErrorEvent {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = 'https://example.com/resource.json';
    
    const event = new ErrorEvent('error', {
      message: 'Link load error'
    });
    
    Object.defineProperty(event, 'target', {
      value: link,
      writable: false,
      configurable: true
    });
    
    Object.defineProperty(event, 'timeStamp', {
      value: 1800,
      writable: false,
      configurable: true
    });
    
    return event;
  }

  /**
   * Resource with unknown URL format
   */
  static withUnknownResourceError(): ErrorEvent {
    const div = document.createElement('div');
    // No src/href/data properties
    
    const event = new ErrorEvent('error', {
      message: 'Unknown resource error'
    });
    
    Object.defineProperty(event, 'target', {
      value: div,
      writable: false,
      configurable: true
    });
    
    Object.defineProperty(event, 'timeStamp', {
      value: 3500,
      writable: false,
      configurable: true
    });
    
    return event;
  }
}