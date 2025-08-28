import { ErrorReport, SeverityLevel } from "./ErrorReport";

interface JavaScriptErrorDTO {
  id: string;
  createdAt: number;
  errorEvent: ErrorEvent;
}

export class JavaScriptErrorReport implements ErrorReport {
  public readonly id: string;
  public readonly createdAt: number;
  public readonly severity: SeverityLevel;

  public readonly errorMessage: string;
  public readonly errorName?: string;
  public readonly stack?: string;
  public readonly filename?: string;
  public readonly lineNumber?: number;
  public readonly columnNumber?: number;

  constructor(data: JavaScriptErrorDTO) {
    const { errorEvent } = data;

    this.id = data.id;
    this.createdAt = data.createdAt;

    this.errorMessage = this.extractErrorMessage(errorEvent);
    this.errorName = errorEvent.error?.name;
    this.stack = errorEvent.error?.stack;
    this.filename = errorEvent.filename;
    this.lineNumber = errorEvent.lineno;
    this.columnNumber = errorEvent.colno;

    this.severity = this.calculateSeverity();
  }


  public get isThirdPartyScript(): boolean {
    if (!this.filename) return false;
    
    try {
      const scriptHost = new URL(this.filename).hostname;
      const currentHost = window.location.hostname;
      return scriptHost !== currentHost;
    } catch {
      return false;
    }
  }

  public get isCORSError(): boolean {
    return this.errorMessage === 'Script error.' && !this.stack;
  }

  public toString(): string {
    const severity = this.severity.toUpperCase();
    const location = this.filename ? ` at ${this.filename}:${this.lineNumber}` : '';
    return `JAVASCRIPT [${severity}]: ${this.errorMessage}${location}`;
  }

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
      isCORSError: this.isCORSError,
    };
  }

  private extractErrorMessage(errorEvent: ErrorEvent): string {
    if (errorEvent.message) return errorEvent.message;
    if (errorEvent.error?.message) return errorEvent.error.message;
    return 'Unknown JavaScript error';
  }

  private calculateSeverity(): SeverityLevel {
    const errorName = this.errorName?.toLowerCase();
    const errorMessage = this.errorMessage.toLowerCase();

    // CRITICAL
    if (errorName === 'syntaxerror') return 'critical';
    if (errorMessage.includes('out of memory')) return 'critical';
    if (errorMessage.includes('maximum call stack')) return 'critical';
    if (errorMessage.includes('script error')) return 'critical'; // CORS script errors

    // HIGH
    if (errorName === 'typeerror') return 'high';
    if (errorName === 'referenceerror') return 'high';
    if (errorMessage.includes('cannot read prop')) return 'high';
    if (errorMessage.includes('undefined is not')) return 'high';
    if (errorMessage.includes('is not a function')) return 'high';
    if (errorMessage.includes('is not defined')) return 'high';

    // MEDIUM
    if (errorName === 'rangeerror') return 'medium';
    if (errorName === 'urierror') return 'medium';
    if (errorName === 'evalerror') return 'medium';
    if (errorMessage.includes('failed to fetch')) return 'medium';

    // LOW
    return 'low';
  }
}