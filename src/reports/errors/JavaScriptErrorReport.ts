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

const extractErrorMessage = (errorEvent: ErrorEvent): string => {
  if (errorEvent.message) return errorEvent.message;
  if (errorEvent.error?.message) return errorEvent.error.message;
  return 'Unknown JavaScript error';
};

export class JavaScriptErrorReport implements ErrorReport {
  public readonly id: string;
  public readonly createdAt: number;

  public readonly errorMessage: string;
  public readonly errorName?: string;
  public readonly stack?: string;
  public readonly filename?: string;
  public readonly lineNumber?: number;
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

  public static create(data: JavaScriptErrorData): JavaScriptErrorReport {
    return new JavaScriptErrorReport(data);
  }

  public static fromErrorEvent(id: string, createdAt: number, errorEvent: ErrorEvent): JavaScriptErrorReport {
    return new JavaScriptErrorReport({
      id: id,
      createdAt: createdAt,
      errorMessage: extractErrorMessage(errorEvent),
      errorName: errorEvent.error?.name,
      stack: errorEvent.error?.stack,
      filename: errorEvent.filename,
      lineNumber: errorEvent.lineno,
      columnNumber: errorEvent.colno,
    });
  }

  public get severity(): SeverityLevel {
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
    };
  }
}