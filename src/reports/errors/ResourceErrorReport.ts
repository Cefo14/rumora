import { ErrorReport, SeverityLevel } from "./ErrorReport";

interface ResourceErrorData {
  id: string;
  createdAt: number;
  resourceUrl: string;
  resourceType: string;
}

const getResourceType = (errorEvent: ErrorEvent): string => {
  const target = errorEvent.target as HTMLElement;
  const tagName = target.tagName.toLowerCase();

  if (tagName === 'link') {
    const rel = (target as HTMLLinkElement).rel;
    if (rel?.includes('stylesheet')) return 'stylesheet';
    if (rel?.includes('preload') || rel?.includes('prefetch')) return 'preload';
    return 'link';
  }
  
  if (tagName === 'object' || tagName === 'embed') {
    return 'object';
  }

  return tagName;
}

const getResourceURL = (errorEvent: ErrorEvent): string => {
  const target = errorEvent.target as HTMLElement;
  if ('src' in target && target.src) return target.src as string;
  if ('href' in target && target.href) return target.href as string;
  if ('data' in target && target.data) return target.data as string;
  return 'unknown';
}

export class ResourceErrorReport implements ErrorReport {
  public readonly id: string;
  public readonly createdAt: number;

  public readonly resourceUrl: string;
  public readonly resourceType: string;

  private constructor(data: ResourceErrorData) {
    this.id = data.id;
    this.createdAt = data.createdAt;

    this.resourceType = data.resourceType;
    this.resourceUrl = data.resourceUrl;

    Object.freeze(this);
  }

  static create(data: ResourceErrorData): ResourceErrorReport {
    return new ResourceErrorReport(data);
  }

  static fromErrorEvent(id: string, createdAt: number, errorEvent: ErrorEvent): ResourceErrorReport {
    const resourceUrl = getResourceURL(errorEvent);
    const resourceType = getResourceType(errorEvent);

    const data: ResourceErrorData = {
      id,
      createdAt,
      resourceUrl,
      resourceType,
    };

    return new ResourceErrorReport(data);
  }

  public get severity(): SeverityLevel {
    // CRITICAL 
    if (this.resourceType === 'script') {
      return this.isThirdParty ? 'high' : 'critical';
    }

    // HIGH
    if (this.resourceType === 'stylesheet' || this.resourceType === 'link') {
      return 'high';
    }

    // MEDIUM
    if (this.resourceType === 'image' || this.resourceType === 'img') {
      return 'medium';
    }

    if (this.resourceType === 'iframe') {
      return 'medium';
    }

    // LOW
    if (['video', 'audio', 'source', 'track'].includes(this.resourceType)) {
      return 'low';
    }

    // DEFAULT
    return 'low';
  }

  public get isThirdParty(): boolean {
    if (this.resourceUrl === 'unknown') return false;
    
    try {
      const resourceHost = new URL(this.resourceUrl).hostname;
      const currentHost = window.location.hostname;
      return resourceHost !== currentHost;
    } catch {
      return false;
    }
  }

  public get isCriticalResource(): boolean {
    return this.resourceType === 'script' || 
           this.resourceType === 'stylesheet' ||
           this.resourceType === 'link';
  }

  public get resourceDomain(): string {
    if (this.resourceUrl === 'unknown') return 'unknown';
    
    try {
      return new URL(this.resourceUrl).hostname;
    } catch {
      return 'invalid-url';
    }
  }

  public get isFromCDN(): boolean {
    const cdnPatterns = [
      'cdn.jsdelivr.net',
      'cdnjs.cloudflare.com', 
      'unpkg.com',
      'ajax.googleapis.com',
      'code.jquery.com',
      'stackpath.bootstrapcdn.com',
      'maxcdn.bootstrapcdn.com',
    ];

    return cdnPatterns.some(pattern => 
      this.resourceDomain.includes(pattern)
    );
  }

  public toString(): string {
    const severity = this.severity.toUpperCase();
    const thirdParty = this.isThirdParty ? ' (3rd party)' : '';
    const cdn = this.isFromCDN ? ' (CDN)' : '';

    return `RESOURCE [${severity}]: Failed to load ${this.resourceType} - ${this.resourceUrl}${thirdParty}${cdn}`;
  }

  public toJSON(): unknown {
    return {
      id: this.id,
      createdAt: this.createdAt,
      severity: this.severity,
      resourceUrl: this.resourceUrl,
      resourceType: this.resourceType,
      resourceDomain: this.resourceDomain,
      isThirdParty: this.isThirdParty,
      isCriticalResource: this.isCriticalResource,
      isFromCDN: this.isFromCDN,
    };
  }
}
