import { ErrorReport, SeverityLevel } from "./ErrorReport";

interface PromiseErrorData {
  id: string;
  createdAt: number;
  errorMessage: string;
  errorName?: string;
  stack?: string;
}

const extractErrorMessage = (promiseError: PromiseRejectionEvent): string => {
  const { reason } = promiseError;
  if (!reason) return 'Promise rejected with no reason';
  if (reason instanceof Error) return reason.message || 'Unknown error';
  if (typeof reason === 'string') return reason;
  if (typeof reason === 'object') {
    const message = reason.message || reason.error || reason.statusText;
    if (message) return message;
    if (reason.status) {
      return `${reason.status}: ${reason.statusText || 'Unknown'}`;
    }
  }
  return reason;
}

export class PromiseErrorReport implements ErrorReport {
  public readonly id: string;
  public readonly createdAt: number;

  public readonly errorMessage: string;
  public readonly errorName?: string;
  public readonly stack?: string;

  private constructor(data: PromiseErrorData) {
    this.id = data.id;
    this.createdAt = data.createdAt;

    this.errorMessage = data.errorMessage;
    this.errorName = data.errorName;
    this.stack = data.stack;

    Object.freeze(this);
  }

  public static create(data: PromiseErrorData): PromiseErrorReport {
    return new PromiseErrorReport(data);
  }

  public static fromPromiseRejectionEvent(id: string, createdAt: number, promiseError: PromiseRejectionEvent): PromiseErrorReport {
    const errorMessage = extractErrorMessage(promiseError);
    const errorName = promiseError.reason?.name;
    const stack = promiseError.reason?.stack;

    return new PromiseErrorReport({
      id,
      createdAt,
      errorMessage,
      errorName,
      stack,
    });
  }

  public get severity(): SeverityLevel {
    const errorText = `${this.errorMessage} ${this.errorName || ''}`.toLowerCase();

    // CRITICAL
    if (this.isCriticalSystemError(errorText)) return 'critical';

    // HIGH
    if (this.isHighSeverityError(errorText)) return 'high';

    // MEDIUM
    if (this.isMediumSeverityError(errorText)) return 'medium';

    // LOW
    return 'low';
  }

  public get rejectionType(): string {
    const errorText = `${this.errorMessage} ${this.errorName || ''}`.toLowerCase();

    // Network/connectivity errors
    if (this.hasNetworkPatterns(errorText)) return 'network';

    // JavaScript runtime errors
    if (this.hasJavaScriptPatterns()) return 'javascript';

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

  public toString(): string {
    const severity = this.severity.toUpperCase();
    const type = this.rejectionType.toUpperCase();
    return `PROMISE-REJECTION [${severity}] [${type}]: ${this.errorMessage}`;
  }

  public toJSON(): unknown {
    return {
      id: this.id,
      createdAt: this.createdAt,
      severity: this.severity,
      errorMessage: this.errorMessage,
      errorName: this.errorName,
      stack: this.stack,
      rejectionType: this.rejectionType,
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
    const jsErrors = ['typeerror', 'referenceerror', 'syntaxerror', 'rangeerror'];
    return jsErrors.some(error => this.errorName?.toLowerCase().includes(error));
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
