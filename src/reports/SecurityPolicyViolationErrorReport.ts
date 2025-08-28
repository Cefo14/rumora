import { ErrorReport, SeverityLevel } from "./ErrorReport";

interface SecurityPolicyViolationErrorData {
  id: string;
  createdAt: number;
  violationEvent: SecurityPolicyViolationEvent;
}

export class SecurityPolicyViolationErrorReport implements ErrorReport {
  public readonly id: string;
  public readonly createdAt: number;
  public readonly severity: SeverityLevel;

  public readonly directive: string;
  public readonly blockedURI: string;
  public readonly sourceFile?: string;
  public readonly lineNumber?: number;
  public readonly columnNumber?: number;

  constructor(data: SecurityPolicyViolationErrorData) {
    this.id = data.id;
    this.createdAt = data.createdAt;

    const { violationEvent } = data;

    this.directive = violationEvent.effectiveDirective;
    this.blockedURI = violationEvent.blockedURI;
    this.sourceFile = violationEvent.sourceFile;
    this.lineNumber = violationEvent.lineNumber;
    this.columnNumber = violationEvent.columnNumber;

    this.severity = this.calculateSeverity();
  }

  private calculateSeverity(): SeverityLevel {
    const directive = this.directive;
    
    // CRITICAL - Errores que pueden romper funcionalidad core
    if (directive.startsWith('script-src')) {
      // Eval es especialmente crítico
      if (this.isEvalBlocked()) return 'critical';
      // Script inline es crítico, external es high
      return this.isInlineViolation ? 'critical' : 'high';
    }

    // HIGH - Afectan UX significativamente
    if (directive.startsWith('style-src')) {
      // CSS inline es más crítico que external
      return this.isInlineViolation ? 'high' : 'medium';
    }

    if (directive.startsWith('connect-src')) {
      // APIs core son high, resto medium
      return this.isCoreAPI() ? 'high' : 'medium';
    }

    if (directive.startsWith('frame-src')) return 'high';

    // MEDIUM - Degradan UX pero no rompen funcionalidad
    if (directive.startsWith('img-src') || directive.startsWith('media-src')) {
      return 'medium';
    }

    if (directive.startsWith('font-src')) return 'medium';

    // LOW - Funcionalidades opcionales
    return 'low';
  }

  private isEvalBlocked(): boolean {
    return this.blockedURI === 'eval' || 
           this.blockedURI.includes('unsafe-eval');
  }

  private isCoreAPI(): boolean {
    const coreAPIPatterns = ['/api/', '/graphql', '/auth/', 'localhost'];
    const hasPattern = coreAPIPatterns.some(pattern => 
      this.blockedURI.includes(pattern)
    );
    
    // Same origin APIs are typically core
    if (this.isSameOriginViolation) return true;
    
    return hasPattern;
  }

  public get isInlineViolation(): boolean {
    return this.blockedURI === 'inline';
  }

  public get isThirdPartyViolation(): boolean {
    if (this.isSpecialURI()) return false;
    
    try {
      const blockedHost = new URL(this.blockedURI).hostname;
      const currentHost = this.getCurrentHost();
      return blockedHost !== currentHost;
    } catch {
      return false;
    }
  }

  public get isSameOriginViolation(): boolean {
    if (this.isSpecialURI()) return false;
    
    try {
      const blockedOrigin = new URL(this.blockedURI).origin;
      const currentOrigin = this.getCurrentOrigin();
      return blockedOrigin === currentOrigin;
    } catch {
      return false;
    }
  }

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

  public get blockedDomain(): string {
    if (this.isSpecialURI()) {
      return this.blockedURI;
    }
    
    try {
      return new URL(this.blockedURI).hostname;
    } catch {
      return this.blockedURI;
    }
  }

  public get requiresImmediateAction(): boolean {
    return this.severity === 'critical' || 
           (this.severity === 'high' && this.isInlineViolation);
  }

  public toString(): string {
    const severity = this.severity.toUpperCase();
    const type = this.violationType.toUpperCase();
    const inline = this.isInlineViolation ? ' (inline)' : '';
    const thirdParty = this.isThirdPartyViolation ? ' (3rd party)' : '';
    
    return `CSP-VIOLATION [${severity}] [${type}] ${this.directive}: ${this.blockedURI}${inline}${thirdParty}`;
  }

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
      requiresImmediateAction: this.requiresImmediateAction,
    };
  }

  private isSpecialURI(): boolean {
    const specialURIs = ['inline', 'eval', 'data:', 'blob:', 'about:', 'javascript:'];
    return specialURIs.some(special => 
      this.blockedURI.startsWith(special) || this.blockedURI === special
    );
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