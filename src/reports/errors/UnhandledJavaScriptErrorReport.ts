import { PerformanceTime } from "@/value-objects/PerformanceTime";
import { ErrorReport, SeverityLevel } from "./ErrorReport";

interface JavaScriptErrorData {
  id: string;
  createdAt: PerformanceTime;
  occurredAt: PerformanceTime;
  errorMessage: string;
  errorName?: string;
  stack?: string;
  filename?: string;
  lineNumber?: number;
  columnNumber?: number;
}

/**
 * Extracts error message from ErrorEvent with fallback hierarchy.
 */
const extractErrorMessage = (errorEvent: ErrorEvent): string => {
  if (errorEvent.message?.trim()) {
    return errorEvent.message;
  }
  
  if (errorEvent.error?.message?.trim()) {
    return errorEvent.error.message;
  }
  
  if (errorEvent.error?.toString && typeof errorEvent.error.toString === 'function') {
    const errorString = errorEvent.error.toString();
    if (errorString && errorString !== '[object Object]') {
      return errorString;
    }
  }
  
  return 'Unknown error';
};

/**
 * Report for capturing JavaScript runtime errors.
 * 
 * Provides structured error information with basic classification
 * for error monitoring and debugging.
 */
export class UnhandledJavaScriptErrorReport implements ErrorReport {
  public readonly id: string;
  public readonly createdAt: PerformanceTime;
  public readonly occurredAt: PerformanceTime;
  public readonly errorMessage: string;
  public readonly errorName?: string;
  public readonly stack?: string;
  public readonly filename?: string;
  public readonly lineNumber?: number;
  public readonly columnNumber?: number;

  private constructor(data: JavaScriptErrorData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.occurredAt = data.occurredAt;
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
   */
  public static create(data: JavaScriptErrorData): UnhandledJavaScriptErrorReport {
    return new UnhandledJavaScriptErrorReport(data);
  }

  /**
   * Creates a JavaScriptErrorReport from an ErrorEvent.
   */
  public static fromErrorEvent(id: string, errorEvent: ErrorEvent): UnhandledJavaScriptErrorReport {
    return new UnhandledJavaScriptErrorReport({
      id,
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(errorEvent.timeStamp),
      errorMessage: extractErrorMessage(errorEvent),
      errorName: errorEvent.error?.name,
      stack: errorEvent.error?.stack,
      filename: errorEvent.filename,
      lineNumber: errorEvent.lineno,
      columnNumber: errorEvent.colno,
    });
  }

  /**
   * Basic severity classification based on error type.
   */
  public get severity(): SeverityLevel {
    const errorName = this.errorName?.toLowerCase();
    
    // Critical: Syntax errors and memory issues
    if (errorName === 'syntaxerror' || 
        this.errorMessage.toLowerCase().includes('out of memory')) {
      return 'critical';
    }
    
    // High: Common programming errors
    if (errorName === 'typeerror' || errorName === 'referenceerror') {
      return 'high';
    }
    
    // Medium: Range and other runtime errors
    if (errorName === 'rangeerror' || errorName === 'urierror') {
      return 'medium';
    }
    
    // Default to low for unknown errors
    return 'low';
  }

  /**
   * Checks if error originated from a third-party script.
   */
  public get isThirdPartyScript(): boolean {
    if (!this.filename) return false;
    
    try {
      const scriptUrl = new URL(this.filename);
      const currentOrigin = window.location.origin;
      return scriptUrl.origin !== currentOrigin;
    } catch {
      return true; // Assume third-party if URL parsing fails
    }
  }

  /**
   * Checks if this appears to be a programming error vs runtime issue.
   */
  public get isProgrammingError(): boolean {
    const programmingErrors = ['syntaxerror', 'referenceerror', 'typeerror'];
    return programmingErrors.includes(this.errorName?.toLowerCase() ?? '');
  }

  /**
   * String representation of the error.
   */
  public toString(): string {
    const location = this.filename ? ` at ${this.filename}:${this.lineNumber}` : '';
    const thirdParty = this.isThirdPartyScript ? ' [3rd-party]' : '';
    return `JS Error [${this.severity.toUpperCase()}]: ${this.errorMessage}${location}${thirdParty}`;
  }

  /**
   * JSON representation for serialization.
   */
  public toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt.absoluteTime,
      occurredAt: this.occurredAt.absoluteTime,
      errorMessage: this.errorMessage,
      errorName: this.errorName,
      stack: this.stack,
      filename: this.filename,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      severity: this.severity,
      isThirdPartyScript: this.isThirdPartyScript,
      isProgrammingError: this.isProgrammingError,
    };
  }
}