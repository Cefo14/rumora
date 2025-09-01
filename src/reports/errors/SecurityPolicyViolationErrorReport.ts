import { ErrorReport, SeverityLevel } from "./ErrorReport";

interface SecurityPolicyViolationErrorData {
  id: string;
  createdAt: number;
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
export class SecurityPolicyViolationErrorReport implements ErrorReport {
  /** Unique identifier for the error report */
  public readonly id: string;
  
  /** Timestamp when the error report was created */
  public readonly createdAt: number;

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

  private constructor(data: SecurityPolicyViolationErrorData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.directive = data.directive;
    this.blockedURI = data.blockedURI;
    this.sourceFile = data.sourceFile;
    this.lineNumber = data.lineNumber;
    this.columnNumber = data.columnNumber;

    Object.freeze(this);
  }

  /**
   * Creates a SecurityPolicyViolationErrorReport from provided data.
   * 
   * @param data - Security policy violation error data
   * @returns New SecurityPolicyViolationErrorReport instance
   */
  public static create(data: SecurityPolicyViolationErrorData): SecurityPolicyViolationErrorReport {
    return new SecurityPolicyViolationErrorReport(data);
  }

  /**
   * Creates a SecurityPolicyViolationErrorReport from a SecurityPolicyViolationEvent.
   * 
   * @param id - Unique identifier for the error report
   * @param createdAt - Timestamp when the error report was created
   * @param violationEvent - SecurityPolicyViolationEvent from CSP violation
   * @returns New SecurityPolicyViolationErrorReport instance with extracted violation data
   */
  public static fromSecurityPolicyViolationEvent(
    id: string, 
    createdAt: number, 
    violationEvent: SecurityPolicyViolationEvent
  ): SecurityPolicyViolationErrorReport {
    return new SecurityPolicyViolationErrorReport({
      id,
      createdAt,
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
   */
  public get violationType(): 'script' | 'style' | 'network' | 'media' | 'frame' | 'font' | 'other' {
    const directive = this.directive;
    
    if (directive.startsWith('script-src')) return 'script';
    if (directive.startsWith('style-src')) return 'style';
    if (directive.startsWith('connect-src')) return 'network';
    if (directive.startsWith('img-src') || directive.startsWith('media-src')) return 'media';
    if (directive.startsWith('frame-src') || directive.startsWith('child-src')) return 'frame';
    if (directive.startsWith('font-src')) return 'font';
    
    return 'other';
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
   * Checks if this violation requires immediate security attention.
   * 
   * Critical violations and high-severity inline violations typically
   * indicate security risks that should be addressed urgently.
   */
  public get requiresImmediateAction(): boolean {
    return this.severity === 'critical' || 
           (this.severity === 'high' && this.isInlineViolation);
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
   * Gets recommended action based on violation type and severity.
   */
  public get recommendedAction(): 'whitelist' | 'refactor' | 'investigate' | 'monitor' {
    if (this.isEvalBlocked) return 'refactor';
    if (this.isInlineViolation && this.severity === 'critical') return 'refactor';
    if (this.isSameOriginViolation) return 'whitelist';
    if (this.isThirdPartyViolation && this.severity === 'high') return 'investigate';
    return 'monitor';
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
  public toJSON(): unknown {
    return {
      id: this.id,
      createdAt: this.createdAt,
      severity: this.severity,
      directive: this.directive,
      blockedURI: this.blockedURI,
      blockedDomain: this.blockedDomain,
      sourceFile: this.sourceFile,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      violationType: this.violationType,
      isInlineViolation: this.isInlineViolation,
      isThirdPartyViolation: this.isThirdPartyViolation,
      isSameOriginViolation: this.isSameOriginViolation,
      isEvalBlocked: this.isEvalBlocked,
      isSpecialURI: this.isSpecialURI,
      requiresImmediateAction: this.requiresImmediateAction,
      recommendedAction: this.recommendedAction
    };
  }

  private getCurrentHost(): string {
    try {
      return window.location.hostname;
    } catch {
      return 'unknown';
    }
  }

  private getCurrentOrigin(): string {
    try {
      return window.location.origin;
    } catch {
      return 'unknown';
    }
  }
}
