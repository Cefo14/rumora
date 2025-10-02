import { PerformanceTime } from '@/value-objects/PerformanceTime';
import type { ErrorReport, SeverityLevel } from './ErrorReport';

interface CSPViolationErrorData {
  id: string;
  createdAt: PerformanceTime;
  occurredAt: PerformanceTime;
  directive: string;
  blockedURI: string;
  sourceFile?: string;
  lineNumber?: number;
  columnNumber?: number;
}

/**
 * Report for capturing Content Security Policy (CSP) violations.
 * 
 * Provides structured information about security policy violations
 * for monitoring and debugging CSP configurations.
 */
export class CSPViolationErrorReport implements ErrorReport {
  public readonly id: string;
  public readonly createdAt: PerformanceTime;
  public readonly occurredAt: PerformanceTime;
  public readonly directive: string;
  public readonly blockedURI: string;
  public readonly sourceFile?: string;
  public readonly lineNumber?: number;
  public readonly columnNumber?: number;

  private constructor(data: CSPViolationErrorData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.occurredAt = data.occurredAt;
    this.directive = data.directive;
    this.blockedURI = data.blockedURI;
    this.sourceFile = data.sourceFile;
    this.lineNumber = data.lineNumber;
    this.columnNumber = data.columnNumber;

    Object.freeze(this);
  }

  /**
   * Creates a CSPViolationErrorReport from provided data.
   */
  public static create(data: CSPViolationErrorData): CSPViolationErrorReport {
    return new CSPViolationErrorReport(data);
  }

  /**
   * Creates a CSPViolationErrorReport from a SecurityPolicyViolationEvent.
   */
  public static fromSecurityPolicyViolationEvent(
    id: string, 
    violationEvent: SecurityPolicyViolationEvent
  ): CSPViolationErrorReport {
    return new CSPViolationErrorReport({
      id,
      createdAt: PerformanceTime.now(),
      occurredAt: PerformanceTime.fromRelativeTime(violationEvent.timeStamp),
      directive: violationEvent.effectiveDirective,
      blockedURI: violationEvent.blockedURI,
      sourceFile: violationEvent.sourceFile,
      lineNumber: violationEvent.lineNumber,
      columnNumber: violationEvent.columnNumber,
    });
  }

  /**
   * Basic severity classification based on directive type.
   */
  public get severity(): SeverityLevel {
    // Critical: script-src violations, especially eval
    if (this.directive.startsWith('script-src')) {
      return this.isEvalBlocked || this.isInlineViolation ? 'critical' : 'high';
    }

    // High: style-src and connect-src violations
    if (this.directive.startsWith('style-src') || this.directive.startsWith('connect-src')) {
      return 'high';
    }

    // Medium: frame, img, media, font violations
    if (this.directive.startsWith('frame-src') || 
        this.directive.startsWith('img-src') || 
        this.directive.startsWith('media-src') ||
        this.directive.startsWith('font-src')) {
      return 'medium';
    }

    // Low: everything else
    return 'low';
  }

  /**
   * Checks if the violation involves inline content.
   */
  public get isInlineViolation(): boolean {
    return this.blockedURI === 'inline';
  }

  /**
   * Checks if eval() was blocked.
   */
  public get isEvalBlocked(): boolean {
    return this.blockedURI === 'eval' || this.blockedURI.includes('unsafe-eval');
  }

  /**
   * Checks if the blocked resource is from a third-party domain.
   */
  public get isThirdPartyViolation(): boolean {
    if (this.isSpecialURI) return false;
    
    try {
      const blockedHost = new URL(this.blockedURI).hostname;
      const currentHost = window.location.hostname;
      return blockedHost !== currentHost;
    } catch {
      return false;
    }
  }

  /**
   * Gets the domain from the blocked URI.
   */
  public get blockedDomain(): string {
    if (this.isSpecialURI) return this.blockedURI;
    
    try {
      return new URL(this.blockedURI).hostname;
    } catch {
      return this.blockedURI;
    }
  }

  /**
   * Checks if the blocked URI is a special CSP keyword.
   */
  public get isSpecialURI(): boolean {
    const specialURIs = ['inline', 'eval', 'data:', 'blob:', 'about:', 'javascript:'];
    return specialURIs.some(special => 
      this.blockedURI.startsWith(special) || this.blockedURI === special
    );
  }

  /**
   * String representation of the CSP violation.
   */
  public toString(): string {
    const inline = this.isInlineViolation ? ' [inline]' : '';
    const thirdParty = this.isThirdPartyViolation ? ' [3rd-party]' : '';
    return `CSP Violation [${this.severity.toUpperCase()}]: ${this.directive} blocked ${this.blockedURI}${inline}${thirdParty}`;
  }

  /**
   * JSON representation for serialization.
   */
  public toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt.absoluteTime,
      occurredAt: this.occurredAt.absoluteTime,
      directive: this.directive,
      blockedURI: this.blockedURI,
      blockedDomain: this.blockedDomain,
      sourceFile: this.sourceFile,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      severity: this.severity,
      isInlineViolation: this.isInlineViolation,
      isEvalBlocked: this.isEvalBlocked,
      isThirdPartyViolation: this.isThirdPartyViolation,
      isSpecialURI: this.isSpecialURI
    };
  }
}