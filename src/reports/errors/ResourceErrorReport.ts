import { PerformanceTimestamp } from "@/shared/PerformanceTimestamp";
import { ErrorReport, SeverityLevel } from "./ErrorReport";

interface ResourceErrorData {
  id: string;
  createdAt: PerformanceTimestamp;
  occurredAt: PerformanceTimestamp;
  resourceUrl: string;
  resourceType: string;
}

/**
 * Extracts resource type from ErrorEvent target element.
 * 
 * @param errorEvent - The ErrorEvent from resource loading failure
 * @returns Categorized resource type for analysis
 */
const getResourceType = (errorEvent: ErrorEvent): string => {
  const target = errorEvent.target as HTMLElement;
  const tagName = target.tagName.toLowerCase();

  if (tagName === 'link') {
    const rel = (target as HTMLLinkElement).rel;
    if (rel?.includes('stylesheet')) return 'stylesheet';
    if (rel?.includes('preload') || rel?.includes('prefetch')) return 'preload';
    if (rel?.includes('icon') || rel?.includes('shortcut')) return 'favicon';
    if (rel?.includes('manifest')) return 'manifest';
    return 'link';
  }
  
  if (tagName === 'object' || tagName === 'embed') {
    return 'object';
  }

  // Casos adicionales
  if (tagName === 'img') return 'image';
  if (tagName === 'video') return 'video';
  if (tagName === 'audio') return 'audio';
  if (tagName === 'source') return 'source';
  if (tagName === 'track') return 'track';

  return tagName;
};

/**
 * Extracts resource URL from ErrorEvent target element.
 * 
 * @param errorEvent - The ErrorEvent from resource loading failure
 * @returns Resource URL or 'unknown' if unable to determine
 */
const getResourceURL = (errorEvent: ErrorEvent): string => {
  const target = errorEvent.target as HTMLElement;
  if ('src' in target && target.src) return target.src as string;
  if ('href' in target && target.href) return target.href as string;
  if ('data' in target && target.data) return target.data as string;
  return 'unknown';
};

/**
 * Report for capturing and analyzing resource loading failures.
 * 
 * Provides structured error information including resource classification,
 * severity assessment based on resource criticality, and third-party/CDN
 * detection for better error monitoring and debugging capabilities.
 */
export class ResourceErrorReport implements ErrorReport {
  /** Unique identifier for the error report */
  public readonly id: string;
  
  /** Timestamp when the error report was created */
  public readonly createdAt: PerformanceTimestamp;

  /** Timestamp when the performance event occurred */
  public readonly occurredAt: PerformanceTimestamp;

  /**
   * URL of the resource that failed to load.
   * 
   * Contains the complete URL of the resource that caused the loading
   * error, essential for identifying and debugging failed resources.
   */
  public readonly resourceUrl: string;

  /**
   * Type of resource that failed to load (e.g., script, stylesheet, image).
   * 
   * Categorizes the resource type for severity assessment and targeted
   * analysis of different failure patterns.
   */
  public readonly resourceType: string;

  private constructor(data: ResourceErrorData) {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.occurredAt = data.occurredAt;
    this.resourceType = data.resourceType;
    this.resourceUrl = data.resourceUrl;

    Object.freeze(this);
  }

  /**
   * Creates a ResourceErrorReport from provided data.
   * 
   * @param data - Resource error data
   * @returns New ResourceErrorReport instance
   */
  public static create(data: ResourceErrorData): ResourceErrorReport {
    return new ResourceErrorReport(data);
  }

  /**
   * Creates a ResourceErrorReport from an ErrorEvent.
   * 
   * @param id - Unique identifier for the error report
   * @param createdAt - Timestamp when the error report was created
   * @param errorEvent - ErrorEvent from resource loading failure
   * @returns New ResourceErrorReport instance with extracted resource data
   */
  public static fromErrorEvent(id: string, createdAt: PerformanceTimestamp, errorEvent: ErrorEvent): ResourceErrorReport {
    const resourceUrl = getResourceURL(errorEvent);
    const resourceType = getResourceType(errorEvent);

    const data: ResourceErrorData = {
      id,
      createdAt,
      occurredAt: PerformanceTimestamp.fromRelativeTime(errorEvent.timeStamp),
      resourceUrl,
      resourceType,
    };

    return new ResourceErrorReport(data);
  }

  /**
   * Determines the severity level of the resource loading failure.
   * 
   * Classification based on resource criticality and failure impact:
   * - CRITICAL: First-party scripts that break application functionality
   * - HIGH: Stylesheets and critical resources affecting user experience
   * - MEDIUM: Images and interactive content affecting visual presentation
   * - LOW: Media content and non-essential resources
   */
  public get severity(): SeverityLevel {
    // CRITICAL - First-party scripts are application-breaking
    if (this.resourceType === 'script' && !this.isThirdParty) {
      return 'critical';
    }

    // HIGH - Third-party scripts and all stylesheets affect major functionality
    if (this.resourceType === 'script' && this.isThirdParty) {
      return 'high';
    }
    
    if (['stylesheet', 'link'].includes(this.resourceType)) {
      return 'high';
    }

    // MEDIUM - Visual and interactive content
    if (['image', 'img', 'iframe', 'object', 'embed'].includes(this.resourceType)) {
      return 'medium';
    }

    // LOW - Media and supplementary content
    if (['video', 'audio', 'source', 'track', 'favicon', 'manifest'].includes(this.resourceType)) {
      return 'low';
    }

    // DEFAULT for unknown resource types
    return 'low';
  }

  /**
   * Determines if the resource is loaded from a different domain.
   * 
   * Third-party resources often indicate external dependencies that
   * may fail due to network issues outside of application control.
   */
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

  /**
   * Determines if this is a critical resource for application functionality.
   * 
   * Critical resources are those that significantly impact user experience
   * or application functionality when they fail to load.
   */
  public get isCriticalResource(): boolean {
    return this.resourceType === 'script' || 
           this.resourceType === 'stylesheet' ||
           this.resourceType === 'link';
  }

  /**
   * Extracts the domain name from the resource URL.
   * 
   * Useful for categorizing failures by domain and identifying
   * patterns in third-party service reliability.
   */
  public get resourceDomain(): string {
    if (this.resourceUrl === 'unknown') return 'unknown';
    
    try {
      return new URL(this.resourceUrl).hostname;
    } catch {
      return 'invalid-url';
    }
  }

  /**
   * Checks if the resource is loaded from a known CDN.
   * 
   * CDN failures often indicate network issues rather than application problems.
   */
  public get isFromCDN(): boolean {
    const cdnPatterns = [
      // Popular JavaScript CDNs
      'cdn.jsdelivr.net',
      'cdnjs.cloudflare.com', 
      'unpkg.com',
      'ajax.googleapis.com',
      'code.jquery.com',
      
      // CSS Framework CDNs
      'stackpath.bootstrapcdn.com',
      'maxcdn.bootstrapcdn.com',
      'use.fontawesome.com',
      
      // Cloud CDNs
      'amazonaws.com',
      'cloudfront.net',
      'azureedge.net',
      'github.io',
      'gitcdn.xyz',
      
      // Image CDNs
      'images.unsplash.com',
      'via.placeholder.com',
      'picsum.photos',
      
      // Font CDNs
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'use.typekit.net'
    ];

    return cdnPatterns.some(pattern => 
      this.resourceDomain.includes(pattern)
    );
  }

  /**
   * String representation of the resource loading error.
   * 
   * @returns Formatted string with severity, type, and location details
   */
  public toString(): string {
    const severity = this.severity.toUpperCase();
    const thirdParty = this.isThirdParty ? ' (3rd party)' : '';
    const cdn = this.isFromCDN ? ' (CDN)' : '';

    return `RESOURCE [${severity}]: Failed to load ${this.resourceType} - ${this.resourceUrl}${thirdParty}${cdn}`;
  }

  /**
   * JSON representation for serialization.
   * 
   * @returns Object with all resource error data and computed analysis
   */
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
