import { PerformanceTimestamp } from "@/shared/PerformanceTimestamp";
import { ErrorReport, SeverityLevel, UNKNOWN } from "./ErrorReport";

type RejectionType = 'network' | 'javascript' | 'parsing' | 'timeout' | 'memory' | 'loading' | 'generic';

interface PromiseErrorData {
  id: string;
  createdAt: PerformanceTimestamp;
  occurredAt: PerformanceTimestamp;
  errorMessage: string;
  errorName?: string;
  stack?: string;
}

/**
 * Extracts error message from PromiseRejectionEvent with comprehensive fallback hierarchy.
 * 
 * @param promiseError - The PromiseRejectionEvent from unhandledrejection listener
 * @returns Extracted error message or 'unknown' if unable to determine
 */
const extractErrorMessage = (promiseError: PromiseRejectionEvent): string => {
  const { reason } = promiseError;

  if (!reason) return UNKNOWN;

  // Handle Error objects
  if (reason instanceof Error) {
    return reason.message || UNKNOWN;
  }
  
  // Handle string reasons
  if (typeof reason === 'string') return reason;
  
  // Handle object reasons (API responses, etc.)
  if (typeof reason === 'object') {
    const message = reason.message || reason.error || reason.statusText;
    if (message) return message;
    
    if (reason.status) {
      return `${reason.status}: ${reason.statusText || UNKNOWN}`;
    }
  }
  
  // Better: explicit string conversion with fallback
  try {
    return String(reason);
  } catch {
    return UNKNOWN;
  }
};

/**
 * Report for capturing and analyzing unhandled Promise rejections.
 * 
 * Provides structured error information including severity classification,
 * rejection type categorization, and comprehensive analysis for better
 * error monitoring and debugging of asynchronous operations.
 */
export class UnhandledPromiseRejectionReport implements ErrorReport {
  /** Unique identifier for the error report */
  public readonly id: string;
  
  /** Timestamp when the error report was created */
  public readonly createdAt: PerformanceTimestamp;

  /** Timestamp when the performance event occurred */
  public readonly occurredAt: PerformanceTimestamp;

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
    this.occurredAt = data.occurredAt;
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
  public static create(data: PromiseErrorData): UnhandledPromiseRejectionReport {
    return new UnhandledPromiseRejectionReport(data);
  }

  /**
   * Creates a PromiseErrorReport from a PromiseRejectionEvent.
   * 
   * @param id - Unique identifier for the error report
   * @param promiseError - PromiseRejectionEvent from unhandledrejection listener
   * @returns New PromiseErrorReport instance with extracted error data
   */
  public static fromPromiseRejectionEvent(
    id: string, 
    promiseError: PromiseRejectionEvent
  ): UnhandledPromiseRejectionReport {
    return new UnhandledPromiseRejectionReport({
      id,
      createdAt: PerformanceTimestamp.now(),
      occurredAt: PerformanceTimestamp.fromRelativeTime(promiseError.timeStamp),
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
  public get rejectionType(): RejectionType {
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
      /**
       * Unique identifier for the error report
       * This is typically a UUID or similar unique string
       */
      id: this.id,
      /**
       * Timestamp when the error report was created
       */
      createdAt: this.createdAt.absoluteTime,
      /**
       * Timestamp when the performance event occurred
       * This may differ from createdAt if the report is generated after the event
       */
      occurredAt: this.occurredAt.absoluteTime,
      /**
       * Severity level of the error
       * - 'CRITICAL': Application-breaking errors that stop execution
       * - 'HIGH': Major functionality errors affecting user experience
       * - 'MEDIUM': Moderate errors that may degrade functionality
       * - 'LOW': Minor errors with minimal user impact
       * @enum {string} 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
       */
      severity: this.severity,
      /**
       * Specific type of promise rejection
       * - 'network': Errors related to connectivity issues
       * - 'javascript': JavaScript runtime errors
       * - 'parsing': Errors parsing data (e.g., JSON)
       * - 'timeout': Operation timed out or was aborted
       * - 'memory': Memory or stack overflow errors
       * - 'loading': Resource/module loading failures
       * - 'generic': Other uncategorized errors
       * @enum {string} 'network' | 'javascript' | 'parsing' | 'timeout' | 'memory' | 'loading' | 'generic'
       */
      rejectionType: this.rejectionType,
      /**
       * Indicates if the error is related to network/connectivity issues
       */
      isNetworkRelated: this.isNetworkRelated,
      /**
       * Indicates if the error is a JavaScript runtime error
       */
      isJavaScriptError: this.isJavaScriptError,
      /**
       * Indicates if the error is due to resource loading failure
       */
      isLoadingFailure: this.isLoadingFailure,
      /**
       * Indicates if the error is likely recoverable (e.g., network timeouts)
       */
      isRecoverable: this.isRecoverable,
      /**
       * Human-readable error message
       */
      errorMessage: this.errorMessage,
      /**
       * Name of the error (if available)
       */
      errorName: this.errorName,
      /**
       * Stack trace of the error (if available)
       */
      stack: this.stack,
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
