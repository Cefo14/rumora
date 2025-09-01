import { ErrorReport, SeverityLevel } from "./ErrorReport";

interface JavaScriptErrorData {
  id: string;
  createdAt: number;
  errorMessage: string;
  errorName?: string;
  stack?: string;
  filename?: string;
  lineNumber?: number;
  columnNumber?: number;
}

/**
 * Extracts error message from ErrorEvent with fallback hierarchy.
 * 
 * @param errorEvent - The ErrorEvent from window.onerror or similar
 * @returns Extracted error message or fallback text
 */
const extractErrorMessage = (errorEvent: ErrorEvent): string => {
  // Try direct message first
  if (errorEvent.message && errorEvent.message.trim()) {
    return errorEvent.message;
  }
  
  // Try error object message
  if (errorEvent.error?.message && errorEvent.error.message.trim()) {
    return errorEvent.error.message;
  }
  
  // Try error object toString
  if (errorEvent.error?.toString && typeof errorEvent.error.toString === 'function') {
    const errorString = errorEvent.error.toString();
    if (errorString && errorString !== '[object Object]') {
      return errorString;
    }
  }
  
  return 'Unknown JavaScript error occurred';
};

/**
 * Report for capturing and analyzing JavaScript runtime errors.
 * 
 * Provides structured error information including severity classification,
 * source location tracking, and third-party script detection for better
 * error monitoring and debugging capabilities.
 */
export class JavaScriptErrorReport implements ErrorReport {
  /** Unique identifier for the error report */
  public readonly id: string;
  
  /** Timestamp when the error report was created */
  public readonly createdAt: number;

  /**
   * Human-readable error message describing what went wrong.
   * 
   * This is the primary description of the error that occurred,
   * extracted from the ErrorEvent or Error object.
   */
  public readonly errorMessage: string;

  /**
   * Type of JavaScript error (e.g., TypeError, ReferenceError) if available.
   * 
   * Helps classify the category of error for automated handling
   * and severity assessment.
   */
  public readonly errorName?: string;

  /**
   * Complete stack trace showing the call hierarchy when error occurred.
   * 
   * Essential for debugging as it shows the exact execution path
   * that led to the error.
   */
  public readonly stack?: string;

  /**
   * URL of the script file where the error occurred.
   * 
   * Helps identify the source of the error and determine if it's
   * from first-party or third-party code.
   */
  public readonly filename?: string;

  /**
   * Line number within the script where the error occurred.
   * 
   * Provides precise location information for debugging,
   * though may be approximate due to minification.
   */
  public readonly lineNumber?: number;

  /**
   * Column number within the line where the error occurred.
   * 
   * Offers fine-grained location information, particularly useful
   * for identifying specific expressions that failed.
   */
  public readonly columnNumber?: number;

  private constructor(data: JavaScriptErrorData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.errorMessage = data.errorMessage;
    this.errorName = data.errorName;
    this.stack = data.stack;
    this.filename = data.filename;
    this.lineNumber = data.lineNumber;
    this.columnNumber = data.columnNumber;

    Object.freeze(this);
  }

  /**
   * Creates a JavaScriptErrorReport from provided data.
   * 
   * @param data - JavaScript error data
   * @returns New JavaScriptErrorReport instance
   */
  public static create(data: JavaScriptErrorData): JavaScriptErrorReport {
    return new JavaScriptErrorReport(data);
  }

  /**
   * Creates a JavaScriptErrorReport from an ErrorEvent.
   * 
   * @param id - Unique identifier for the error report
   * @param createdAt - Timestamp when the error report was created
   * @param errorEvent - ErrorEvent from window.onerror or similar handlers
   * @returns New JavaScriptErrorReport instance with extracted error data
   */
  public static fromErrorEvent(id: string, createdAt: number, errorEvent: ErrorEvent): JavaScriptErrorReport {
    return new JavaScriptErrorReport({
      id,
      createdAt,
      errorMessage: extractErrorMessage(errorEvent),
      errorName: errorEvent.error?.name,
      stack: errorEvent.error?.stack,
      filename: errorEvent.filename,
      lineNumber: errorEvent.lineno,
      columnNumber: errorEvent.colno,
    });
  }

  /**
   * Determines the severity level of the JavaScript error.
   * 
   * Classification based on error impact and recoverability:
   * - CRITICAL: Application-breaking errors that stop execution
   * - HIGH: Major functionality errors affecting user experience  
   * - MEDIUM: Moderate errors that may degrade functionality
   * - LOW: Minor errors with minimal user impact
   */
  public get severity(): SeverityLevel {
    const errorName = this.errorName?.toLowerCase() ?? '';
    const errorMessage = this.errorMessage.toLowerCase();

    // CRITICAL - Application breaking
    if (this.isCriticalError(errorName, errorMessage)) return 'critical';
    
    // HIGH - Major functionality impact
    if (this.isHighSeverityError(errorName, errorMessage)) return 'high';
    
    // MEDIUM - Moderate impact
    if (this.isMediumSeverityError(errorName, errorMessage)) return 'medium';
    
    // LOW - Minor impact
    return 'low';
  }

  /**
   * Determines if the error originated from a third-party script.
   * 
   * Third-party scripts are those loaded from different domains,
   * which typically cannot be fixed directly by the application team.
   * This helps prioritize errors that can actually be addressed.
   */
  public get isThirdPartyScript(): boolean {
    if (!this.filename) return true; // Unknown source = treat as third-party
    
    try {
      const scriptUrl = new URL(this.filename);
      const currentOrigin = window.location.origin;
      
      // Check if origins match (protocol + host + port)
      return scriptUrl.origin !== currentOrigin;
    } catch {
      // If URL parsing fails, assume third-party for safety
      return true;
    }
  }

  /**
   * Checks if this error indicates a programming bug vs runtime issue.
   * 
   * Programming errors suggest code defects that should be fixed.
   */
  public get isProgrammingError(): boolean {
    const programmingErrorNames = ['syntaxerror', 'referenceerror', 'typeerror'];
    return programmingErrorNames.includes(this.errorName?.toLowerCase() ?? '');
  }

  /**
   * Checks if this error is likely caused by network/infrastructure issues.
   * 
   * Network-related errors are typically transient and infrastructure-related.
   */
  public get isNetworkRelated(): boolean {
    const networkPatterns = ['failed to fetch', 'network error', 'timeout', 'cors'];
    return networkPatterns.some(pattern => 
      this.errorMessage.toLowerCase().includes(pattern)
    );
  }

  /**
   * Gets a simplified error category for grouping and analysis.
   */
  public get errorCategory(): 'syntax' | 'runtime' | 'network' | 'resource' | 'unknown' {
    const errorName = this.errorName?.toLowerCase() ?? '';
    
    if (errorName === 'syntaxerror') return 'syntax';
    if (this.isNetworkRelated) return 'network';
    if (['typeerror', 'referenceerror', 'rangeerror'].includes(errorName)) return 'runtime';
    if (this.errorMessage.toLowerCase().includes('load')) return 'resource';
    
    return 'unknown';
  }

  /**
   * String representation of the JavaScript error.
   * 
   * @returns Formatted string with severity, message, and location
   */
  public toString(): string {
    const severity = this.severity.toUpperCase();
    const location = this.filename ? ` at ${this.filename}:${this.lineNumber}` : '';
    const thirdParty = this.isThirdPartyScript ? ' [THIRD-PARTY]' : '';
    return `JAVASCRIPT [${severity}]: ${this.errorMessage}${location}${thirdParty}`;
  }

  /**
   * JSON representation for serialization.
   * 
   * @returns Object with all error data and computed analysis
   */
  public toJSON(): unknown {
    return {
      id: this.id,
      createdAt: this.createdAt,
      severity: this.severity,
      errorMessage: this.errorMessage,
      errorName: this.errorName,
      stack: this.stack,
      filename: this.filename,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      isThirdPartyScript: this.isThirdPartyScript,
      isProgrammingError: this.isProgrammingError,
      isNetworkRelated: this.isNetworkRelated,
      errorCategory: this.errorCategory
    };
  }

  private isCriticalError(errorName: string, errorMessage: string): boolean {
    return errorName === 'syntaxerror' ||
           errorMessage.includes('out of memory') ||
           errorMessage.includes('maximum call stack') ||
           errorMessage.includes('script error'); // CORS errors
  }

  private isHighSeverityError(errorName: string, errorMessage: string): boolean {
    const highSeverityPatterns = [
      'cannot read prop',
      'undefined is not',
      'is not a function',
      'is not defined',
      'cannot access before initialization'
    ];
    
    return errorName === 'typeerror' ||
           errorName === 'referenceerror' ||
           highSeverityPatterns.some(pattern => errorMessage.includes(pattern));
  }

  private isMediumSeverityError(errorName: string, errorMessage: string): boolean {
    const mediumSeverityPatterns = [
      'failed to fetch',
      'network error',
      'timeout'
    ];
    
    return errorName === 'rangeerror' ||
           errorName === 'urierror' ||
           errorName === 'evalerror' ||
           mediumSeverityPatterns.some(pattern => errorMessage.includes(pattern));
  }
}
