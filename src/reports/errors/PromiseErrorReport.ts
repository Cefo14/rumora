import { ErrorReport, SeverityLevel } from "./ErrorReport";

interface PromiseErrorData {
  id: string;
  createdAt: number;
  errorMessage: string;
  errorName?: string;
  stack?: string;
}

/**
 * Extracts error message from PromiseRejectionEvent with comprehensive fallback hierarchy.
 * 
 * @param promiseError - The PromiseRejectionEvent from unhandledrejection listener
 * @returns Extracted error message or descriptive fallback text
 */
const extractErrorMessage = (promiseError: PromiseRejectionEvent): string => {
  const { reason } = promiseError;
  
  if (!reason) return 'Promise rejected with no reason';
  
  // Handle Error objects
  if (reason instanceof Error) {
    return reason.message || 'Unknown error';
  }
  
  // Handle string reasons
  if (typeof reason === 'string') return reason;
  
  // Handle object reasons (API responses, etc.)
  if (typeof reason === 'object') {
    const message = reason.message || reason.error || reason.statusText;
    if (message) return message;
    
    if (reason.status) {
      return `${reason.status}: ${reason.statusText || 'Unknown'}`;
    }
  }
  
  // Better: explicit string conversion with fallback
  try {
    return String(reason);
  } catch {
    return 'Promise rejected with unserializable reason';
  }
};

/**
 * Report for capturing and analyzing unhandled Promise rejections.
 * 
 * Provides structured error information including severity classification,
 * rejection type categorization, and comprehensive analysis for better
 * error monitoring and debugging of asynchronous operations.
 */
export class PromiseErrorReport implements ErrorReport {
  /** Unique identifier for the error report */
  public readonly id: string;
  
  /** Timestamp when the error report was created */
  public readonly createdAt: number;

  /**
   * Human-readable error message describing what went wrong.
   * 
   * Extracted from the Promise rejection reason using a comprehensive
   * fallback hierarchy to ensure meaningful error information.
   */
  public readonly errorMessage: string;

  /**
   * Type of error (e.g., TypeError, NetworkError) if available.
   * 
   * Helps classify the category of promise rejection for automated
   * handling and pattern analysis.
   */
  public readonly errorName?: string;

  /**
   * Complete stack trace if available from the rejection reason.
   * 
   * Essential for debugging as it shows the execution path that
   * led to the promise rejection.
   */
  public readonly stack?: string;

  private constructor(data: PromiseErrorData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.errorMessage = data.errorMessage;
    this.errorName = data.errorName;
    this.stack = data.stack;

    Object.freeze(this);
  }

  /**
   * Creates a PromiseErrorReport from provided data.
   * 
   * @param data - Promise error data
   * @returns New PromiseErrorReport instance
   */
  public static create(data: PromiseErrorData): PromiseErrorReport {
    return new PromiseErrorReport(data);
  }

  /**
   * Creates a PromiseErrorReport from a PromiseRejectionEvent.
   * 
   * @param id - Unique identifier for the error report
   * @param createdAt - Timestamp when the error report was created
   * @param promiseError - PromiseRejectionEvent from unhandledrejection listener
   * @returns New PromiseErrorReport instance with extracted error data
   */
  public static fromPromiseRejectionEvent(
    id: string, 
    createdAt: number, 
    promiseError: PromiseRejectionEvent
  ): PromiseErrorReport {
    return new PromiseErrorReport({
      id,
      createdAt,
      errorMessage: extractErrorMessage(promiseError),
      errorName: promiseError.reason?.name,
      stack: promiseError.reason?.stack,
    });
  }

  /**
   * Determines the severity level of the Promise rejection.
   * 
   * Classification based on error impact and recoverability:
   * - CRITICAL: Application-breaking errors that stop execution
   * - HIGH: Major functionality errors affecting user experience  
   * - MEDIUM: Moderate errors that may degrade functionality
   * - LOW: Minor errors with minimal user impact
   */
  public get severity(): SeverityLevel {
    const errorText = `${this.errorMessage} ${this.errorName || ''}`.toLowerCase();

    // CRITICAL - Application breaking
    if (this.isCriticalSystemError(errorText)) return 'critical';

    // HIGH - Major functionality impact
    if (this.isHighSeverityError(errorText)) return 'high';

    // MEDIUM - Moderate impact
    if (this.isMediumSeverityError(errorText)) return 'medium';

    // LOW - Minor impact
    return 'low';
  }

  /**
   * Gets the specific type of promise rejection for categorization.
   * 
   * Categories help identify patterns and appropriate response strategies.
   */
  public get rejectionType(): 'network' | 'javascript' | 'parsing' | 'timeout' | 'memory' | 'loading' | 'generic' {
    const errorText = `${this.errorMessage} ${this.errorName || ''}`.toLowerCase();

    // Network/connectivity errors
    if (this.isNetworkRelated) return 'network';

    // JavaScript runtime errors
    if (this.isJavaScriptError) return 'javascript';

    // Parsing errors
    if (this.hasParsingPatterns(errorText)) return 'parsing';

    // Timeout/cancellation errors
    if (this.hasTimeoutPatterns(errorText)) return 'timeout';

    // Memory/stack errors
    if (errorText.includes('memory') || errorText.includes('stack')) return 'memory';

    // Module loading errors
    if (errorText.includes('chunk') || errorText.includes('module') || errorText.includes('import')) return 'loading';

    return 'generic';
  }

  /**
   * Checks if this promise rejection indicates a network connectivity issue.
   * 
   * Network-related rejections are typically transient and infrastructure-related.
   */
  public get isNetworkRelated(): boolean {
    const errorText = `${this.errorMessage} ${this.errorName || ''}`.toLowerCase();
    return this.hasNetworkPatterns(errorText);
  }

  /**
   * Checks if this promise rejection indicates a JavaScript runtime error.
   * 
   * JavaScript errors suggest code defects that should be fixed.
   */
  public get isJavaScriptError(): boolean {
    return this.hasJavaScriptPatterns();
  }

  /**
   * Checks if this promise rejection indicates a resource loading failure.
   * 
   * Loading failures can indicate build issues or deployment problems.
   */
  public get isLoadingFailure(): boolean {
    return this.rejectionType === 'loading';
  }

  /**
   * Checks if this promise rejection is likely recoverable.
   * 
   * Some rejections (like timeouts or network issues) can be retried,
   * while others (like syntax errors) are permanent failures.
   */
  public get isRecoverable(): boolean {
    const recoverableTypes = ['network', 'timeout'];
    return recoverableTypes.includes(this.rejectionType);
  }

  /**
   * String representation of the Promise rejection error.
   * 
   * @returns Formatted string with severity, type, and message
   */
  public toString(): string {
    const severity = this.severity.toUpperCase();
    const type = this.rejectionType.toUpperCase();
    return `PROMISE-REJECTION [${severity}] [${type}]: ${this.errorMessage}`;
  }

  /**
   * JSON representation for serialization.
   * 
   * @returns Object with all error data and computed analysis
   */
  public toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      severity: this.severity,
      errorMessage: this.errorMessage,
      errorName: this.errorName,
      stack: this.stack,
      rejectionType: this.rejectionType,
      isNetworkRelated: this.isNetworkRelated,
      isJavaScriptError: this.isJavaScriptError,
      isLoadingFailure: this.isLoadingFailure,
      isRecoverable: this.isRecoverable
    };
  }

  private isCriticalSystemError(errorText: string): boolean {
    const criticalPatterns = [
      'out of memory',
      'maximum call stack',
      'stack overflow',
      'recursion',
      'heap out of memory',
      'chunk load failed',
      'loading chunk failed',
    ];

    return criticalPatterns.some(pattern => errorText.includes(pattern));
  }

  private isHighSeverityError(errorText: string): boolean {
    const highSeverityPatterns = [
      'networkerror',
      'failed to fetch',
      'cors',
      'net::err_',
      'dns',
      'ssl',
      'certificate',
      'connection refused',
      'connection reset',
      'permission denied',
    ];

    return highSeverityPatterns.some(pattern => errorText.includes(pattern));
  }

  private isMediumSeverityError(errorText: string): boolean {
    const mediumSeverityPatterns = [
      'timeout',
      'aborterror',
      'aborted',
      'unexpected token',
      'invalid json',
      'syntaxerror',
      'typeerror',
      'referenceerror',
      'module not found',
      'import error',
    ];

    return mediumSeverityPatterns.some(pattern => errorText.includes(pattern));
  }

  private hasNetworkPatterns(errorText: string): boolean {
    const networkKeywords = [
      'networkerror',
      'failed to fetch', 
      'cors',
      'net::err_',
      'dns',
      'ssl',
      'connection'
    ];
    return networkKeywords.some(keyword => errorText.includes(keyword));
  }

  private hasJavaScriptPatterns(): boolean {
    if (!this.errorName) return false;
    
    const jsErrors = ['typeerror', 'referenceerror', 'syntaxerror', 'rangeerror'];
    const errorNameLower = this.errorName.toLowerCase();
    return jsErrors.some(error => errorNameLower.includes(error));
  }

  private hasParsingPatterns(errorText: string): boolean {
    return errorText.includes('unexpected token') ||
           errorText.includes('invalid json') ||
           this.errorName?.toLowerCase() === 'syntaxerror';
  }

  private hasTimeoutPatterns(errorText: string): boolean {
    return errorText.includes('timeout') ||
           errorText.includes('abort') ||
           this.errorName?.toLowerCase() === 'aborterror';
  }
}
