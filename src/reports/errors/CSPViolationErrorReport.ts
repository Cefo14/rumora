import { PerformanceTime } from "@/value-objects/PerformanceTime";
import { ErrorReport, SeverityLevel, UNKNOWN } from "./ErrorReport";

type ViolationType = 'script' | 'style' | 'network' | 'media' | 'frame' | 'font' | 'unknown';

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
 * Report for capturing and analyzing Content Security Policy (CSP) violations.
 * 
 * Provides structured information about security policy violations including
 * directive classification, violation source analysis, and security impact
 * assessment for better security monitoring and policy tuning.
 */
export class CSPViolationErrorReport implements ErrorReport {
  /** Unique identifier for the error report */
  public readonly id: string;
  
  /** Timestamp when the error report was created */
  public readonly createdAt: PerformanceTime;

  /** Timestamp when the error occurred */
  public readonly occurredAt: PerformanceTime;

  /**
   * CSP directive that was violated (e.g., script-src, style-src, connect-src).
   * 
   * Identifies which security policy rule was violated, essential for
   * understanding the type of security issue and appropriate response.
   */
  public readonly directive: string;

  /**
   * URI that was blocked by the CSP directive.
   * 
   * Contains the complete URI that triggered the violation, which can be
   * a resource URL, 'inline', 'eval', or other special CSP keywords.
   */
  public readonly blockedURI: string;

  /**
   * Source file where the violation occurred if available.
   * 
   * Helps identify the specific location in the codebase that triggered
   * the CSP violation for targeted fixes.
   */
  public readonly sourceFile?: string;

  /**
   * Line number within the source file where violation occurred.
   * 
   * Provides precise location information for debugging and fixing
   * CSP violations in the source code.
   */
  public readonly lineNumber?: number;

  /**
   * Column number within the line where violation occurred.
   * 
   * Offers fine-grained location information for identifying specific
   * expressions or resources that triggered the violation.
   */
  public readonly columnNumber?: number;

  private constructor(data: CSPViolationErrorData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.occurredAt = data.createdAt;
    this.directive = data.directive;
    this.blockedURI = data.blockedURI;
    this.sourceFile = data.sourceFile;
    this.lineNumber = data.lineNumber;
    this.columnNumber = data.columnNumber;

    Object.freeze(this);
  }

  /**
   * Creates a CSPViolationErrorReport from provided data.
   * 
   * @param data - Security policy violation error data
   * @returns New CSPViolationErrorReport instance
   */
  public static create(data: CSPViolationErrorData): CSPViolationErrorReport {
    return new CSPViolationErrorReport(data);
  }
  /**
   * Creates a CSPViolationErrorReport from a SecurityPolicyViolationEvent.
   * 
   * @param id - Unique identifier for the error report
   * @param violationEvent - SecurityPolicyViolationEvent from CSP violation
   * @returns New CSPViolationErrorReport instance with extracted violation data
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
   * Determines the severity level of the CSP violation.
   * 
   * Classification based on security impact and functionality disruption:
   * - CRITICAL: Script violations that can break core functionality or allow XSS
   * - HIGH: Style violations and API access blocks affecting user experience
   * - MEDIUM: Media and visual content blocks with moderate impact
   * - LOW: Optional resources and non-critical functionality blocks
   */
  public get severity(): SeverityLevel {
    const directive = this.directive;
    
    // CRITICAL - Script violations can break functionality or allow XSS
    if (directive.startsWith('script-src')) {
      // Eval is especially critical for security
      if (this.isEvalBlocked) return 'critical';
      // Inline scripts are critical, external scripts are high
      return this.isInlineViolation ? 'critical' : 'high';
    }

    // HIGH - Style violations affect UX significantly
    if (directive.startsWith('style-src')) {
      // Inline CSS is more critical than external
      return this.isInlineViolation ? 'high' : 'medium';
    }

    // HIGH - Network connections to core APIs
    if (directive.startsWith('connect-src')) {
      return 'high';
    }

    // HIGH - Frame violations can break embedded content
    if (directive.startsWith('frame-src') || directive.startsWith('child-src')) {
      return 'high';
    }

    // MEDIUM - Visual content affects UX but doesn't break functionality
    if (directive.startsWith('img-src') || directive.startsWith('media-src')) {
      return 'medium';
    }

    // MEDIUM - Font loading affects visual presentation
    if (directive.startsWith('font-src')) return 'medium';

    // LOW - Other directives are typically non-critical
    return 'low';
  }

  /**
   * Checks if the violation is from inline content (scripts, styles, etc.).
   * 
   * Inline violations often indicate unsafe practices that should be
   * refactored to use external resources with proper CSP nonces or hashes.
   */
  public get isInlineViolation(): boolean {
    return this.blockedURI === 'inline';
  }

  /**
   * Checks if the blocked resource is from a third-party domain.
   * 
   * Third-party violations may indicate unauthorized external resources
   * or missing CSP whitelist entries for legitimate services.
   */
  public get isThirdPartyViolation(): boolean {
    if (this.isSpecialURI) return false;
    
    try {
      const blockedHost = new URL(this.blockedURI).hostname;
      const currentHost = this.getCurrentHost();
      return blockedHost !== currentHost;
    } catch {
      return false;
    }
  }

  /**
   * Checks if the blocked resource is from the same origin.
   * 
   * Same-origin violations often indicate configuration issues or
   * missing CSP rules for legitimate application resources.
   */
  public get isSameOriginViolation(): boolean {
    if (this.isSpecialURI) return false;
    
    try {
      const blockedOrigin = new URL(this.blockedURI).origin;
      const currentOrigin = this.getCurrentOrigin();
      return blockedOrigin === currentOrigin;
    } catch {
      return false;
    }
  }

  /**
   * Checks if the violation involves eval() or unsafe-eval.
   * 
   * Eval violations are critical security issues that can enable
   * code injection attacks and should be addressed immediately.
   */
  public get isEvalBlocked(): boolean {
    return this.blockedURI === 'eval' || 
           this.blockedURI.includes('unsafe-eval');
  }

  /**
   * Gets the category of CSP violation for analysis and grouping.
   * @returns Violation type or 'unknown' if unable to categorize
   */
  public get violationType(): ViolationType {
    const directive = this.directive;
    
    if (directive.startsWith('script-src')) return 'script';
    if (directive.startsWith('style-src')) return 'style';
    if (directive.startsWith('connect-src')) return 'network';
    if (directive.startsWith('img-src') || directive.startsWith('media-src')) return 'media';
    if (directive.startsWith('frame-src') || directive.startsWith('child-src')) return 'frame';
    if (directive.startsWith('font-src')) return 'font';

    return UNKNOWN;
  }

  /**
   * Extracts the domain from the blocked URI.
   * 
   * Useful for analyzing violation patterns by domain and identifying
   * problematic third-party services or misconfigured resources.
   */
  public get blockedDomain(): string {
    if (this.isSpecialURI) {
      return this.blockedURI;
    }
    
    try {
      return new URL(this.blockedURI).hostname;
    } catch {
      return this.blockedURI;
    }
  }

  /**
   * Checks if the blocked URI is a special CSP keyword.
   * 
   * Special URIs like 'inline', 'eval', 'data:', etc. have specific
   * security implications and handling requirements.
   */
  public get isSpecialURI(): boolean {
    const specialURIs = ['inline', 'eval', 'data:', 'blob:', 'about:', 'javascript:'];
    return specialURIs.some(special => 
      this.blockedURI.startsWith(special) || this.blockedURI === special
    );
  }

  /**
   * String representation of the CSP violation.
   * 
   * @returns Formatted string with severity, type, and violation details
   */
  public toString(): string {
    const severity = this.severity.toUpperCase();
    const type = this.violationType.toUpperCase();
    const inline = this.isInlineViolation ? ' (inline)' : '';
    const thirdParty = this.isThirdPartyViolation ? ' (3rd party)' : '';
    
    return `CSP-VIOLATION [${severity}] [${type}] ${this.directive}: ${this.blockedURI}${inline}${thirdParty}`;
  }

  /**
   * JSON representation for serialization.
   * 
   * @returns Object with all violation data and computed security analysis
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
       * Severity level of the CSP violation
       * - critical: Severe violations breaking functionality or allowing XSS
       * - high: Major violations affecting user experience
       * - medium: Moderate violations with some impact
       * - low: Minor violations with minimal impact
       * @enum {string} 'critical' | 'high' | 'medium' | 'low'
       */
      severity: this.severity,
      /**
       * Directive that was violated (e.g., script-src, style-src)
       */
      directive: this.directive,
      /**
       * URI that was blocked by the CSP
       */
      blockedURI: this.blockedURI,
      /**
       * Domain of the blocked URI
       */
      blockedDomain: this.blockedDomain,
      /**
       * Source file where the violation occurred
       */
      sourceFile: this.sourceFile,
      /**
       * Line number within the source file where the violation occurred
       */
      lineNumber: this.lineNumber,
      /**
       * Column number within the source file where the violation occurred
       */
      columnNumber: this.columnNumber,
      /**
       * Indicates if the violation was due to inline content
       */
      isInlineViolation: this.isInlineViolation,
      /**
       * Indicates if the blocked resource is from a third-party domain
       */
      isThirdPartyViolation: this.isThirdPartyViolation,
      /**
       * Indicates if the blocked resource is from the same origin
       */
      isSameOriginViolation: this.isSameOriginViolation,
      /**
       * Indicates if eval() or unsafe-eval was blocked
       */
      isEvalBlocked: this.isEvalBlocked,
      /**
       * Indicates if the blocked URI is a special CSP keyword (inline, eval, data:, etc.)
       */
      isSpecialURI: this.isSpecialURI,
      /**
       * Category of CSP violation for analysis and grouping
       * - script: Violations related to script resources
       * - style: Violations related to style resources
       * - network: Violations related to network connections (APIs, websockets)
       * - media: Violations related to media resources (images, videos)
       * - frame: Violations related to frames and embedded content
       * - font: Violations related to font resources
       * - other: Violations not fitting other categories
       * @enum {string} 'script' | 'style' | 'network' | 'media' | 'frame' | 'font' | 'other'
       */
      violationType: this.violationType,
    };
  }

  private getCurrentHost(): string | null {
    try {
      return window.location.hostname;
    } catch {
      return null;
    }
  }

  private getCurrentOrigin(): string | null {
    try {
      return window.location.origin;
    } catch {
      return null;
    }
  }
}
