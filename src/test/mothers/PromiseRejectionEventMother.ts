/* eslint-disable @typescript-eslint/no-extraneous-class */
export class PromiseRejectionEventMother {
  /**
   * Helper to create a handled rejected promise to avoid unhandled rejection warnings
   */
  private static createHandledRejection<T>(reason: T): Promise<never> {
    const promise = Promise.reject(reason);
    // Attach a silent catch to prevent unhandled rejection warnings
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    promise.catch(() => {});
    return promise;
  }

  /**
   * Default PromiseRejectionEvent
   */
  static aDefault(): PromiseRejectionEvent {
    const error = new Error('Default promise rejection');
    const event = new PromiseRejectionEvent('unhandledrejection', {
      reason: error,
      promise: PromiseRejectionEventMother.createHandledRejection(error)
    });
    
    Object.defineProperty(event, 'timeStamp', {
      value: 1000,
      writable: false,
      configurable: true
    });
    
    return event;
  }

  /**
   * Custom PromiseRejectionEvent with overrides
   */
  static withCustomValues(
    overrides: Partial<PromiseRejectionEventInit> = {},
    timeStamp = 1000
  ): PromiseRejectionEvent {
    const defaultReason = new Error('Custom promise rejection');
    const defaultInit: PromiseRejectionEventInit = {
      reason: defaultReason,
      promise: PromiseRejectionEventMother.createHandledRejection(defaultReason)
    };
    
    // If reason is provided in overrides, create a new handled promise for it
    const finalInit = { ...defaultInit, ...overrides };
    if (overrides.reason && !overrides.promise) {
      finalInit.promise = PromiseRejectionEventMother.createHandledRejection(overrides.reason);
    }
    
    const event = new PromiseRejectionEvent('unhandledrejection', finalInit);
    
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
  static withTypeError(): PromiseRejectionEvent {
    const error = new TypeError('Cannot read property of undefined');
    return PromiseRejectionEventMother.withCustomValues({
      reason: error,
      promise: PromiseRejectionEventMother.createHandledRejection(error)
    }, 1500);
  }

  /**
   * Network error - high severity
   */
  static withNetworkError(): PromiseRejectionEvent {
    const error = new Error('Failed to fetch');
    return PromiseRejectionEventMother.withCustomValues({
      reason: error,
      promise: PromiseRejectionEventMother.createHandledRejection(error)
    }, 2000);
  }

  /**
   * CORS error - high severity
   */
  static withCORSError(): PromiseRejectionEvent {
    const error = new Error('CORS policy blocked the request');
    return PromiseRejectionEventMother.withCustomValues({
      reason: error,
      promise: PromiseRejectionEventMother.createHandledRejection(error)
    }, 2500);
  }

  /**
   * Out of memory error - critical severity
   */
  static withOutOfMemoryError(): PromiseRejectionEvent {
    const error = new Error('JavaScript heap out of memory');
    return PromiseRejectionEventMother.withCustomValues({
      reason: error,
      promise: PromiseRejectionEventMother.createHandledRejection(error)
    }, 3000);
  }

  /**
   * Chunk load error - critical severity
   */
  static withChunkLoadError(): PromiseRejectionEvent {
    const error = new Error('Loading chunk 0 failed');
    return PromiseRejectionEventMother.withCustomValues({
      reason: error,
      promise: PromiseRejectionEventMother.createHandledRejection(error)
    }, 3500);
  }

  /**
   * Timeout error - medium severity
   */
  static withTimeoutError(): PromiseRejectionEvent {
    const error = new Error('Request timeout after 5000ms');
    return PromiseRejectionEventMother.withCustomValues({
      reason: error,
      promise: PromiseRejectionEventMother.createHandledRejection(error)
    }, 4000);
  }

  /**
   * JSON parsing error - medium severity
   */
  static withJSONError(): PromiseRejectionEvent {
    const error = new SyntaxError('Unexpected token in JSON at position 0');
    return PromiseRejectionEventMother.withCustomValues({
      reason: error,
      promise: PromiseRejectionEventMother.createHandledRejection(error)
    }, 4500);
  }

  /**
   * String reason rejection
   */
  static withStringReason(): PromiseRejectionEvent {
    const reason = 'Something went wrong';
    return PromiseRejectionEventMother.withCustomValues({
      reason,
      promise: PromiseRejectionEventMother.createHandledRejection(reason)
    }, 5000);
  }

  /**
   * Object reason with status (API error)
   */
  static withObjectReason(): PromiseRejectionEvent {
    const apiError = {
      status: 404,
      statusText: 'Not Found',
      message: 'Resource not found'
    };
    return PromiseRejectionEventMother.withCustomValues({
      reason: apiError,
      promise: PromiseRejectionEventMother.createHandledRejection(apiError)
    }, 5500);
  }

  /**
   * Object reason with only status
   */
  static withStatusOnlyReason(): PromiseRejectionEvent {
    const statusError = { status: 500 };
    return PromiseRejectionEventMother.withCustomValues({
      reason: statusError,
      promise: PromiseRejectionEventMother.createHandledRejection(statusError)
    }, 6000);
  }

  /**
   * Null/undefined reason
   */
  static withNullReason(): PromiseRejectionEvent {
    return PromiseRejectionEventMother.withCustomValues({
      reason: null,
      promise: PromiseRejectionEventMother.createHandledRejection(null)
    }, 6500);
  }

  /**
   * Error without message
   */
  static withErrorNoMessage(): PromiseRejectionEvent {
    const error = new Error();
    error.message = ''; // Explicitly empty
    return PromiseRejectionEventMother.withCustomValues({
      reason: error,
      promise: PromiseRejectionEventMother.createHandledRejection(error)
    }, 7000);
  }

  /**
   * Complex object that fails string conversion
   */
  static withComplexReason(): PromiseRejectionEvent {
    const complexReason = {
      toString: () => { throw new Error('Cannot convert to string'); }
    };
    return PromiseRejectionEventMother.withCustomValues({
      reason: complexReason,
      promise: PromiseRejectionEventMother.createHandledRejection(complexReason)
    }, 7500);
  }
}