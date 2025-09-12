import { PerformanceTime } from "@/value-objects/PerformanceTime";
import { ErrorReport, SeverityLevel } from "./ErrorReport";

interface PromiseErrorData {
  id: string;
  createdAt: PerformanceTime;
  occurredAt: PerformanceTime;
  errorMessage: string;
  errorName?: string;
  stack?: string;
}

/**
 * Extracts error message from PromiseRejectionEvent with fallback hierarchy.
 */
const extractErrorMessage = (promiseError: PromiseRejectionEvent): string => {
  const { reason } = promiseError;

  if (!reason) return 'Unknown promise rejection';

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
      return `${reason.status}: ${reason.statusText || 'Unknown status'}`;
    }
  }
  
  // Fallback to string conversion
  try {
    return String(reason);
  } catch {
    return 'Unknown promise rejection';
  }
};

/**
 * Report for capturing unhandled Promise rejections.
 * 
 * Provides structured error information for monitoring
 * and debugging asynchronous operations.
 */
export class UnhandledPromiseRejectionReport implements ErrorReport {
  public readonly id: string;
  public readonly createdAt: PerformanceTime;
  public readonly occurredAt: PerformanceTime;
  public readonly errorMessage: string;
  public readonly errorName?: string;
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
   */
  public static create(data: PromiseErrorData): UnhandledPromiseRejectionReport {
    return new UnhandledPromiseRejectionReport(data);
  }

  /**
   * Creates a PromiseErrorReport from a PromiseRejectionEvent.
   */
  public static fromPromiseRejectionEvent(
    id: string, 
    promiseError: PromiseRejectionEvent
  ): UnhandledPromiseRejectionReport {
    return new UnhandledPromiseRejectionReport({
      id,
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(promiseError.timeStamp),
      errorMessage: extractErrorMessage(promiseError),
      errorName: promiseError.reason?.name,
      stack: promiseError.reason?.stack,
    });
  }

  /**
   * Basic severity classification based on error patterns.
   */
  public get severity(): SeverityLevel {
    const errorText = `${this.errorMessage} ${this.errorName || ''}`.toLowerCase();

    // Critical: Memory/system failures
    if (errorText.includes('out of memory') || 
        errorText.includes('stack overflow') ||
        errorText.includes('chunk load failed')) {
      return 'critical';
    }

    // High: Network and major functionality errors
    if (errorText.includes('failed to fetch') ||
        errorText.includes('network') ||
        errorText.includes('cors') ||
        this.errorName === 'TypeError') {
      return 'high';
    }

    // Medium: Parsing and timeout errors
    if (errorText.includes('timeout') ||
        errorText.includes('json') ||
        errorText.includes('abort') ||
        this.errorName === 'SyntaxError') {
      return 'medium';
    }

    // Default to low
    return 'low';
  }

  /**
   * Checks if this appears to be a network-related rejection.
   */
  public get isNetworkRelated(): boolean {
    const errorText = `${this.errorMessage} ${this.errorName || ''}`.toLowerCase();
    return errorText.includes('failed to fetch') ||
           errorText.includes('network') ||
           errorText.includes('cors') ||
           errorText.includes('connection');
  }

  /**
   * Checks if this appears to be a JavaScript runtime error.
   */
  public get isJavaScriptError(): boolean {
    const jsErrors = ['typeerror', 'referenceerror', 'syntaxerror', 'rangeerror'];
    return jsErrors.includes(this.errorName?.toLowerCase() ?? '');
  }

  /**
   * String representation of the Promise rejection error.
   */
  public toString(): string {
    return `Promise Rejection [${this.severity.toUpperCase()}]: ${this.errorMessage}`;
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
      severity: this.severity,
      isNetworkRelated: this.isNetworkRelated,
      isJavaScriptError: this.isJavaScriptError,
    };
  }
}